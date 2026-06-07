package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/url"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"google.golang.org/genai"
)

type CommentGenerator struct {
	discussionRepo     domain.DiscussionRepository
	commentRepo        domain.CommentRepository
	projectPremiseProv domain.ProjectPremiseProvider
	urlFetcher         domain.URLContentFetcher
	factory            *domain.CommentFactory
	clockSrv           clock.Service
	client             *genai.Client
}

func NewCommentGenerator(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	projectPremiseProv domain.ProjectPremiseProvider,
	urlFetcher domain.URLContentFetcher,
	factory *domain.CommentFactory,
	clockSrv clock.Service,
	apiKey string,
) (*CommentGenerator, error) {
	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return nil, fmt.Errorf("gemini api key is required")
	}

	client, err := genai.NewClient(context.Background(), &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	return &CommentGenerator{
		discussionRepo:     discussionRepo,
		commentRepo:        commentRepo,
		projectPremiseProv: projectPremiseProv,
		urlFetcher:         urlFetcher,
		factory:            factory,
		clockSrv:           clockSrv,
		client:             client,
	}, nil
}

func (cg *CommentGenerator) GenerateChildComments(ctx context.Context, params domain.GenerateChildCommentsParams) (domain.CommentGenerationResult, error) {
	discussion, projectPremise, path, children, err := cg.fetchContext(ctx, params)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	prompt := cg.buildPrompt(discussion, projectPremise, path, children, params.CommentType)

	slog.Info(
		"Generating child comments with AI",
		slog.String("prompt", prompt),
		slog.Int("prompt_length", len(prompt)),
	)

	contents, tokens, err := cg.generateWithAI(ctx, prompt)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	comments, err := cg.createComments(params, contents)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}
	return domain.CommentGenerationResult{Comments: comments, Tokens: tokens}, nil
}

func (cg *CommentGenerator) fetchContext(
	ctx context.Context,
	params domain.GenerateChildCommentsParams,
) (*domain.Discussion, string, []*domain.Comment, []*domain.Comment, error) {
	discussion, err := cg.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          params.DiscussionID,
		WorkspaceID: params.WorkspaceID,
	})
	if err != nil {
		return nil, "", nil, nil, err
	}

	projectPremise, err := cg.projectPremiseProv.GetProjectPremise(ctx, params.WorkspaceID, discussion.ProjectID())
	if err != nil {
		return nil, "", nil, nil, err
	}

	var path []*domain.Comment
	if params.ParentCommentID != "" {
		p, err := cg.commentRepo.GetPathToRoot(ctx, params.ParentCommentID)
		if err != nil {
			return nil, "", nil, nil, err
		}
		slices.Reverse(p)
		path = p
	}

	children, err := cg.commentRepo.ListChildren(ctx, domain.ListCommentChildrenParams{
		DiscussionID:    params.DiscussionID,
		ParentCommentID: params.ParentCommentID,
		CommentType:     params.CommentType,
	})
	if err != nil {
		return nil, "", nil, nil, err
	}

	return discussion, projectPremise, path, children, nil
}

func (cg *CommentGenerator) generateWithAI(ctx context.Context, prompt string) ([]string, int32, error) {
	config := &genai.GenerateContentConfig{
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingLevel: genai.ThinkingLevelHigh,
		},
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeArray,
			Items: &genai.Schema{
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"content": {
						Type: genai.TypeString,
					},
				},
				Required: []string{"content"},
			},
		},
	}

	resp, err := cg.client.Models.GenerateContent(
		ctx,
		"gemini-3.1-flash-lite",
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to generate content: %w", err)
	}

	var generated []struct {
		Content string `json:"content"`
	}

	if err := json.Unmarshal([]byte(resp.Text()), &generated); err != nil {
		return nil, 0, fmt.Errorf("failed to unmarshal AI response: %w, response: %s", err, resp.Text())
	}

	contents := make([]string, len(generated))
	for i, g := range generated {
		contents[i] = g.Content
	}

	var tokens int32
	if resp.UsageMetadata != nil {
		tokens = resp.UsageMetadata.TotalTokenCount
	}
	return contents, tokens, nil
}

func (cg *CommentGenerator) createComments(params domain.GenerateChildCommentsParams, contents []string) ([]*domain.Comment, error) {
	result := make([]*domain.Comment, 0, len(contents))
	for _, content := range contents {
		c, err := cg.factory.Create(domain.CreateCommentParams{
			DiscussionID:    params.DiscussionID,
			ParentCommentID: params.ParentCommentID,
			Body: domain.CommentBody{
				Type:    params.CommentType,
				Content: content,
			},
			Status:    domain.CommentStatusProposed,
			CreatedBy: params.UserID,
		})
		if err != nil {
			return nil, err
		}
		result = append(result, c)
	}
	return result, nil
}

func (cg *CommentGenerator) buildPrompt(discussion *domain.Discussion, projectPremise string, path []*domain.Comment, children []*domain.Comment, commentType string) string {
	var sb strings.Builder
	cg.writeSystemContext(&sb)
	cg.writePremises(&sb, projectPremise, discussion.Premise())
	cg.writeDiscussionTheme(&sb, discussion)
	cg.writeContext(&sb, path)
	cg.writeChildren(&sb, children)
	cg.writeInstructions(&sb, commentType)
	return sb.String()
}

func (cg *CommentGenerator) writeSystemContext(sb *strings.Builder) {
	sb.WriteString("<system_context>\n")
	sb.WriteString("You are the core reasoning engine of a structured discussion platform. Your purpose is to help users organize complex thinking into rigorous, navigable argument trees.\n\n")
	sb.WriteString("Platform mechanics you MUST understand:\n")
	sb.WriteString("1. DISCUSSION STRUCTURE: Each discussion has a theme (central question), premise (foundational assumptions), and conclusion (synthesis). Comments form tree structures beneath the theme.\n")
	sb.WriteString("2. COMMENT TREE: Comments form multiple trees. Each comment has exactly one parent (or is root-level). A comment's meaning is defined by its position in the tree and its type.\n")
	sb.WriteString("3. PREMISE CHAIN: A comment implicitly accepts ALL its ancestors as premises. If root comment A has child B which has child C, then C assumes both A and B are true. Your generated comments MUST be logically consistent with every ancestor in the chain — never contradict them.\n")
	sb.WriteString("4. COMMENT TYPES: Each comment has a type indicating its rhetorical role (e.g., claim, evidence, question, answer, objection, proposal). Types are dynamic per discussion — use only the types present in the context.\n")
	sb.WriteString("5. ATOMICITY: Each comment expresses exactly ONE idea. Complex points must be split into multiple comments at the same tree level.\n")
	sb.WriteString("6. DIRECTION: Comments flow from child to parent (child responds to parent). The tree structure itself encodes logical relationships — do not express relationships through connecting phrases within comment text.\n")
	sb.WriteString("</system_context>\n\n")
}

func (cg *CommentGenerator) writePremises(sb *strings.Builder, projectPremise, discussionPremise string) {
	if projectPremise != "" {
		fmt.Fprintf(sb, "<project_premise>\n%s\n</project_premise>\n\n", projectPremise)
	}
	if discussionPremise != "" {
		fmt.Fprintf(sb, "<discussion_premise>\n%s\n</discussion_premise>\n\n", discussionPremise)
	}
}

func (cg *CommentGenerator) writeDiscussionTheme(sb *strings.Builder, discussion *domain.Discussion) {
	fmt.Fprintf(sb, "<discussion_theme>\n%s\n</discussion_theme>\n\n", discussion.Theme())
}

func (cg *CommentGenerator) writeContext(sb *strings.Builder, path []*domain.Comment) {
	if len(path) == 0 {
		return
	}
	sb.WriteString("<ancestor_comments description=\"These form a logical premise chain. Your comments MUST be consistent with ALL of them. They are ordered root (1) to immediate parent (last).\">\n")
	for i, c := range path {
		fmt.Fprintf(sb, "<comment index=\"%d\" type=\"%s\">\n%s\n</comment>\n", i+1, c.Type(), c.Content())
	}
	sb.WriteString("</ancestor_comments>\n\n")
}

func (cg *CommentGenerator) writeChildren(sb *strings.Builder, children []*domain.Comment) {
	if len(children) == 0 {
		return
	}
	sb.WriteString("<existing_comments description=\"Do NOT duplicate these\">\n")
	for i, c := range children {
		fmt.Fprintf(sb, "<comment index=\"%d\" type=\"%s\">\n%s\n</comment>\n", i+1, c.Type(), c.Content())
	}
	sb.WriteString("</existing_comments>\n\n")
}

func (cg *CommentGenerator) writeInstructions(sb *strings.Builder, commentType string) {
	sb.WriteString("<instructions>\n")
	fmt.Fprintf(sb, "Generate exactly 3 comments of type \"%s\" that respond to the immediate parent comment (or the discussion theme if no parent exists).\n\n", commentType)

	sb.WriteString("## Generation Process\n\n")

	sb.WriteString("### Step 1: Analyze the premise chain\n")
	sb.WriteString("- Read ALL ancestor comments from root to immediate parent. Each ancestor is an accepted premise.\n")
	sb.WriteString("- Identify what is already established, what logical gaps remain, and what angles are unexplored.\n")
	sb.WriteString("- Note which aspects the existing sibling comments already cover — you must NOT overlap with them.\n\n")

	sb.WriteString("### Step 2: Understand the target type\n")
	fmt.Fprintf(sb, "- You are generating comments of type \"%s\". This type defines the rhetorical role your comments play relative to their parent.\n", commentType)
	sb.WriteString("- Infer the meaning of this type from context: how it relates to the parent comment and the ancestor chain.\n")
	sb.WriteString("- Each comment must clearly fulfill this rhetorical role — if the type is \"evidence\", provide concrete evidence; if \"question\", ask a genuine inquiry, etc.\n\n")

	sb.WriteString("### Step 3: Generate 3 differentiated comments\n")
	sb.WriteString("Each comment must approach the parent from a DISTINCT angle. Use different differentiation dimensions:\n")
	sb.WriteString("- Different evidence or data points\n")
	sb.WriteString("- Different stakeholder perspectives\n")
	sb.WriteString("- Different time horizons (short-term vs long-term)\n")
	sb.WriteString("- Different scopes (specific case vs general principle)\n")
	sb.WriteString("- Different causal chains or mechanisms\n")
	sb.WriteString("- Different domains of knowledge\n\n")

	sb.WriteString("## Constraints\n\n")

	sb.WriteString("### Logical consistency\n")
	sb.WriteString("- ALL ancestor comments are established premises. Your comments MUST NOT contradict any of them.\n")
	sb.WriteString("- Your comments must logically follow from or extend the premise chain.\n\n")

	sb.WriteString("### Atomicity\n")
	sb.WriteString("- Each comment expresses exactly ONE clear idea. If you have multiple points, each becomes its own comment.\n")
	sb.WriteString("- No compound statements, no conjunctions linking independent ideas.\n\n")

	sb.WriteString("### Non-overlap\n")
	sb.WriteString("- NEVER duplicate, paraphrase, or semantically overlap with existing sibling comments.\n")
	sb.WriteString("- Before generating, check what existing siblings already say and deliberately fill gaps they leave.\n\n")

	sb.WriteString("### Specificity\n")
	sb.WriteString("- Prefer concrete examples, data, scenarios, and named entities over abstract statements.\n")
	sb.WriteString("- Avoid vague qualifiers (\"some people say\", \"it could be argued\") — be direct and specific.\n\n")

	sb.WriteString("## Style\n")
	sb.WriteString("- Match the language, tone, and formality of the existing comments exactly.\n")
	sb.WriteString("- Keep each comment concise (1-3 sentences).\n")
	sb.WriteString("- No meta-commentary, hedging, greetings, sign-offs, or self-referential language.\n")
	sb.WriteString("- Do not reference being an AI or reference the generation process.\n")
	sb.WriteString("- Match the punctuation style and formatting conventions of the context.\n")
	sb.WriteString("</instructions>")
}

type generatedDiscussionComment struct {
	Type        string `json:"type"`
	Content     string `json:"content"`
	ParentIndex int    `json:"parent_index"`
}

type generatedDiscussion struct {
	Theme      string                       `json:"theme"`
	Premise    string                       `json:"premise"`
	Conclusion string                       `json:"conclusion"`
	Comments   []generatedDiscussionComment `json:"comments"`
}

func (cg *CommentGenerator) GenerateDiscussion(ctx context.Context, params domain.GenerateDiscussionParams) (domain.DiscussionGenerationResult, error) {
	if params.Text != "" && len(params.URLs) != 0 {
		return domain.DiscussionGenerationResult{}, fmt.Errorf("text and URLs cannot be provided at the same time")
	}
	if params.Text == "" && len(params.URLs) == 0 {
		return domain.DiscussionGenerationResult{}, fmt.Errorf("either text or URLs must be provided")
	}

	projectPremise, err := cg.projectPremiseProv.GetProjectPremise(ctx, params.WorkspaceID, params.ProjectID)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	var fetchedContents []fetchedURLContent
	var youtubeURLs []string
	if len(params.URLs) > 0 {
		var fetchURLs []string
		for _, u := range params.URLs {
			if isYouTubeURL(u) {
				youtubeURLs = append(youtubeURLs, u)
			} else {
				fetchURLs = append(fetchURLs, u)
			}
		}
		if len(fetchURLs) > 0 {
			results := cg.fetchURLContents(ctx, fetchURLs)
			for _, r := range results {
				if r.err != nil {
					slog.Warn("Failed to fetch URL content", slog.String("url", r.url), slog.String("error", r.err.Error()))
					continue
				}
				fetchedContents = append(fetchedContents, fetchedURLContent{url: r.url, content: r.content})
			}
		}
		if len(fetchedContents) == 0 && len(youtubeURLs) == 0 && params.Text == "" {
			return domain.DiscussionGenerationResult{}, fmt.Errorf("failed to fetch any URL content")
		}
	}

	prompt := cg.buildGenerateDiscussionPrompt(projectPremise, params.Title, params.Text, fetchedContents, youtubeURLs, params.Language, params.CommentFrame)

	slog.Info(
		"Generating discussion with AI",
		slog.String("prompt", prompt),
		slog.Int("prompt_length", len(prompt)),
	)

	generated, tokens, err := cg.generateFullDiscussionWithAI(ctx, prompt, youtubeURLs, params.ModelLevel)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	comments, err := cg.createGeneratedDiscussionComments(params, generated.Comments)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	return domain.DiscussionGenerationResult{
		Theme:      generated.Theme,
		Premise:    generated.Premise,
		Conclusion: generated.Conclusion,
		Language:   params.Language,
		Comments:   comments,
		Tokens:     tokens,
	}, nil
}

type fetchedURLContent struct {
	url     string
	content string
}

type fetchResult struct {
	url     string
	content string
	err     error
}

func (cg *CommentGenerator) fetchURLContents(ctx context.Context, urls []string) []fetchResult {
	results := make([]fetchResult, len(urls))
	var wg sync.WaitGroup
	for i, u := range urls {
		wg.Add(1)
		go func(idx int, rawURL string) {
			defer wg.Done()
			content, err := cg.urlFetcher.Fetch(ctx, rawURL)
			results[idx] = fetchResult{url: rawURL, content: content, err: err}
		}(i, u)
	}
	wg.Wait()
	return results
}

func (cg *CommentGenerator) buildGenerateDiscussionPrompt(projectPremise string, title string, text string, fetchedContents []fetchedURLContent, youtubeURLs []string, lang domain.DiscussionLanguage, commentFrame domain.CommentFrame) string {
	var sb strings.Builder
	cg.writeSystemContext(&sb)
	if projectPremise != "" {
		fmt.Fprintf(&sb, "<project_premise>\n%s\n</project_premise>\n\n", projectPremise)
	}
	if title != "" {
		fmt.Fprintf(&sb, "<title>\n%s\n</title>\n\n", title)
	}
	if text != "" {
		fmt.Fprintf(&sb, "<source type=\"text\">\n%s\n</source>\n\n", text)
	}
	for _, fc := range fetchedContents {
		fmt.Fprintf(&sb, "<source type=\"url\" url=\"%s\">\n%s\n</source>\n\n", fc.url, fc.content)
	}
	for _, ytURL := range youtubeURLs {
		fmt.Fprintf(&sb, "<source type=\"youtube\" url=\"%s\">\nA YouTube video is attached at this URL. Its video and audio content is provided as a separate data part — analyze it directly.\n</source>\n\n", ytURL)
	}
	hasCommentFrame := len(commentFrame.Types) > 0
	cg.writeGenerateDiscussionInstructions(&sb, title != "", lang, hasCommentFrame)
	if hasCommentFrame {
		cg.writeCommentFrameConstraints(&sb, commentFrame)
	}
	return sb.String()
}

func (cg *CommentGenerator) writeGenerateDiscussionInstructions(sb *strings.Builder, hasTitle bool, lang domain.DiscussionLanguage, hasCommentFrame bool) {
	sb.WriteString("<instructions>\n")
	sb.WriteString("Transform the source material into a structured discussion tree that enables systematic exploration of the topic. Follow these steps precisely.\n\n")

	sb.WriteString("## Step 1: Deep Source Analysis\n\n")
	sb.WriteString("Before structuring, perform a thorough analysis of the source:\n")
	sb.WriteString("- Extract EVERY distinct element: claims, facts, data points, statistics, examples, anecdotes, assumptions, definitions, causal relationships, counterarguments, and implications.\n")
	sb.WriteString("- Classify each element by its argumentative role: Is it a main claim? Supporting evidence? A qualifier? A counterpoint? An illustration?\n")
	sb.WriteString("- Map explicit and implicit relationships: What supports what? What contradicts what? What causes what? What remains unresolved?\n")
	sb.WriteString("- Identify the source's underlying assumptions that are not directly stated but are necessary for its arguments to hold.\n\n")

	sb.WriteString("## Step 2: Define Discussion Structure\n\n")
	if hasTitle {
		sb.WriteString("- **Theme**: A concise question or statement (max 255 chars) capturing the core issue. Use the provided title as guidance for focus.\n")
	} else {
		sb.WriteString("- **Theme**: A concise question or statement (max 255 chars) capturing the core issue to be explored. Derive it from the source material's central tension or question.\n")
	}
	sb.WriteString("- **Premise**: Summarize the foundational assumptions, context, constraints, and definitions necessary to engage with the theme (max 4000 chars). This sets the stage — include relevant background that all commenters should accept as given.\n")
	sb.WriteString("- **Conclusion**: Synthesize the key findings, open questions, decision points, or areas of consensus/tension that emerge from the full discussion (max 1000 chars). This should reflect what the tree reveals, not just restate the premise.\n\n")

	sb.WriteString("## Step 3: Build the Comment Tree\n\n")
	sb.WriteString("Create a hierarchical comment structure where:\n")
	sb.WriteString("- **Root comments** (parent_index = -1): Introduce the major themes, primary claims, key questions, or central arguments from the source.\n")
	sb.WriteString("- **Child comments**: Deepen the analysis by providing evidence, examples, counterpoints, implications, mechanisms, or sub-arguments for their parent.\n")
	sb.WriteString("- **Each branch** should explore multiple dimensions: why (causation), how (mechanism), evidence for (support), evidence against (objection), so what (implications), and what if (alternatives).\n\n")

	if hasCommentFrame {
		sb.WriteString("### Comment Type Semantics\n")
		sb.WriteString("- You MUST use ONLY the comment types listed in <comment_frame>. Do NOT invent, rename, or translate any type name.\n")
		sb.WriteString("- The type must precisely reflect the comment's rhetorical role in the argument structure relative to its parent.\n")
		sb.WriteString("- Select the type from <comment_frame> that best fits each comment's role — never use a type outside that list.\n\n")
	} else {
		sb.WriteString("### Comment Type Semantics\n")
		sb.WriteString("- Use descriptive type names that match the source language (e.g., 'claim'/'主張', 'evidence'/'根拠', 'fact'/'事実', 'question'/'疑問', 'supplement'/'補足', 'example'/'例', 'objection'/'反論', 'implication'/'含意').\n")
		sb.WriteString("- The type must precisely reflect the comment's rhetorical role in the argument structure relative to its parent.\n")
		sb.WriteString("- Types are dynamic — choose names that best fit the source material's domain and argumentation style.\n\n")
	}

	sb.WriteString("### Comment Content Rules\n")
	sb.WriteString("- **Fidelity to Source**: NEVER alter, paraphrase, omit, or reinterpret the source material's content — even to fit the comment frame structure. If the source says X, your comment must say X, not a simplified, generalized, or restructured version of X. Do NOT add information not present in the source. Do NOT remove or merge distinct points from the source to reduce comment count.\n")
	sb.WriteString("- **Atomicity**: Each comment = exactly ONE idea. If a point has multiple facets, split into sibling or child comments.\n")
	sb.WriteString("- **Exhaustiveness**: Represent ALL substantive content from the source. Every fact, data point, example, statistic, name, date, and nuance must appear somewhere in the tree. Do NOT summarize away details.\n")
	sb.WriteString("- **No restatement**: Never restate the theme or premise in a comment. Every comment must add NEW information not already captured in ancestors.\n")
	sb.WriteString("- **Structural logic**: Express logical relationships through tree structure and comment type, NOT through connecting phrases like \"because\", \"however\", \"therefore\" within the comment text.\n")
	sb.WriteString("- **Specificity**: Preserve concrete details — specific numbers, names, dates, examples, and quotes from the source. Never generalize away precision.\n")
	sb.WriteString("- **Volume**: Generate as many comments as needed to fully capture the source. More atomic comments are always preferable to fewer compound ones. There is no upper limit.\n\n")

	sb.WriteString("### Tree Structure Rules\n")
	sb.WriteString("- Use parent_index to establish hierarchy: -1 for root comments, 0-based index of the parent comment for children.\n")
	if hasCommentFrame {
		sb.WriteString("- Build branches as deeply as the allowed parent-child paths in <comment_frame> permit. Follow only the listed paths — never exceed them.\n")
	} else {
		sb.WriteString("- Create deep branches (3-5 levels minimum) to explore ideas thoroughly. Shallow trees miss nuance.\n")
	}
	sb.WriteString("- Every major claim must have supporting evidence as children. Every piece of evidence must connect to a claim as parent. No orphaned information.\n")
	sb.WriteString("- Sibling comments at the same level must be DISTINCT — each covering a different facet, evidence, or angle. No paraphrasing between siblings.\n")
	sb.WriteString("- Balance breadth (covering all major themes) with depth (exploring each theme's implications thoroughly).\n\n")

	sb.WriteString("## Step 4: Self-Validation\n\n")
	sb.WriteString("Before finalizing, verify:\n")
	sb.WriteString("- Every piece of substantive information from the source appears somewhere in the tree.\n")
	sb.WriteString("- No source content has been altered, paraphrased, generalized, or reinterpreted — all comments faithfully represent what the source actually says.\n")
	sb.WriteString("- Every comment is atomic (one idea per comment).\n")
	sb.WriteString("- No comment contradicts its ancestors (all ancestors are premises for their descendants).\n")
	sb.WriteString("- No sibling comments overlap in meaning.\n")
	sb.WriteString("- Comment types accurately reflect each comment's role relative to its parent.\n")
	if hasCommentFrame {
		sb.WriteString("- Every comment type is exactly one of the types listed in <comment_frame>, and every parent-child pair matches an allowed path.\n")
	} else {
		sb.WriteString("- The tree has sufficient depth (3-5 levels) and breadth (all major themes covered).\n")
	}

	sb.WriteString("\n## Language and Style\n")
	fmt.Fprintf(sb, "- Use %s consistently for theme, premise, conclusion, and all comment content.\n", lang)
	sb.WriteString("- Write in a clear, factual, analytical tone appropriate to the source material.\n")
	sb.WriteString("- Keep each comment concise (1-3 sentences) while preserving essential detail.\n")
	sb.WriteString("- Do not include meta-commentary, hedging, or self-referential language.\n")
	sb.WriteString("</instructions>\n\n")
}

func (cg *CommentGenerator) writeCommentFrameConstraints(sb *strings.Builder, commentFrame domain.CommentFrame) {
	sb.WriteString("<comment_frame>\n")
	sb.WriteString("You MUST strictly follow this comment frame. These are the ONLY allowed comment types and parent-child relationships.\n\n")

	sb.WriteString("Allowed comment types:\n")
	for _, t := range commentFrame.Types {
		if t == "" {
			sb.WriteString("- (Root): Represents the discussion theme itself.\n")
		} else {
			fmt.Fprintf(sb, "- %s\n", t)
		}
	}
	sb.WriteString("\n")

	sb.WriteString("Allowed parent-child paths (Parent ← Child):\n")
	for _, p := range commentFrame.Paths {
		parentLabel := p.Parent
		if parentLabel == "" {
			parentLabel = "(Root)"
		}
		fmt.Fprintf(sb, "- %s ← %s\n", parentLabel, p.Child)
	}
	sb.WriteString("\n")

	sb.WriteString("Constraints:\n")
	sb.WriteString("- NEVER use a comment type not listed in 'Allowed comment types'.\n")
	sb.WriteString("- NEVER place a child comment under a parent if that (Parent ← Child) path is not listed in 'Allowed parent-child paths'.\n")
	sb.WriteString("- A path with Parent = (Root) means the child comment is a root-level comment (parent_index = -1).\n")
	sb.WriteString("- If a comment of type X has no allowed path from (Root) or any other type, it cannot be placed in the tree.\n")
	sb.WriteString("- The comment type (\"type\" field) MUST be an exact, case-sensitive match to one of the strings listed in 'Allowed comment types'. Do NOT translate, rename, or localize type names — even if the output language differs. For example, if the allowed type is \"claim\", you MUST output \"claim\", not its translated equivalent.\n")
	sb.WriteString("- NEVER alter, omit, or reinterpret the source material's content to fit the comment frame. If any portion of the source material cannot be faithfully represented as a comment with an allowed type under an allowed path, exclude that portion from the output entirely. Do NOT force it into an invalid type or path, and do NOT reinterpret its meaning to fit the frame.\n")
	sb.WriteString("</comment_frame>\n\n")
}

func (cg *CommentGenerator) generateFullDiscussionWithAI(ctx context.Context, prompt string, youtubeURLs []string, modelLevel domain.ModelLevel) (generatedDiscussion, int32, error) {
	modelName := cg.selectModel(modelLevel)
	config := &genai.GenerateContentConfig{
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingLevel: genai.ThinkingLevelHigh,
		},
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"theme": {
					Type: genai.TypeString,
				},
				"premise": {
					Type: genai.TypeString,
				},
				"conclusion": {
					Type: genai.TypeString,
				},
				"comments": {
					Type: genai.TypeArray,
					Items: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"type": {
								Type: genai.TypeString,
							},
							"content": {
								Type: genai.TypeString,
							},
							"parent_index": {
								Type: genai.TypeInteger,
							},
						},
						Required: []string{"type", "content", "parent_index"},
					},
				},
			},
			Required: []string{"theme", "premise", "conclusion", "comments"},
		},
	}

	parts := []*genai.Part{genai.NewPartFromText(prompt)}
	for _, ytURL := range youtubeURLs {
		parts = append(parts, genai.NewPartFromURI(ytURL, "video/mp4"))
	}
	contents := []*genai.Content{genai.NewContentFromParts(parts, genai.RoleUser)}

	resp, err := cg.client.Models.GenerateContent(
		ctx,
		modelName,
		contents,
		config,
	)
	if err != nil {
		return generatedDiscussion{}, 0, fmt.Errorf("failed to generate discussion: %w", err)
	}

	var generated generatedDiscussion
	if err := json.Unmarshal([]byte(resp.Text()), &generated); err != nil {
		return generatedDiscussion{}, 0, fmt.Errorf("failed to unmarshal AI response: %w, response: %s", err, resp.Text())
	}

	var tokens int32
	if resp.UsageMetadata != nil {
		tokens = resp.UsageMetadata.TotalTokenCount
	}
	return generated, tokens, nil
}

func isYouTubeURL(rawURL string) bool {
	u, err := url.Parse(rawURL)
	if err != nil {
		return false
	}
	host := strings.ToLower(u.Host)
	host = strings.TrimPrefix(host, "www.")
	host = strings.TrimPrefix(host, "m.")
	return host == "youtube.com" || host == "youtu.be" || strings.HasSuffix(host, ".youtube.com")
}

func (cg *CommentGenerator) selectModel(level domain.ModelLevel) string {
	switch level {
	case domain.ModelLevelHigh:
		return "gemini-3.5-flash"
	case domain.ModelLevelMedium:
		return "gemini-3-flash-preview"
	default:
		return "gemini-3.1-flash-lite"
	}
}

func (cg *CommentGenerator) createGeneratedDiscussionComments(params domain.GenerateDiscussionParams, generated []generatedDiscussionComment) ([]*domain.Comment, error) {
	result := make([]*domain.Comment, 0, len(generated))
	idByIndex := make(map[int]string, len(generated))

	depths := make([]int, len(generated))
	maxDepth := 0
	for i, g := range generated {
		if g.ParentIndex < 0 {
			depths[i] = 0
		} else {
			depths[i] = depths[g.ParentIndex] + 1
		}
		if depths[i] > maxDepth {
			maxDepth = depths[i]
		}
	}

	now := cg.clockSrv.Now()

	for i, g := range generated {
		parentCommentID := ""
		if g.ParentIndex >= 0 {
			parentID, ok := idByIndex[g.ParentIndex]
			if !ok {
				return nil, fmt.Errorf("parent_index %d not found for comment at index %d", g.ParentIndex, i)
			}
			parentCommentID = parentID
		}

		createdAt := now.Add(-time.Duration(maxDepth-depths[i]) * time.Second)

		c, err := cg.factory.Create(domain.CreateCommentParams{
			DiscussionID:    "",
			ParentCommentID: parentCommentID,
			Body: domain.CommentBody{
				Type:    g.Type,
				Content: g.Content,
			},
			Status:    domain.CommentStatusActive,
			CreatedBy: params.UserID,
			CreatedAt: createdAt,
		})
		if err != nil {
			return nil, err
		}

		result = append(result, c)
		idByIndex[i] = c.ID()
	}

	return result, nil
}

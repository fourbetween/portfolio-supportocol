package web

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/JohannesKaufmann/html-to-markdown/v2/converter"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/base"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/commonmark"
	"golang.org/x/net/html"
)

const (
	maxResponseSize  = 1024 * 1024
	maxContentLength = 50_000
	fetchTimeout     = 30 * time.Second
	userAgent        = "Mozilla/5.0 (compatible; AppSupportocol/1.0)"
)

type URLContentFetcher struct {
	client *http.Client
}

func NewURLContentFetcher() *URLContentFetcher {
	return &URLContentFetcher{
		client: &http.Client{
			Timeout: fetchTimeout,
		},
	}
}

func (f *URLContentFetcher) Fetch(ctx context.Context, rawURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("User-Agent", userAgent)

	resp, err := f.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	contentType := strings.ToLower(resp.Header.Get("Content-Type"))
	limited := io.LimitReader(resp.Body, maxResponseSize)

	var text string
	switch {
	case strings.Contains(contentType, "text/html"):
		text, err = convertHTMLToMarkdown(limited)
	case strings.HasPrefix(contentType, "text/"):
		text, err = extractPlainText(limited)
	default:
		return "", fmt.Errorf("unsupported content type: %s", contentType)
	}
	if err != nil {
		return "", err
	}

	if len(text) > maxContentLength {
		text = text[:maxContentLength]
	}

	return text, nil
}

type removeElementsPlugin struct{}

func (p *removeElementsPlugin) Name() string { return "remove-elements" }

func (p *removeElementsPlugin) Init(conv *converter.Converter) error {
	for _, tag := range []string{"svg", "nav", "header", "footer", "aside", "form"} {
		conv.Register.TagType(tag, converter.TagTypeRemove, converter.PriorityStandard)
	}
	return nil
}

func convertHTMLToMarkdown(r io.Reader) (string, error) {
	doc, err := html.Parse(r)
	if err != nil {
		return "", fmt.Errorf("failed to parse HTML: %w", err)
	}

	var body *html.Node
	var findBody func(*html.Node)
	findBody = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "body" {
			body = n
			return
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			findBody(c)
		}
	}
	findBody(doc)

	root := doc
	if body != nil {
		root = body
	}

	conv := converter.NewConverter(
		converter.WithPlugins(
			base.NewBasePlugin(),
			commonmark.NewCommonmarkPlugin(),
			&removeElementsPlugin{},
		),
	)

	md, err := conv.ConvertNode(root)
	if err != nil {
		return "", fmt.Errorf("failed to convert HTML to Markdown: %w", err)
	}

	return strings.TrimSpace(string(md)), nil
}

func extractPlainText(r io.Reader) (string, error) {
	b, err := io.ReadAll(r)
	if err != nil {
		return "", fmt.Errorf("failed to read text: %w", err)
	}
	return string(b), nil
}

package web

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/JohannesKaufmann/html-to-markdown/v2/converter"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/base"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/commonmark"
	"golang.org/x/net/html"
)

const (
	maxResponseSize  = 1024 * 1024
	maxContentLength = 1_000_000
	fetchTimeout     = 30
)

type URLContentFetcher struct {
	functionURL string
	client      *http.Client
}

func NewURLContentFetcher(functionURL string) *URLContentFetcher {
	return &URLContentFetcher{
		functionURL: functionURL,
		client: &http.Client{
			Timeout: time.Duration(fetchTimeout) * time.Second,
		},
	}
}

func (f *URLContentFetcher) Fetch(ctx context.Context, rawURL string) (string, error) {
	params := url.Values{}
	params.Set("url", rawURL)
	params.Set("max_response_size", strconv.Itoa(maxResponseSize))
	params.Set("max_content_length", strconv.Itoa(maxContentLength))
	params.Set("fetch_timeout", strconv.Itoa(fetchTimeout))

	reqURL := fmt.Sprintf("%s?%s", f.functionURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := f.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call fetch lambda: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("fetch lambda returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	text, err := convertHTMLToMarkdown(strings.NewReader(string(body)))
	if err != nil {
		return "", err
	}

	if len(text) > maxContentLength {
		text = text[:maxContentLength]
	}

	return text, nil
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

type removeElementsPlugin struct{}

func (p *removeElementsPlugin) Name() string { return "remove-elements" }

func (p *removeElementsPlugin) Init(conv *converter.Converter) error {
	for _, tag := range []string{
		"svg", "nav", "header", "footer", "aside", "form",
		"style", "script", "noscript", "meta", "link",
		"iframe", "object", "embed", "template",
	} {
		conv.Register.TagType(tag, converter.TagTypeRemove, converter.PriorityStandard)
	}
	return nil
}

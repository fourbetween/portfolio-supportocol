package web

import (
	"context"
	"encoding/json"
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

type fetchHTMLResponse struct {
	StatusCode int               `json:"statusCode"`
	Body       string            `json:"body"`
	Headers    map[string]string `json:"headers,omitempty"`
	Error      string            `json:"error,omitempty"`
}

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

	respContentType := strings.ToLower(resp.Header.Get("Content-Type"))

	var text string

	switch {
	case strings.Contains(respContentType, "text/html"):
		text, err = convertHTMLToMarkdown(resp.Body)
	case strings.Contains(respContentType, "application/json"):
		var lambdaResp fetchHTMLResponse
		if decodeErr := json.NewDecoder(resp.Body).Decode(&lambdaResp); decodeErr != nil {
			return "", fmt.Errorf("failed to decode lambda response: %w", decodeErr)
		}
		if lambdaResp.Error != "" {
			return "", fmt.Errorf("fetch lambda error: %s", lambdaResp.Error)
		}
		if lambdaResp.StatusCode != http.StatusOK {
			return "", fmt.Errorf("unexpected status code: %d", lambdaResp.StatusCode)
		}
		innerContentType := strings.ToLower(lambdaResp.Headers["Content-Type"])
		body := strings.NewReader(lambdaResp.Body)
		switch {
		case strings.Contains(innerContentType, "text/html"):
			text, err = convertHTMLToMarkdown(body)
		case strings.HasPrefix(innerContentType, "text/"):
			text, err = extractPlainText(body)
		default:
			text, err = convertHTMLToMarkdown(body)
		}
	default:
		text, err = convertHTMLToMarkdown(resp.Body)
	}
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

func extractPlainText(r io.Reader) (string, error) {
	b, err := io.ReadAll(r)
	if err != nil {
		return "", fmt.Errorf("failed to read text: %w", err)
	}
	return string(b), nil
}

type removeElementsPlugin struct{}

func (p *removeElementsPlugin) Name() string { return "remove-elements" }

func (p *removeElementsPlugin) Init(conv *converter.Converter) error {
	for _, tag := range []string{"svg", "nav", "header", "footer", "aside", "form"} {
		conv.Register.TagType(tag, converter.TagTypeRemove, converter.PriorityStandard)
	}
	return nil
}

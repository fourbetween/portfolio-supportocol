import DOMPurify from "dompurify";
import githubMarkdownCss from "github-markdown-css/github-markdown.css?inline";
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import { baseStyle } from "../../style/base";

@customElement("ui-markdown-viewer")
export class MarkdownViewer extends LitElement {
  @property({ type: String })
  content = "";

  render() {
    const renderer = new marked.Renderer();
    const defaultLink = renderer.link.bind(renderer);
    renderer.link = (token) => {
      return defaultLink(token).replace("<a ", '<a target="_blank" rel="noopener noreferrer" ');
    };
    const html_ = DOMPurify.sanitize(
      marked.parse(this.content, { async: false, renderer }),
      { ADD_ATTR: ["target"] },
    );
    return html`
      <div class="markdown-body">${unsafeHTML(html_)}</div>
    `;
  }

  static styles = [
    baseStyle,
    unsafeCSS(githubMarkdownCss),
    css`
      :host {
        display: block;
        font-size: 14px;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-subtle);
        padding: 12px;
        border-radius: 4px;
        border: 1px solid var(--color-border-muted);
      }
      .markdown-body {
        background-color: transparent;
        color: var(--color-fg-default);
        font-size: inherit;
        font-family: "Noto Sans JP", "Noto Sans", sans-serif;
      }
      .markdown-body p,
      .markdown-body span,
      .markdown-body li,
      .markdown-body blockquote {
        color: var(--color-fg-default);
      }
      .markdown-body code {
        background-color: var(--color-neutral-muted);
        color: var(--color-fg-default);
      }
      .markdown-body pre {
        background-color: var(--color-canvas-subtle);
        color: var(--color-fg-default);
      }
      .markdown-body strong {
        color: var(--color-fg-default);
      }
      .markdown-body em {
        color: var(--color-fg-default);
      }
      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3,
      .markdown-body h4,
      .markdown-body h5,
      .markdown-body h6 {
        color: var(--color-fg-default);
      }
    `,
  ];
}

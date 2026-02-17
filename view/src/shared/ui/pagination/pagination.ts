import { msg } from "@lit/localize";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { PageChangeEvent } from "../../event/page";
import { baseStyle } from "../../style/base";
import { iconStyle } from "../../style/icon";
import { paginationStyle } from "../../style/pagination";

@customElement("ui-pagination")
export class Pagination extends LitElement {
  @property({ type: Number })
  page = 1;

  @property({ type: Number })
  pageSize = 20;

  @property({ type: Number })
  totalCount = 0;

  private get _totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  private _handlePageClick(page: number) {
    if (page < 1 || page > this._totalPages || page === this.page) return;
    this.dispatchEvent(new PageChangeEvent(page));
  }

  private _visiblePages(): (number | "ellipsis")[] {
    const total = this._totalPages;
    const current = this.page;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (current > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("ellipsis");
    }

    pages.push(total);

    return pages;
  }

  render() {
    if (this._totalPages <= 1) return nothing;

    const pages = this._visiblePages();

    return html`
      <nav class="pagination" aria-label=${msg("Pagination")}>
        <button
          class="pagination-btn"
          ?disabled=${this.page === 1}
          @click=${() => this._handlePageClick(this.page - 1)}
          aria-label=${msg("Previous page")}
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        ${pages.map((p) =>
          p === "ellipsis"
            ? html`
                <span class="pagination-ellipsis">…</span>
              `
            : html`
                <button
                  class="pagination-btn ${p === this.page
                    ? "pagination-btn--active"
                    : ""}"
                  @click=${() => this._handlePageClick(p)}
                  aria-label=${msg("Page")}
                >
                  ${p}
                </button>
              `,
        )}

        <button
          class="pagination-btn"
          ?disabled=${this.page === this._totalPages}
          @click=${() => this._handlePageClick(this.page + 1)}
          aria-label=${msg("Next page")}
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </nav>
    `;
  }

  static styles = [baseStyle, iconStyle, paginationStyle, css``];
}

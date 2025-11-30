import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { formStyle } from "./form";

@customElement("test-form-style")
class TestFormStyleComponent extends LitElement {
  render() {
    return html`
      <form>
        <div class="form-group">
          <label for="input1">入力1</label>
          <input type="text" id="input1" />
        </div>
        <div class="form-group">
          <label for="input2">入力2</label>
          <input type="text" id="input2" />
        </div>
        <div class="form-group">
          <label for="input3">入力3</label>
          <textarea id="input3"></textarea>
        </div>
      </form>
    `;
  }

  static styles = [formStyle];
}

@customElement("test-form-style-no-form-tag")
class TestFormStyleNoFormTagComponent extends LitElement {
  render() {
    return html`
      <div>
        <div class="form-group">
          <label for="input1">入力1</label>
          <input type="text" id="input1" />
        </div>
        <div class="form-group">
          <label for="input2">入力2</label>
          <input type="text" id="input2" />
        </div>
      </div>
    `;
  }

  static styles = [formStyle];
}

describe("formStyle", async () => {
  let elem: TestFormStyleComponent;

  beforeEach(() => {
    elem = document.createElement("test-form-style") as TestFormStyleComponent;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("フォームグループ間の隙間が16pxであること", async () => {
    await elem.updateComplete;
    const form = elem.shadowRoot?.querySelector("form");
    const computedStyle = window.getComputedStyle(form!);
    expect(computedStyle.gap).toBe("16px");
  });

  it("ラベルとインプット間の隙間が6pxであること", async () => {
    await elem.updateComplete;
    const formGroup = elem.shadowRoot?.querySelector(".form-group");
    const computedStyle = window.getComputedStyle(formGroup!);
    expect(computedStyle.gap).toBe("6px");
  });

  it("フォームグループにmargin-bottomがないこと", async () => {
    await elem.updateComplete;
    const formGroup = elem.shadowRoot?.querySelector(".form-group");
    const computedStyle = window.getComputedStyle(formGroup!);
    expect(computedStyle.marginBottom).toBe("0px");
  });
});

describe("formStyle（formタグなし）", async () => {
  let elem: TestFormStyleNoFormTagComponent;

  beforeEach(() => {
    elem = document.createElement(
      "test-form-style-no-form-tag"
    ) as TestFormStyleNoFormTagComponent;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("連続するフォームグループ間の隙間が10pxであること", async () => {
    await elem.updateComplete;
    const formGroups = elem.shadowRoot?.querySelectorAll(".form-group");
    const secondFormGroup = formGroups?.[1];
    const computedStyle = window.getComputedStyle(secondFormGroup!);
    expect(computedStyle.marginTop).toBe("10px");
  });

  it("ラベルとインプット間の隙間が6pxであること", async () => {
    await elem.updateComplete;
    const formGroup = elem.shadowRoot?.querySelector(".form-group");
    const computedStyle = window.getComputedStyle(formGroup!);
    expect(computedStyle.gap).toBe("6px");
  });
});

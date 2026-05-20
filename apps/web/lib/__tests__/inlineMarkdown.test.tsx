import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderInlineMarkdown } from "../inlineMarkdown";

describe("renderInlineMarkdown", () => {
  it("renders **bold** as <strong>", () => {
    const { container } = render(<>{renderInlineMarkdown("Hello **world**")}</>);
    expect(container.querySelector("strong")?.textContent).toBe("world");
    expect(container.textContent).toBe("Hello world");
  });

  it("renders *italic* and _italic_ as <em>", () => {
    const { container } = render(<>{renderInlineMarkdown("an *important* and _critical_ note")}</>);
    const ems = container.querySelectorAll("em");
    expect(ems).toHaveLength(2);
    expect(ems[0].textContent).toBe("important");
    expect(ems[1].textContent).toBe("critical");
  });

  it("renders `code` as <code>", () => {
    const { container } = render(<>{renderInlineMarkdown("set `commercialUseAllowed` to false")}</>);
    expect(container.querySelector("code")?.textContent).toBe("commercialUseAllowed");
  });

  it("leaves plain text untouched", () => {
    const { container } = render(<>{renderInlineMarkdown("plain text without markup")}</>);
    expect(container.textContent).toBe("plain text without markup");
    expect(container.querySelector("strong")).toBeNull();
    expect(container.querySelector("em")).toBeNull();
  });
});

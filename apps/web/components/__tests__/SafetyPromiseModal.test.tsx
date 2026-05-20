import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SafetyPromiseModal } from "../SafetyPromiseModal";

describe("SafetyPromiseModal", () => {
  it("renders nothing when closed", () => {
    render(<SafetyPromiseModal open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the four promises when open", () => {
    render(<SafetyPromiseModal open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("No drinking games.")).toBeDefined();
    expect(screen.getByText("No gambling.")).toBeDefined();
    expect(screen.getByText("No physical risk.")).toBeDefined();
    expect(screen.getByText("Original only.")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    let closed = false;
    render(<SafetyPromiseModal open={true} onClose={() => { closed = true; }} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(closed).toBe(true);
  });

  it("calls onClose when Escape is pressed", () => {
    let closed = false;
    render(<SafetyPromiseModal open={true} onClose={() => { closed = true; }} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closed).toBe(true);
  });

  it("traps Tab on the close button while open", () => {
    render(<SafetyPromiseModal open={true} onClose={() => {}} />);
    const close = screen.getByLabelText("Close");
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });
});

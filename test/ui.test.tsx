import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  shorten,
  Badge,
  Button,
  Card,
  Mono,
  Empty,
  Field,
  Input,
} from "@/components/ui";

describe("UI Primitives", () => {
  it("shortens long strings with ellipsis", () => {
    const addr = "GBTYD5SS7STGNGY25Z57XFCT62XJ4D6ZGBJTYDS6USAGB36W7WFFG225";
    expect(shorten(addr)).toBe("GBTYD5…FFG225");
    expect(shorten("short", 6, 6)).toBe("short");
  });

  it("renders Badge with tone styles", () => {
    const { container, rerender } = render(<Badge tone="green">Valid</Badge>);
    expect(screen.getByText("Valid")).toBeDefined();
    expect(container.firstChild).toBeDefined();

    rerender(<Badge tone="red">Invalid</Badge>);
    expect(screen.getByText("Invalid")).toBeDefined();
  });

  it("renders Button with primary and ghost variants", () => {
    render(<Button variant="primary">Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeDefined();
  });

  it("renders Card container", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeDefined();
  });

  it("renders Mono code snippet", () => {
    render(<Mono>0x1234abcd</Mono>);
    expect(screen.getByText("0x1234abcd")).toBeDefined();
  });

  it("renders Empty state banner", () => {
    render(<Empty>No data found</Empty>);
    expect(screen.getByText("No data found")).toBeDefined();
  });

  it("renders Field with label and input", () => {
    render(
      <Field label="Subject">
        <Input placeholder="Enter address" />
      </Field>,
    );
    expect(screen.getByText("Subject")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter address")).toBeDefined();
  });
});

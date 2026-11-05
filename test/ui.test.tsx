import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    expect(shorten("exact12chars", 6, 6)).toBe("exact12chars");
  });

  it("renders Badge with tone styles", () => {
    const { container, rerender } = render(<Badge tone="green">Valid</Badge>);
    expect(screen.getByText("Valid")).toBeDefined();
    expect(container.firstChild).toBeDefined();

    rerender(<Badge tone="red">Invalid</Badge>);
    expect(screen.getByText("Invalid")).toBeDefined();

    rerender(<Badge tone="muted">Pending</Badge>);
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders Button variants and handles click events", () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button variant="primary" onClick={handleClick}>
        Primary Action
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Primary Action" });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(<Button variant="ghost">Ghost Action</Button>);
    expect(screen.getByRole("button", { name: "Ghost Action" })).toBeDefined();

    rerender(<Button variant="danger">Danger Action</Button>);
    expect(screen.getByRole("button", { name: "Danger Action" })).toBeDefined();
  });

  it("disables Button when disabled prop is passed", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Action
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Disabled Action" });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders Card container with custom className", () => {
    const { container } = render(
      <Card className="custom-class">Card content</Card>,
    );
    expect(screen.getByText("Card content")).toBeDefined();
    expect(
      container.firstElementChild?.classList.contains("custom-class"),
    ).toBe(true);
  });

  it("renders Mono code snippet", () => {
    render(<Mono>0x1234abcd</Mono>);
    expect(screen.getByText("0x1234abcd")).toBeDefined();
  });

  it("renders Empty state banner", () => {
    render(<Empty>No data found</Empty>);
    expect(screen.getByText("No data found")).toBeDefined();
  });

  it("renders Field with label and handles Input change events", () => {
    const handleChange = vi.fn();
    render(
      <Field label="Subject">
        <Input placeholder="Enter address" onChange={handleChange} />
      </Field>,
    );
    expect(screen.getByText("Subject")).toBeDefined();
    const input = screen.getByPlaceholderText("Enter address");
    fireEvent.change(input, { target: { value: "GBTY..." } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});

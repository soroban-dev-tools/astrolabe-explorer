import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyButton } from "@/components/copy-button";

describe("CopyButton Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders with default label", () => {
    render(<CopyButton text="GBTY123" />);
    expect(screen.getByRole("button", { name: "Copy Copy" })).toBeDefined();
    expect(screen.getByText("Copy")).toBeDefined();
  });

  it("renders with custom label", () => {
    render(<CopyButton text="0xabcdef" label="UID" />);
    expect(screen.getByRole("button", { name: "Copy UID" })).toBeDefined();
    expect(screen.getByText("UID")).toBeDefined();
  });

  it("calls clipboard writeText and updates button state to Copied", async () => {
    render(<CopyButton text="hello-stellar" label="address" />);
    const button = screen.getByRole("button", { name: "Copy address" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello-stellar");
    expect(screen.getByText("Copied")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("address")).toBeDefined();
  });
});

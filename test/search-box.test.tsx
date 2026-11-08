// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBox } from "@/components/search-box";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({
    config: { seedSchemas: { Membership: "b".repeat(64) } },
  }),
}));

function submit(value: string) {
  render(<SearchBox />);
  const input = screen.getByLabelText("Search schemas and addresses");
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input.closest("form")!);
}

describe("SearchBox", () => {
  beforeEach(() => push.mockClear());

  it("navigates to the matching schema", () => {
    submit("member");
    expect(push).toHaveBeenCalledWith(`/schema/${"b".repeat(64)}`);
  });

  it("shows a no-result message and does not navigate", () => {
    submit("nothing here");
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toMatch(
      /No schema or address/,
    );
  });

  it("ignores blank submissions", () => {
    submit("   ");
    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).toBeNull();
  });
});

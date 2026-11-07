import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExplorerLink, getExplorerUrl } from "@/components/explorer-link";

describe("ExplorerLink Component & URL Generator", () => {
  it("generates correct stellar.expert URL for account", () => {
    const url = getExplorerUrl("account", "GBTY123");
    expect(url).toBe("https://stellar.expert/explorer/testnet/account/GBTY123");
  });

  it("generates correct stellar.expert URL for transaction and contract", () => {
    expect(getExplorerUrl("tx", "txhash123")).toBe(
      "https://stellar.expert/explorer/testnet/tx/txhash123",
    );
    expect(getExplorerUrl("contract", "CA123", "public")).toBe(
      "https://stellar.expert/explorer/public/contract/CA123",
    );
  });

  it("renders anchor tag with security rel and target attributes", () => {
    render(
      <ExplorerLink
        type="account"
        value="GBTYD5SS7STGNGY25Z57XFCT62XJ4D6ZGBJTYDS6USAGB36W7WFFG225"
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(
      "https://stellar.expert/explorer/testnet/account/GBTYD5SS7STGNGY25Z57XFCT62XJ4D6ZGBJTYDS6USAGB36W7WFFG225",
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
    expect(screen.getByText("GBTYD5…FFG225")).toBeDefined();
  });

  it("renders custom children if provided", () => {
    render(
      <ExplorerLink type="tx" value="txhash123">
        Custom Transaction
      </ExplorerLink>,
    );
    expect(screen.getByText("Custom Transaction")).toBeDefined();
  });
});

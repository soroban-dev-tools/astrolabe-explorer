import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { WalletProvider, useWallet, type DeploymentConfig } from "@/lib/wallet";
import type { ReactNode } from "react";

const mockConfig: DeploymentConfig = {
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractIds: {
    attestation: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    schema_registry: "CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  },
  seedSchemas: {
    test_schema: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
};

describe("Wallet Context and Provider", () => {
  it("throws descriptive error when useWallet is used outside WalletProvider", () => {
    expect(() => renderHook(() => useWallet())).toThrow(
      "useWallet must be used within a WalletProvider",
    );
  });

  it("provides readClient and null writeClient in disconnected state", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WalletProvider config={mockConfig}>{children}</WalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.address).toBeNull();
    expect(result.current.writeClient).toBeNull();
    expect(result.current.readClient).toBeDefined();
    expect(result.current.config).toEqual(mockConfig);
    expect(typeof result.current.connect).toBe("function");
    expect(typeof result.current.disconnect).toBe("function");
  });
});

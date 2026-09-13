"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.
//
// Wallet connection through Stellar Wallets Kit, plus an Astrolabe client
// factory. Reads work with no wallet connected; writes require a connection and
// go through the wallet's signer. This module never handles a secret key.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Astrolabe } from "@astrolabe/sdk";

export interface DeploymentConfig {
  networkPassphrase: string;
  rpcUrl: string;
  contractIds: { attestation: string; schema_registry: string };
  seedSchemas: Record<string, string>;
}

interface WalletState {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** A read-only client; always available. */
  readClient: Astrolabe;
  /** A signing client; null until a wallet is connected. */
  writeClient: Astrolabe | null;
  config: DeploymentConfig;
}

const WalletContext = createContext<WalletState | null>(null);

// The kit touches `window`, so it is created lazily on the client only.
type Kit = import("@creit.tech/stellar-wallets-kit").StellarWalletsKit;
let kitPromise: Promise<Kit> | null = null;

async function getKit(): Promise<Kit> {
  if (!kitPromise) {
    kitPromise = (async () => {
      const { StellarWalletsKit, WalletNetwork, allowAllModules, FREIGHTER_ID } =
        await import("@creit.tech/stellar-wallets-kit");
      return new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FREIGHTER_ID,
        modules: allowAllModules(),
      });
    })();
  }
  return kitPromise;
}

export function WalletProvider({
  config,
  children,
}: {
  config: DeploymentConfig;
  children: ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(null);

  const readClient = useMemo(
    () =>
      new Astrolabe({
        network: "testnet",
        rpcUrl: config.rpcUrl,
        networkPassphrase: config.networkPassphrase,
        contractIds: config.contractIds,
      }),
    [config],
  );

  const writeClient = useMemo(() => {
    if (!address) return null;
    return new Astrolabe({
      network: "testnet",
      rpcUrl: config.rpcUrl,
      networkPassphrase: config.networkPassphrase,
      contractIds: config.contractIds,
      publicKey: address,
      signTransaction: async (xdr, opts) => {
        const kit = await getKit();
        const { signedTxXdr, signerAddress } = await kit.signTransaction(xdr, {
          address,
          networkPassphrase: opts?.networkPassphrase ?? config.networkPassphrase,
        });
        return { signedTxXdr, signerAddress };
      },
    });
  }, [address, config]);

  const connect = useCallback(async () => {
    const kit = await getKit();
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
        const { address: addr } = await kit.getAddress();
        setAddress(addr);
      },
    });
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    void getKit().then((kit) => kit.disconnect?.());
  }, []);

  const value = useMemo<WalletState>(
    () => ({ address, connect, disconnect, readClient, writeClient, config }),
    [address, connect, disconnect, readClient, writeClient, config],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}

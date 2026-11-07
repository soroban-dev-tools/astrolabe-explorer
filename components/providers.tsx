"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { type ReactNode } from "react";
import { WalletProvider, type DeploymentConfig } from "@/lib/wallet";
import { Header } from "@/components/header";
import { ToastProvider } from "@/components/toast";

export function Providers({
  config,
  children,
}: {
  config: DeploymentConfig;
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <WalletProvider config={config}>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </WalletProvider>
    </ToastProvider>
  );
}

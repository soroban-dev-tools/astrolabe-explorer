// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { resolveDeployments, rpcUrl } from "@/lib/deployments";

export const metadata: Metadata = {
  title: "Astrolabe Explorer",
  description: "Browse and issue attestations on the Astrolabe registry (Testnet).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const d = resolveDeployments();
  const config = {
    networkPassphrase: d.networkPassphrase,
    rpcUrl: rpcUrl(),
    contractIds: d.contracts,
    seedSchemas: d.seedSchemas ?? {},
  };
  return (
    <html lang="en">
      <body>
        <Providers config={config}>{children}</Providers>
      </body>
    </html>
  );
}

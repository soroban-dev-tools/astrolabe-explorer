"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { Button, shorten } from "@/components/ui";

export function Header() {
  const { address, connect, disconnect } = useWallet();
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold text-fg no-underline">
            Astrolabe
          </Link>
          <Link href="/" className="text-muted no-underline hover:text-fg">
            Schemas
          </Link>
          <Link href="/issue" className="text-muted no-underline hover:text-fg">
            Issue
          </Link>
        </nav>
        {address ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted">
              {shorten(address)}
            </span>
            <Button variant="ghost" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={() => void connect()}>Connect wallet</Button>
        )}
      </div>
    </header>
  );
}

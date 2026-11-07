"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { type ReactNode } from "react";
import { shorten } from "@/components/ui";

export type ExplorerType = "account" | "tx" | "contract";

export function getExplorerUrl(
  type: ExplorerType,
  value: string,
  network: string = "testnet",
): string {
  const base = `https://stellar.expert/explorer/${network}`;
  return `${base}/${type}/${encodeURIComponent(value)}`;
}

export function ExplorerLink({
  type,
  value,
  children,
  className = "",
  network = "testnet",
}: {
  type: ExplorerType;
  value: string;
  children?: ReactNode;
  className?: string;
  network?: string;
}) {
  const url = getExplorerUrl(type, value, network);
  const display = children ?? shorten(value);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-0.5 text-accent hover:underline ${className}`}
      title={`View on stellar.expert (${network})`}
    >
      <span>{display}</span>
      <span className="text-[10px] opacity-70" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet";
import { resolveSearch } from "@/lib/search";
import { Input } from "@/components/ui";

export function SearchBox() {
  const router = useRouter();
  const { config } = useWallet();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const target = resolveSearch(query, config.seedSchemas);
    if (target.kind === "none") {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setQuery("");
    router.push(target.href);
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-44 sm:w-64">
      <Input
        aria-label="Search schemas and addresses"
        placeholder="Search schema or address"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setNotFound(false);
        }}
      />
      {notFound && (
        <p role="status" className="absolute mt-1 text-xs text-red-400">
          No schema or address matches that search.
        </p>
      )}
    </form>
  );
}

// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <Card className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">404</h1>
          <h2 className="text-lg font-medium text-fg">Page Not Found</h2>
          <p className="text-sm text-muted">
            The schema, subject, or explorer page you requested does not exist
            or has moved.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button>Back to Schemas</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

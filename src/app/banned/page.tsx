"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function BannedPage() {
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md p-8 bg-card border border-border rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-900/50 p-4">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Account Suspended
        </h1>
        <p className="text-muted-foreground mb-6">
          Your account has been suspended due to a violation of our community
          guidelines. If you believe this is a mistake, please contact our
          support team.
        </p>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            Sign Out
          </Button>
          <a
            href="mailto:support@neptube.com"
            className="block text-sm text-blue-400 hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UpgradePromptProps {
  itemTypeName: string;
}

export function UpgradePrompt({ itemTypeName }: UpgradePromptProps) {
  const typeLabel = itemTypeName.toLowerCase();

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <Lock className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{itemTypeName} storage is a Pro feature</p>
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro to upload and store {typeLabel}s in DevStash.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/settings" />} className="mt-2">
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
}

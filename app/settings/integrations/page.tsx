import type { Metadata } from "next";
import Link from "next/link";

import { GitHubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { githubCallbackMessage } from "@/features/integrations/github-callback-result";

export const metadata: Metadata = { title: "GitHub connection" };

export default async function GitHubCallbackFallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-5 py-12">
      <FeedbackState
        title="GitHub connection failed"
        message={githubCallbackMessage(reason ?? null)}
        action={
          <Button asChild>
            <Link href="/dashboard/business">
              <GitHubIcon /> Return to businesses
            </Link>
          </Button>
        }
      />
    </main>
  );
}

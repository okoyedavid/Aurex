"use client";

import { FeedbackState } from "@/components/ui/feedback-state";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <FeedbackState
      title="We could not load this page."
      message="Try the request again. If the problem continues, return later or contact Aurex support."
      retry={retry}
      variant="page"
      className="bg-background text-foreground"
    />
  );
}

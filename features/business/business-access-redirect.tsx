"use client";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function BusinessAccessRedirect({
  href,
  message,
}: {
  href: string;
  message: string;
}) {
  const router = useRouter();
  const notified = useRef(false);
  useEffect(() => {
    if (!notified.current) {
      notified.current = true;
      toast.error(message);
    }
    router.replace(href);
  }, [href, message, router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted text-sm text-muted-foreground">
      <Building2 className="mr-2 h-4 w-4" />
      Redirecting…
    </div>
  );
}

import type { Metadata } from "next";

import { WarpDemoPage } from "@/features/warp-demo/warp-demo-page";

export const metadata: Metadata = {
  title: "Aurex — Policy assignment demo",
  description:
    "Try Aurex's policy assignment system, then sign up to explore the full workspace.",
};

export default function Page() {
  return <WarpDemoPage />;
}

import type { Metadata } from "next";

import { WarpDemoPage } from "@/features/warp-demo/warp-demo-page";

export const metadata: Metadata = {
  title: "Warp Policy Assignment — Engineering Demo",
  description:
    "An interactive case study of Aurex's explainable employee policy resolution system.",
};

export default function Page() {
  return <WarpDemoPage />;
}

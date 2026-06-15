import DownloadCta from "@/features/home/download-cta";
import FinalSignupCta from "@/features/home/final-cta";
import Growth from "@/features/home/growth";
import Hero from "@/features/home/hero";
import Marquee from "@/features/home/marquee";
import Process from "@/features/home/process";
import Testimonials from "@/features/home/testimonial";

export default function Home() {
  return (
    <section className="bg-background text-foreground">
      <Hero />
      <Marquee />
      <Process />
      <Growth />
      <Testimonials />
      <DownloadCta />
      <FinalSignupCta />
    </section>
  );
}

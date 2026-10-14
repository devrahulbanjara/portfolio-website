import { Suspense } from "react";
import { AgentProvider } from "@/components/agent/AgentProvider";
import { StudioConsole } from "@/components/agent/StudioConsole";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Preloader, TopBar, Footer } from "@/components/site/Chrome";
import { PageTransition } from "@/components/site/PageTransition";
import { RevealObserver } from "@/components/site/Reveal";
import { Analytics } from "@/components/site/Analytics";
import { JsonLd, personGraph } from "@/components/site/JsonLd";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentProvider>
      <Preloader />
      <SmoothScroll>
        <Suspense>
          <TopBar />
        </Suspense>
        <main id="main">{children}</main>
        <Footer />
      </SmoothScroll>
      <Suspense>
        <StudioConsole />
        <RevealObserver />
        <Analytics />
        <PageTransition />
      </Suspense>
      <JsonLd data={personGraph()} />
    </AgentProvider>
  );
}

import Hero from "@/components/Hero";
import Banner from "@/components/Banner";
import About from "@/components/About";
import Journey from "@/components/Journey";
import VisionCarousel from "@/components/VisionCarousel";
import Values from "@/components/Values";
import Declare from "@/components/Declare";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import SplashCursor from "@/components/SplashCursor";

export default function Home() {
  return (
    <>
      <main id="top">
        <ScrollReveal split="words" effect="rise" staggerMs={60}>
          <Hero />
        </ScrollReveal>
        <Banner />
        <ScrollReveal split="words" effect="rise" staggerMs={60}>
          <About />
        </ScrollReveal>
        <Journey />
        <VisionCarousel />
        <ScrollReveal split="words" effect="rise" staggerMs={60}>
          <Values />
        </ScrollReveal>
        <ScrollReveal split="words" effect="rise" staggerMs={60}>
          <Declare />
        </ScrollReveal>
      </main>
      <Footer />
      <SplashCursor />
    </>
  );
}

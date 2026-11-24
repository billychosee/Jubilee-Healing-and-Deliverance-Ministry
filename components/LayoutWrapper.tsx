"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ClickSpark from "@/components/ClickSpark";
import CursorGrid from "@/components/CursorGrid";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 50;
      setScrolled(isScrolled);
      setNavHidden(isScrolled && currentScrollY > previousScrollY);
      previousScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header scrolled={scrolled} hidden={navHidden} />
      <CursorGrid
        className="cursor-grid-site"
        cellSize={56}
        highlight="area"
        gridStyle="lines"
        radius={150}
        holdTime={400}
        fadeDuration={800}
        fillOpacity={0.025}
        gridOpacity={0.045}
        spotlight={0.55}
        lightMode
        intro
        clickPulse
      >
        <ClickSpark
          sparkColor="#0b4aa8"
          shape="line"
          sparkCount={8}
          sparkSize={14}
          sparkRadius={30}
          duration={500}
        >
          <main>{children}</main>
        </ClickSpark>
      </CursorGrid>
      <Footer />
      <BackToTop />
    </>
  );
}
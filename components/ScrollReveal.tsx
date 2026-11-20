"use client";

import { useEffect, useRef } from "react";

type SplitMode = "words" | "chars" | "none";
type RevealEffect = "fade" | "rise" | "scale";

interface ScrollRevealProps {
  children: React.ReactNode;
  split?: SplitMode;
  effect?: RevealEffect;
  staggerMs?: number;
}

export default function ScrollReveal({
  children,
  split = "words",
  effect = "fade",
  staggerMs = 20,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const process = (root: Element) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Node[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if ((node.parentElement as HTMLElement)?.classList.contains("reveal-block")) continue;
        textNodes.push(node);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        if (!text.trim()) return;
        let html: string;
        if (split === "words") {
          const words = text.split(/\s+/).filter(Boolean);
          html = words
            .map(
              (w) =>
                `<span class="reveal-text split-word effect-${effect}">${w}</span>`
            )
            .join(" ");
        } else if (split === "chars") {
          const chars = text.split("");
          html = chars
            .map(
              (c) =>
                `<span class="reveal-text split-char effect-${effect}">${c === " " ? "&nbsp;" : c}</span>`
            )
            .join("");
        } else {
          html = `<span class="reveal-text">${text}</span>`;
        }
        const wrapper = document.createElement("span");
        wrapper.className = "reveal-block";
        wrapper.innerHTML = html;
        textNode.parentElement?.replaceChild(wrapper, textNode);
      });
    };

    let observer: IntersectionObserver | null = null;

    if (prefersReducedMotion) {
      el.querySelectorAll(".reveal-text").forEach((e) => {
        const elem = e as HTMLElement;
        elem.style.opacity = "1";
        elem.style.transform = "none";
        elem.style.filter = "none";
      });
    } else {
      process(el);
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              const pieces = target.querySelectorAll<HTMLElement>(".reveal-text");
              pieces.forEach((piece, i) => {
                setTimeout(() => piece.classList.add("is-visible"), i * staggerMs);
              });
              observer?.unobserve(target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );
      observer.observe(el);
    }

    observerRef.current = observer;

    return () => {
      observer?.disconnect();
    };
  }, [split, effect, staggerMs]);

  return <div ref={ref} className="scroll-reveal">{children}</div>;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  "With a renewed commitment to the original vision, Jubilee Healing and Deliverance Ministry has begun monthly Healing and Deliverance Services in the United States.",
  "These services are established with a heart to minister to individuals who are seeking divine intervention, spiritual freedom, healing, restoration and breakthrough. They provide an opportunity for people from different backgrounds and walks of life to come together in prayer, worship and the Word of God.",
  "Our desire is to create an environment where individuals can encounter Jesus Christ, receive prayer and experience the transforming power of the Holy Spirit.",
  "We remain committed to the belief that the Gospel must address the whole person. Just as our work in Zimbabwe extended to the educational needs of underprivileged children, we desire to continue making a positive impact in people's lives spiritually and socially.",
];

const AUTOPLAY_DELAY = 5000;

export default function VisionCarousel() {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsContainerRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(0);

  const goToRef = useRef<((index: number) => void) | null>(null);
  const nextRef = useRef<(() => void) | null>(null);
  const prevRef = useRef<(() => void) | null>(null);
  const resetAutoplayRef = useRef<(() => void) | null>(null);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      const c = currentRef.current;
      if (c === slides.length - 1) goToRef.current?.(0);
      else nextRef.current?.();
    }, AUTOPLAY_DELAY);
  }, [stopAutoplay]);

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, slides.length - 1));
      setCurrent(next);
      currentRef.current = next;
      resetAutoplayRef.current?.();
    },
    []
  );

  const next = useCallback(() => goToRef.current?.(current + 1), [current]);
  const prev = useCallback(() => goToRef.current?.(current - 1), [current]);

  const resetAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [stopAutoplay, startAutoplay]);

  // Wire cross-references in an effect so callbacks always reference the
  // latest implementations without updating refs during render.
  useEffect(() => {
    goToRef.current = goTo;
    nextRef.current = next;
    prevRef.current = prev;
    resetAutoplayRef.current = resetAutoplay;
  }, [goTo, next, prev, resetAutoplay]);

  useEffect(() => {
    const track = trackRef.current;
    const dotsContainer = dotsContainerRef.current;
    const prevBtn = prevBtnRef.current;
    const nextBtn = nextBtnRef.current;
    if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = `carousel-dot${i === 0 ? " is-active" : ""}`;
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(
      dotsContainer.querySelectorAll(".carousel-dot")
    ) as HTMLButtonElement[];

    const update = () => {
      slides.forEach((_, i) => {
        const slide = track.querySelectorAll(".carousel-slide")[i];
        if (slide) slide.classList.toggle("is-active", i === current);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-selected", i === current ? "true" : "false");
      });
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    };

    update();
    startAutoplay();

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    track.addEventListener("keydown", onKeyDown);

    track.addEventListener("mouseenter", stopAutoplay);
    track.addEventListener("mouseleave", startAutoplay);

    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    };
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      stopAutoplay();
      prevBtn.removeEventListener("click", prev);
      nextBtn.removeEventListener("click", next);
      track.removeEventListener("keydown", onKeyDown);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
      dotsContainer.innerHTML = "";
    };
  }, [current, prev, next, startAutoplay, stopAutoplay, goTo]);

  return (
    <section className="container">
      <div className="panel">
        <h2 style={{ textAlign: "center" }}>The Continuation of the Vision</h2>
        <div className="carousel" id="vision-carousel" role="region" aria-roledescription="carousel" aria-label="Continuation of the Vision">
          <div className="carousel-track" id="carousel-track" ref={trackRef} tabIndex={0}>
            {slides.map((text, i) => (
              <article
                key={i}
                className={`carousel-slide${i === current ? " is-active" : ""}`}
              >
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="carousel-controls" aria-label="Carousel navigation">
            <button
              className="carousel-btn carousel-btn--prev"
              aria-label="Previous slide"
              disabled={current === 0}
              ref={prevBtnRef}
            >
              &lsaquo;
            </button>
            <div className="carousel-dots" id="carousel-dots" role="tablist" aria-label="Slide indicators" ref={dotsContainerRef} />
            <button
              className="carousel-btn carousel-btn--next"
              aria-label="Next slide"
              disabled={current === slides.length - 1}
              ref={nextBtnRef}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

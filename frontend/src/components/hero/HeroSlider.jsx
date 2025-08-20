import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
const AUTOPLAY_DEFAULT = 6000;

export default function HeroSlider({ slides = [], autoPlayMs = AUTOPLAY_DEFAULT, onPlay, onMoreInfo }) {
  const cleaned = useMemo(() => (Array.isArray(slides) ? slides.filter(Boolean) : []), [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const progressTimer = useRef(null);
  const autoTimer = useRef(null);

  const total = cleaned.length;

  useEffect(() => {
    if (!total) return;
    const next = cleaned[(index + 1) % total];
    const url = next?.thumbnailUrl || next?.posterUrl;
    if (!url) return;
    const img = new Image();
    img.src = url;
  }, [index, cleaned, total]);

  const goto = useCallback((nextIndex) => {
    if (!total) return;
    const safe = ((nextIndex % total) + total) % total;
    setIndex(safe);
    setProgress(0);
  }, [total]);

  const next = useCallback(() => goto(index + 1), [goto, index]);
  const prev = useCallback(() => goto(index - 1), [goto, index]);

  useEffect(() => {
    if (!total) return;
    window.clearInterval(progressTimer.current);
    window.clearTimeout(autoTimer.current);
    if (paused) return;

    const step = 100;
    const steps = Math.max(1, Math.floor(autoPlayMs / step));
    let count = 0;
    setProgress(0);

    progressTimer.current = window.setInterval(() => {
      count += 1;
      setProgress(Math.min(100, Math.round((count / steps) * 100)));
    }, step);

    autoTimer.current = window.setTimeout(() => { next(); }, autoPlayMs);

    return () => {
      window.clearInterval(progressTimer.current);
      window.clearTimeout(autoTimer.current);
    };
  }, [index, paused, autoPlayMs, next, total]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!total) {
    return (
      <section className="h-[60vh] md:h-[70vh] bg-black flex items-center justify-center text-neutral-300">
        <p>No featured titles</p>
      </section>
    );
  }

  const current = cleaned[index];
  const bgUrl = current?.thumbnailUrl || current?.posterUrl || "";

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[75vh] md:h-[80vh] overflow-hidden"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured titles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {bgUrl && (
        <img src={bgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" fetchpriority="high" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-10 lg:px-14 flex items-center">
        <article className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm">
            {current.title}
          </h1>

          {(current?.description || current?.genre || current?.year) && (
            <div className="mt-4 text-neutral-200/90 space-y-3">
              {current?.description && (
                <p className="text-base md:text-lg leading-relaxed line-clamp-3 md:line-clamp-4">
                  {current.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                {current?.rating && (
                  <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 backdrop-blur">
                    <StarIcon className="w-4 h-4" /> {current.rating}
                  </span>
                )}
                {current?.year && (
                  <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 backdrop-blur">
                    {current.year}
                  </span>
                )}
                {current?.genre && (
                  <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 backdrop-blur">
                    {Array.isArray(current.genre) ? current.genre.join(" • ") : String(current.genre)}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onPlay?.(current)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-2xl px-5 py-3 shadow-lg transition"
            >
              <PlayIcon className="w-5 h-5" /> Play Now
            </button>
            <button
              onClick={() => onMoreInfo?.(current)}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-semibold rounded-2xl px-5 py-3 backdrop-blur border border-white/20 transition"
            >
              <InfoIcon className="w-5 h-5" /> More Info
            </button>
          </div>
        </article>
      </div>

      <NavArrow direction="left" onClick={prev} />
      <NavArrow direction="right" onClick={next} />

      <nav className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2" aria-label="Slide navigation">
        {cleaned.map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/70"}`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          />
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div className="h-full bg-white transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} aria-hidden />
      </div>

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {total}: {current?.title}
      </span>
    </section>
  );
}

function NavArrow({ direction = "left", onClick }) {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      className={`group absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-3" : "right-3"} z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 active:bg-black/70 border border-white/10 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/70`}
      aria-label={isLeft ? "Previous slide" : "Next slide"}
    >
      {isLeft ? <ChevronLeft className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
    </button>
  );
}

// Inline icons
function ChevronLeft(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"/></svg>);}
function ChevronRight(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"/></svg>);}
function PlayIcon(props){return(<svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8 5v14l11-7z"/></svg>);}
function InfoIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);}
function StarIcon(props){return(<svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);}

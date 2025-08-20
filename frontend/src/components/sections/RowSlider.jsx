import React, { useRef } from "react";
import MovieCard from "../movie/MovieCard";

export default function RowSlider({ title, movies = [], onMovieClick }) {
  const ref = useRef(null);
  const scrollBy = (dir = 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!movies?.length) return null;

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-3 px-1">
        <h3 className="text-xl md:text-2xl font-semibold text-white">{title}</h3>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scrollBy(-1)} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">‹</button>
          <button onClick={() => scrollBy(1)} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white">›</button>
        </div>
      </div>

      <div
        ref={ref}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {movies.map((m) => (
          <div key={m.id} className="snap-start shrink-0 w-[160px] sm:w-[200px]">
            <MovieCard movie={m} onClick={() => onMovieClick?.(m)} layout="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}

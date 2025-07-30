import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import MovieCard from './MovieCard';
import { SkeletonLoader } from '../common/Loader';

const MovieCarousel = ({
  title,
  movies = [],
  isLoading = false,
  onMovieClick,
  showTitle = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  slidesToShow = 6,
  className = ''
}) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoPlayRef = useRef(null);

  // Calculate slide width based on container and number of slides to show
  const getSlideWidth = () => {
    if (!carouselRef.current) return 0;
    const containerWidth = carouselRef.current.offsetWidth;
    const gap = 16; // 1rem gap between items
    return (containerWidth - (gap * (slidesToShow - 1))) / slidesToShow;
  };

  // Update scroll button states
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll to specific position
  const scrollTo = (scrollLeft) => {
    if (!carouselRef.current) return;
    
    carouselRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  // Scroll left
  const scrollLeftHandler = () => {
    if (!carouselRef.current) return;
    
    const slideWidth = getSlideWidth();
    const newScrollLeft = Math.max(0, carouselRef.current.scrollLeft - slideWidth * 3);
    scrollTo(newScrollLeft);
  };

  // Scroll right
  const scrollRightHandler = useCallback(() => {
    if (!carouselRef.current) return;
    
    const slideWidth = getSlideWidth();
    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
    const newScrollLeft = Math.min(maxScroll, carouselRef.current.scrollLeft + slideWidth * 3);
    scrollTo(newScrollLeft);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || movies.length === 0) return;

    autoPlayRef.current = setInterval(() => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      
      if (scrollLeft >= scrollWidth - clientWidth - 1) {
        // Reset to beginning
        scrollTo(0);
        setCurrentIndex(0);
      } else {
        // Scroll to next set
        scrollRightHandler();
        setCurrentIndex(prev => prev + 1);
      }
    }, autoPlayInterval);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, movies.length, scrollRightHandler]);

  // Mouse drag functionality
  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    if (!carouselRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Update scroll buttons on scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => updateScrollButtons();
    carousel.addEventListener('scroll', handleScroll);
    
    // Initial update
    updateScrollButtons();

    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [movies]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeaveCarousel = () => {
    if (autoPlay && movies.length > 0) {
      autoPlayRef.current = setInterval(() => {
        scrollRightHandler();
      }, autoPlayInterval);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && (
          <div className="h-8 bg-netflix-gray rounded w-64 animate-pulse"></div>
        )}
        <SkeletonLoader type="row" count={1} />
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && title && (
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        )}
        <div className="text-center py-8">
          <p className="text-netflix-lightGray">No movies available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveCarousel}
    >
      {/* Title */}
      {showTitle && title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          {movies.length > slidesToShow && (
            <div className="flex items-center space-x-2">
              <button
                onClick={scrollLeftHandler}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full transition-all duration-200 ${
                  canScrollLeft
                    ? 'bg-netflix-darkGray/80 hover:bg-netflix-gray text-white'
                    : 'bg-netflix-gray/50 text-netflix-lightGray cursor-not-allowed'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={scrollRightHandler}
                disabled={!canScrollRight}
                className={`p-2 rounded-full transition-all duration-200 ${
                  canScrollRight
                    ? 'bg-netflix-darkGray/80 hover:bg-netflix-gray text-white'
                    : 'bg-netflix-gray/50 text-netflix-lightGray cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {movies.length > slidesToShow && (
          <button
            onClick={scrollLeftHandler}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center transition-opacity duration-200 ${
              canScrollLeft 
                ? 'opacity-0 group-hover:opacity-100 hover:opacity-100' 
                : 'opacity-0 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Right Scroll Button */}
        {movies.length > slidesToShow && (
          <button
            onClick={scrollRightHandler}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center transition-opacity duration-200 ${
              canScrollRight 
                ? 'opacity-0 group-hover:opacity-100 hover:opacity-100' 
                : 'opacity-0 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Movies Container */}
        <div
          ref={carouselRef}
          className={`flex gap-4 overflow-x-auto scrollbar-hide ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            scrollSnapType: 'x mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0"
              style={{
                scrollSnapAlign: 'start',
                width: `calc((100% - ${(slidesToShow - 1) * 16}px) / ${slidesToShow})`
              }}
            >
              <MovieCard
                movie={movie}
                onClick={onMovieClick}
                showHover={!isDragging}
                showDetails={true}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicators for Auto-play */}
      {autoPlay && movies.length > slidesToShow && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(movies.length / slidesToShow) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const slideWidth = getSlideWidth();
                scrollTo(slideWidth * slidesToShow * index);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-netflix-red'
                  : 'bg-netflix-gray hover:bg-netflix-lightGray'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieCarousel;
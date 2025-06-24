"use client"

import { useState, useRef } from "react"
import type { MediaItem } from "@/lib/types"
import MediaCard from "./MediaCard"

interface MediaSectionProps {
  title: string
  items: MediaItem[]
  onItemClick: (item: MediaItem) => void
}

export default function MediaSection({ title, items, onItemClick }: MediaSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const getVisibleCardCount = () => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.clientWidth;
    const cardWidth = 400; // Angepasst an neue Kartenbreite (war 350)
    return Math.floor(containerWidth / cardWidth);
  };

  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setIsAtStart(scrollLeft <= 0);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault(); // Verhindert unerwünschte Standardaktionen
    if (!containerRef.current) return;
    const visibleCards = getVisibleCardCount();
    const scrollAmount = (400 + 16) * visibleCards; // Angepasst an neue Kartenbreite
    containerRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Verhindert unerwünschte Standardaktionen
    if (!containerRef.current) return;
    const visibleCards = getVisibleCardCount();
    const scrollAmount = (400 + 16) * visibleCards; // Angepasst an neue Kartenbreite
    containerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="cards-container-wrapper">
        <div 
          className="cards-container" 
          ref={containerRef}
          onScroll={checkScrollPosition}
        >
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onClick={onItemClick} />
          ))}
        </div>
        
        {items.length > getVisibleCardCount() && (
          <>
            {!isAtStart && (
              <button 
                className="card-nav-button card-nav-prev" 
                onClick={handlePrev}
                type="button"
              >
                ←
              </button>
            )}
            {!isAtEnd && (
              <button 
                className="card-nav-button card-nav-next" 
                onClick={handleNext}
                type="button"
              >
                →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

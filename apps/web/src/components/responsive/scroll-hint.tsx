import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface ScrollHintProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente que adiciona um indicador visual de scroll horizontal
 * Útil para tabelas que precisam scroll em mobile
 */
export function ScrollHint({ children, className = '' }: ScrollHintProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const hasScroll = container.scrollWidth > container.clientWidth;
      const scrolledToEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

      setShowHint(hasScroll && !scrolledToEnd);
      setIsScrolled(container.scrollLeft > 10);
    };

    // Check initially
    checkScroll();

    // Check on scroll
    container.addEventListener('scroll', checkScroll);

    // Check on resize
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${className}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6',
        }}
      >
        {children}
      </div>

      {/* Scroll hint overlay (right side) */}
      {showHint && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/95 to-transparent pointer-events-none flex items-center justify-end pr-2 animate-pulse">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>
      )}

      {/* Scrolled indicator (left side) */}
      {isScrolled && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/95 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

export default ScrollHint;

'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface InstagramEmbedProps {
  permalink: string;
  className?: string;
}

export function InstagramEmbed({ permalink, className = '' }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the Instagram embed script has already loaded, reprocess embeds
    if (typeof window !== 'undefined' && (window as any).instgrm?.Embeds) {
      (window as any).instgrm.Embeds.process();
    }
  }, [permalink]);

  return (
    <div ref={containerRef} className={className}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '1px',
          maxWidth: '540px',
          minWidth: '326px',
          padding: 0,
          width: 'calc(100% - 2px)',
        }}
      >
        <a href={permalink} target="_blank" rel="noopener noreferrer">
          View this post on Instagram
        </a>
      </blockquote>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          if ((window as any).instgrm?.Embeds) {
            (window as any).instgrm.Embeds.process();
          }
        }}
      />
    </div>
  );
}

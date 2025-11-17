"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  alt: string;
  thumbnail?: string;
  videoUrl?: string;
  className?: string;
};

export default function RecipeCover({ alt, thumbnail, videoUrl, className = "" }: Props) {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const didAttemptRef = useRef(false);

  useEffect(() => {
    if (snapshot || didAttemptRef.current) return;
    if (!thumbnail && videoUrl) {
      didAttemptRef.current = true;
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.preload = "auto";

      const onLoaded = async () => {
        try {
          // seek a bit to avoid fully black first frame
          video.currentTime = 0.2;
        } catch {}
      };

      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          // Aim for 4:5 aspect snapshot
          const width = 600;
          const height = Math.round((5 / 4) * 600);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Compute cover cropping for 4:5 from the 9:16 video
          const vW = video.videoWidth || 1080;
          const vH = video.videoHeight || 1920;
          const targetRatio = 4 / 5;
          const srcRatio = vW / vH; // ~0.5625 for 9:16

          let sx = 0, sy = 0, sWidth = vW, sHeight = vH;
          if (srcRatio < targetRatio) {
            // video narrower than target -> crop top/bottom
            sHeight = Math.round(vW / targetRatio);
            sy = Math.round((vH - sHeight) / 2); // center crop
          } else if (srcRatio > targetRatio) {
            // video wider than target -> crop sides (unlikely for 9:16)
            sWidth = Math.round(vH * targetRatio);
            sx = Math.round((vW - sWidth) / 2);
          }

          ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
          const url = canvas.toDataURL("image/jpeg", 0.8);
          setSnapshot(url);
        } catch {}
      };

      video.addEventListener("loadeddata", onLoaded, { once: true });
      video.addEventListener("seeked", onSeeked, { once: true });
      // kick off
      video.load();

      return () => {
        video.removeEventListener("loadeddata", onLoaded);
        video.removeEventListener("seeked", onSeeked);
      };
    }
  }, [snapshot, thumbnail, videoUrl]);

  const src = thumbnail || snapshot;

  return (
    <div className={`relative aspect-[4/5] bg-slate-200 overflow-hidden ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-300" />
      )}
    </div>
  );
}

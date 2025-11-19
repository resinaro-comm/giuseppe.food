'use client';

interface RecipeVideoPlayerProps {
  videoUrl: string;
  instagramUrl: string;
  poster?: string;
}

export function RecipeVideoPlayer({ videoUrl, instagramUrl, poster }: RecipeVideoPlayerProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">
        Watch the original video
      </h2>
      <div
        className="relative w-full max-w-sm mx-auto md:mx-0 overflow-hidden rounded-2xl border border-slate-200 bg-black"
        style={{ aspectRatio: '4 / 5', maxHeight: '450px' }}
      >
        <video
          controls
          muted
          defaultMuted
          playsInline
          preload="auto"
          poster={poster}
          className="w-full h-full object-cover object-center"
          onVolumeChange={(e) => {
            // Enforce muted playback even if users tweak controls
            if (!e.currentTarget.muted) e.currentTarget.muted = true;
            e.currentTarget.volume = 0;
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser doesn&apos;t support video playback.
        </video>
      </div>
      <p className="text-xs text-slate-500">
        Originally posted on{' '}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Instagram
        </a>
      </p>
    </div>
  );
}

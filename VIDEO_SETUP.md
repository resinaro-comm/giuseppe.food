# Video Management for giuseppe.food

## Self-hosting Instagram Videos

To enable inline video playback without redirecting to Instagram, you need to download and host your own Instagram videos.

### Step 1: Download Videos from Instagram

**Option A: Using yt-dlp (Recommended)**
```bash
# Install yt-dlp
pip install yt-dlp

# Download a specific reel/post
yt-dlp "https://www.instagram.com/reel/SHORTCODE/" -o "public/videos/%(id)s.%(ext)s"

# Or download with custom filename
yt-dlp "https://www.instagram.com/reel/DRJ0tEPAqba/" -o "public/videos/roast-chicken.mp4"
```

**Option B: Using browser tools**
1. Open Instagram post in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Play the video
5. Find the `.mp4` request
6. Right-click → Copy URL → Download

**Option B: Online downloaders**
- snapinsta.app
- instadownloader.com
- (Use at your own discretion)

### Step 2: Organize Videos

Place downloaded videos in:
```
public/
  videos/
    roast-chicken.mp4
    beef-braciole.mp4
    ...
```

### Step 3: Update Recipe Data

Add `videoUrl` to your recipes in `src/data/recipes.ts`:

```typescript
{
  slug: "roast-chicken",
  title: "Roast Chicken",
  thumbnail: "/images/roast-chicken.jpg",
  instagramUrl: "https://www.instagram.com/reel/DRJ0tEPAqba/",
  videoUrl: "/videos/roast-chicken.mp4", // ← Add this
  // ... rest of recipe
}
```

### Video Format Best Practices

- **Format**: MP4 (H.264 codec)
- **Orientation**: Vertical (9:16 aspect ratio)
- **Max size**: ~50MB per video (consider compression)
- **Compression**: Use HandBrake or ffmpeg if needed

```bash
# Compress video with ffmpeg
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow output.mp4
```

### Fallback Behavior

If `videoUrl` is not provided, the app automatically falls back to Instagram embed (which redirects on play).

### Legal Notes

- Only self-host videos **you own the rights to**
- Keep the Instagram attribution link visible
- Consider your Instagram terms of service
- For others' content, use the Instagram embed fallback

### Automation Script (Optional)

Create `scripts/download-videos.sh`:

```bash
#!/bin/bash
# Download all recipe videos from Instagram

yt-dlp "https://www.instagram.com/reel/DRJ0tEPAqba/" -o "public/videos/roast-chicken.mp4"
yt-dlp "https://www.instagram.com/reel/DRHY2XmgvqO/" -o "public/videos/beef-braciole.mp4"
# Add more as needed
```

Make it executable:
```bash
chmod +x scripts/download-videos.sh
./scripts/download-videos.sh
```

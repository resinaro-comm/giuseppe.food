#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const videosDir = path.resolve(process.cwd(), 'public', 'videos');

function hasCmd(cmd) {
  try {
    execSync(`${cmd} -version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!hasCmd('ffmpeg') || !hasCmd('ffprobe')) {
  console.error('ffmpeg/ffprobe not found. Please install ffmpeg to prepare videos.');
  process.exit(1);
}

function listMp4(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .map((f) => path.join(dir, f));
}

function getVideoCodec(file) {
  try {
    const out = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=nk=1:nw=1 ${JSON.stringify(
        file
      )}`,
      { encoding: 'utf8' }
    ).trim();
    return out;
  } catch (e) {
    return 'unknown';
  }
}

function faststart(input) {
  const tmp = input.replace(/\.mp4$/i, '.faststart.mp4');
  execSync(
    `ffmpeg -loglevel warning -y -i ${JSON.stringify(input)} -c copy -movflags +faststart ${JSON.stringify(tmp)}`,
    { stdio: 'inherit' }
  );
  fs.renameSync(tmp, input);
}

function transcodeToH264(input) {
  const tmp = input.replace(/\.mp4$/i, '.h264.mp4');
  execSync(
    `ffmpeg -loglevel warning -y -i ${JSON.stringify(input)} -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -crf 22 -c:a aac -b:a 128k -movflags +faststart ${JSON.stringify(tmp)}`,
    { stdio: 'inherit' }
  );
  fs.renameSync(tmp, input);
}

const files = listMp4(videosDir);
if (files.length === 0) {
  console.log('No MP4 files found under', videosDir);
  process.exit(0);
}

for (const file of files) {
  const codec = getVideoCodec(file);
  console.log(`\nProcessing ${path.basename(file)} (codec: ${codec})`);
  if (codec !== 'h264') {
    console.log('  -> Transcoding to H.264/AAC with faststart');
    transcodeToH264(file);
  } else {
    console.log('  -> Already H.264; ensuring faststart');
    faststart(file);
  }
}

console.log('\nAll videos prepared.');

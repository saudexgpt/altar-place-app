import { Directory, Filesystem } from '@capacitor/filesystem';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { storage } from '@/services/storage';
import type { Artist, Track } from '@/types/catalog';

const LOCAL_TRACKS_INDEX_KEY = 'local_tracks_index';
const localFilePath = (id: number) => `local-tracks/track_${Math.abs(id)}.dat`;

const LOCAL_ARTIST: Artist = {
  id: 0,
  name: 'On This Device',
  slug: 'on-this-device',
  avatar_url: null,
  bio: null,
  is_verified: false,
};

const MIME_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  flac: 'audio/flac',
  opus: 'audio/opus',
  weba: 'audio/webm',
};

function guessMimeType(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[extension] ?? 'audio/mpeg';
}

function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '');
}

function probeDuration(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', () => resolve(audio.duration || 0));
    audio.addEventListener('error', () => resolve(0));
    audio.src = dataUrl;
  });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface LocalTrackEntry {
  track: Track;
  mimeType: string;
  addedAt: string;
}

let idCounter = -Date.now();
function nextLocalId(): number {
  return idCounter--;
}

/**
 * Songs picked from the user's own device (or handed to the app via Android's
 * "Open With"), copied into private app storage via Capacitor Filesystem so
 * they survive app restarts without needing any backend. Mirrors the
 * Downloads store's storage pattern (lightweight metadata index in
 * Preferences, audio bytes on disk, reconstituted into a data: URI only at
 * play time).
 */
export const useLocalTracksStore = defineStore('localTracks', () => {
  const tracks = ref<Record<number, LocalTrackEntry>>({});
  const isInitialized = ref(false);

  async function persistIndex() {
    const serializable = Object.fromEntries(
      Object.entries(tracks.value).map(([id, entry]) => [id, entry])
    );
    await storage.set(LOCAL_TRACKS_INDEX_KEY, JSON.stringify(serializable));
  }

  async function initialize() {
    if (isInitialized.value) return;

    const raw = await storage.get(LOCAL_TRACKS_INDEX_KEY);
    tracks.value = raw ? JSON.parse(raw) : {};
    isInitialized.value = true;
  }

  async function addEntry(name: string, mimeType: string, base64Data: string): Promise<Track> {
    const id = nextLocalId();

    await Filesystem.writeFile({
      path: localFilePath(id),
      data: base64Data,
      directory: Directory.Data,
      recursive: true,
    });

    const duration = await probeDuration(`data:${mimeType};base64,${base64Data}`);

    const track: Track = {
      id,
      title: stripExtension(name),
      slug: `local-${Math.abs(id)}`,
      type: 'music',
      duration_seconds: duration,
      cover_url: null,
      description: null,
      is_explicit: false,
      plays_count: 0,
      release_date: null,
      stream_url: '',
      artist: LOCAL_ARTIST,
      is_favorited: false,
    };

    tracks.value[id] = { track, mimeType, addedAt: new Date().toISOString() };
    await persistIndex();
    return track;
  }

  /** Import songs picked via an `<input type="file">` element. */
  async function importFiles(files: File[]): Promise<Track[]> {
    const imported: Track[] = [];

    for (const file of files) {
      const base64Data = await readFileAsBase64(file);
      const track = await addEntry(file.name, file.type || guessMimeType(file.name), base64Data);
      imported.push(track);
    }

    return imported;
  }

  /** Import a single file handed to the app via Android's "Open With" (a content:// or file:// URI). */
  async function importFromUri(uri: string): Promise<Track> {
    const [stat, file] = await Promise.all([
      Filesystem.stat({ path: uri }),
      Filesystem.readFile({ path: uri }),
    ]);

    const base64Data = typeof file.data === 'string' ? file.data : await file.data.text();
    return addEntry(stat.name, guessMimeType(stat.name), base64Data);
  }

  function isLocalTrackId(id: number): boolean {
    return id in tracks.value;
  }

  async function toggleFavorite(id: number) {
    const entry = tracks.value[id];
    if (!entry) return;

    entry.track.is_favorited = !entry.track.is_favorited;
    await persistIndex();
  }

  /** Returns a playable copy of the track with its stream_url swapped for the local cached file. */
  async function getPlayableTrack(id: number): Promise<Track | null> {
    const entry = tracks.value[id];
    if (!entry) return null;

    const file = await Filesystem.readFile({ path: localFilePath(id), directory: Directory.Data });
    const data = typeof file.data === 'string' ? file.data : await file.data.text();

    return { ...entry.track, stream_url: `data:${entry.mimeType};base64,${data}` };
  }

  async function remove(id: number) {
    try {
      await Filesystem.deleteFile({ path: localFilePath(id), directory: Directory.Data });
    } catch {
      // File may already be gone; still clear the index entry below.
    }

    delete tracks.value[id];
    await persistIndex();
  }

  return {
    tracks,
    isInitialized,
    initialize,
    importFiles,
    importFromUri,
    isLocalTrackId,
    toggleFavorite,
    getPlayableTrack,
    remove,
  };
});

import { Directory, Filesystem } from '@capacitor/filesystem';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import type { Track } from '@/types/catalog';
import { DEMO_MODE } from '@/demo/demoData';

const DOWNLOADS_INDEX_KEY = 'downloaded_tracks_index';
const downloadPath = (trackId: number) => `downloads/track-${trackId}.dat`;

interface DownloadEntry {
  track: Track;
  downloadedAt: string;
}

/**
 * Offline downloads: the audio bytes are cached on-device via Capacitor
 * Filesystem (base64 data URI, portable across web/iOS/Android without
 * needing platform-specific URI conversion), and the track metadata index
 * is kept in Preferences so the Downloads tab can render without touching
 * disk for every track.
 */
export const useDownloadsStore = defineStore('downloads', () => {
  const downloads = ref<Record<number, DownloadEntry>>({});
  const downloadingIds = ref<Set<number>>(new Set());
  const isInitialized = ref(false);

  async function persistIndex() {
    await storage.set(DOWNLOADS_INDEX_KEY, JSON.stringify(downloads.value));
  }

  async function initialize() {
    if (isInitialized.value) return;

    const raw = await storage.get(DOWNLOADS_INDEX_KEY);
    downloads.value = raw ? JSON.parse(raw) : {};
    isInitialized.value = true;
  }

  function isDownloaded(trackId: number): boolean {
    return Boolean(downloads.value[trackId]);
  }

  function isDownloading(trackId: number): boolean {
    return downloadingIds.value.has(trackId);
  }

  /**
   * Throws (with the server's message, e.g. a plan-limit rejection) if the
   * download isn't allowed — checked before fetching bytes so a
   * over-quota user doesn't burn bandwidth on a download that gets thrown
   * away.
   */
  async function download(track: Track) {
    if (isDownloaded(track.id) || isDownloading(track.id)) return;

    downloadingIds.value.add(track.id);

    try {
      if (!DEMO_MODE) {
        // Also feeds the creator analytics "Downloads" metric.
        await api.post(`/tracks/${track.id}/download-event`);
      }

      const response = await fetch(track.stream_url);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await Filesystem.writeFile({
        path: downloadPath(track.id),
        data: base64,
        directory: Directory.Data,
        recursive: true,
      });

      downloads.value[track.id] = { track, downloadedAt: new Date().toISOString() };
      await persistIndex();
    } finally {
      downloadingIds.value.delete(track.id);
    }
  }

  async function remove(trackId: number) {
    try {
      await Filesystem.deleteFile({ path: downloadPath(trackId), directory: Directory.Data });
    } catch {
      // File may already be gone; still clear the index entry below.
    }

    delete downloads.value[trackId];
    await persistIndex();
  }

  /** Returns a playable copy of the track with its stream_url swapped for the local cached file. */
  async function getPlayableTrack(trackId: number): Promise<Track | null> {
    const entry = downloads.value[trackId];
    if (!entry) return null;

    const file = await Filesystem.readFile({ path: downloadPath(trackId), directory: Directory.Data });
    const data = typeof file.data === 'string' ? file.data : await file.data.text();

    return { ...entry.track, stream_url: `data:audio/wav;base64,${data}` };
  }

  return {
    downloads,
    isInitialized,
    initialize,
    isDownloaded,
    isDownloading,
    download,
    remove,
    getPlayableTrack,
  };
});

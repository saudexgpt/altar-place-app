import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { Track } from '@/types/catalog';
import { libraryApi } from '@/services/library';
import { DEMO_MODE } from '@/demo/demoData';

export type RepeatMode = 'off' | 'one' | 'all';

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const usePlayerStore = defineStore('player', () => {
  const audio = new Audio();
  audio.preload = 'metadata';

  const queue = ref<Track[]>([]);
  const originalQueue = ref<Track[]>([]);
  const currentIndex = ref(-1);

  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const playbackRate = ref(1);
  const isShuffled = ref(false);
  const repeatMode = ref<RepeatMode>('off');
  const isBuffering = ref(false);

  const currentTrack = computed<Track | null>(() => queue.value[currentIndex.value] ?? null);
  const hasNext = computed(() => repeatMode.value !== 'off' || currentIndex.value < queue.value.length - 1);
  const hasPrevious = computed(() => repeatMode.value !== 'off' || currentIndex.value > 0);
  const progressPercent = computed(() => (duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0));

  function updateMediaSessionMetadata(track: Track) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist?.name ?? '',
      album: track.album?.title ?? '',
      artwork: track.cover_url ? [{ src: track.cover_url, sizes: '512x512', type: 'image/png' }] : [],
    });
  }

  function loadTrack(index: number, autoplay: boolean) {
    const track = queue.value[index];
    if (!track) return;

    currentIndex.value = index;
    audio.src = track.stream_url;
    audio.playbackRate = playbackRate.value;
    currentTime.value = 0;
    updateMediaSessionMetadata(track);

    if (autoplay) {
      void audio.play();
    }
  }

  /** Replace the queue and start playback at the given index. */
  function playQueue(tracks: Track[], startIndex = 0) {
    originalQueue.value = tracks;
    queue.value = isShuffled.value ? shuffleArray(tracks) : tracks;
    loadTrack(isShuffled.value ? queue.value.findIndex((t) => t.id === tracks[startIndex]?.id) : startIndex, true);
  }

  function playTrack(track: Track) {
    playQueue([track], 0);
  }

  /** Adds a track to the end of the queue without interrupting playback. */
  function enqueue(track: Track) {
    queue.value.push(track);
    originalQueue.value.push(track);
  }

  function togglePlayback() {
    if (!currentTrack.value) return;

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  /** Pauses the main track — used to stop it while an ad break overlay plays. */
  function pause() {
    audio.pause();
  }

  /** Resumes the main track — used after an ad break overlay finishes. */
  function resume() {
    if (currentTrack.value) void audio.play();
  }

  function next() {
    if (currentIndex.value < queue.value.length - 1) {
      loadTrack(currentIndex.value + 1, true);
    } else if (repeatMode.value === 'all') {
      loadTrack(0, true);
    }
  }

  function previous() {
    if (currentTime.value > 3) {
      seekTo(0);
      return;
    }

    if (currentIndex.value > 0) {
      loadTrack(currentIndex.value - 1, true);
    } else if (repeatMode.value === 'all') {
      loadTrack(queue.value.length - 1, true);
    }
  }

  function seekTo(seconds: number) {
    audio.currentTime = seconds;
    currentTime.value = seconds;
  }

  function seekToPercent(percent: number) {
    if (duration.value > 0) {
      seekTo((percent / 100) * duration.value);
    }
  }

  function setPlaybackRate(rate: number) {
    playbackRate.value = rate;
    audio.playbackRate = rate;
  }

  function toggleShuffle() {
    isShuffled.value = !isShuffled.value;
    const activeTrack = currentTrack.value;

    queue.value = isShuffled.value ? shuffleArray(originalQueue.value) : [...originalQueue.value];

    if (activeTrack) {
      currentIndex.value = queue.value.findIndex((t) => t.id === activeTrack.id);
    }
  }

  function cycleRepeatMode() {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    repeatMode.value = order[(order.indexOf(repeatMode.value) + 1) % order.length];
  }

  async function toggleLike() {
    const track = currentTrack.value;
    if (!track) return;

    const wasLiked = track.is_favorited ?? false;
    track.is_favorited = !wasLiked;

    if (DEMO_MODE) return;

    try {
      if (wasLiked) {
        await libraryApi.unfavoriteTrack(track.id);
      } else {
        await libraryApi.favoriteTrack(track.id);
      }
    } catch {
      track.is_favorited = wasLiked;
    }
  }

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime;
  });
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration || 0;
  });
  audio.addEventListener('waiting', () => {
    isBuffering.value = true;
  });
  audio.addEventListener('canplay', () => {
    isBuffering.value = false;
  });
  audio.addEventListener('play', () => {
    isPlaying.value = true;
  });
  audio.addEventListener('pause', () => {
    isPlaying.value = false;
  });
  audio.addEventListener('ended', () => {
    // A track reaching its natural end (vs. being skipped away from early)
    // is a strong taste signal for the recommendation engine. Only real
    // catalog tracks (positive ids) have a backend play-history row to flag
    // — demo/local-file tracks use negative synthetic ids and are skipped.
    if (!DEMO_MODE && currentTrack.value && currentTrack.value.id > 0) {
      void libraryApi.markTrackComplete(currentTrack.value.id);
    }

    if (repeatMode.value === 'one') {
      seekTo(0);
      void audio.play();
      return;
    }

    next();
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => void audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
  }

  watch(isPlaying, (playing) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  });

  return {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isShuffled,
    repeatMode,
    isBuffering,
    hasNext,
    hasPrevious,
    progressPercent,
    playQueue,
    playTrack,
    enqueue,
    togglePlayback,
    pause,
    resume,
    next,
    previous,
    seekTo,
    seekToPercent,
    setPlaybackRate,
    toggleShuffle,
    cycleRepeatMode,
    toggleLike,
  };
});

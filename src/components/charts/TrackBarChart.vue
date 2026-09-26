<template>
  <div class="bar-chart">
    <div class="bar-chart-legend">
      <span class="legend-item"><i class="legend-swatch legend-swatch--streams" />Streams</span>
      <span class="legend-item"><i class="legend-swatch legend-swatch--downloads" />Downloads</span>
    </div>

    <div v-for="row in rows" :key="row.id" class="bar-chart-row">
      <p class="bar-chart-label">{{ row.title }}</p>

      <div class="bar-chart-track">
        <div class="bar-chart-bar bar-chart-bar--streams" :style="{ width: `${row.streamsPercent}%` }">
          <span class="bar-chart-value">{{ row.streams }}</span>
        </div>
      </div>
      <div class="bar-chart-track">
        <div class="bar-chart-bar bar-chart-bar--downloads" :style="{ width: `${row.downloadsPercent}%` }">
          <span class="bar-chart-value">{{ row.downloads }}</span>
        </div>
      </div>
    </div>

    <p v-if="!rows.length" class="bar-chart-empty">No streams yet — data will appear here once listeners start playing your tracks.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CreatorTrackAnalytics } from '@/types/creator';

const props = defineProps<{
  tracks: CreatorTrackAnalytics[];
}>();

const rows = computed(() => {
  const maxValue = Math.max(1, ...props.tracks.map((t) => Math.max(t.streams, t.downloads)));

  return props.tracks.map((track) => ({
    id: track.id,
    title: track.title,
    streams: track.streams,
    downloads: track.downloads,
    streamsPercent: Math.max(2, (track.streams / maxValue) * 100),
    downloadsPercent: Math.max(2, (track.downloads / maxValue) * 100),
  }));
});
</script>

<style scoped>
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-chart-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}

.legend-swatch--streams {
  background: var(--ion-color-primary);
}

.legend-swatch--downloads {
  background: var(--ion-color-secondary);
}

.bar-chart-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-chart-label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-chart-track {
  height: 18px;
  background: var(--ion-item-background);
  border-radius: 4px;
  position: relative;
}

.bar-chart-bar {
  height: 100%;
  /* Rounded data-end, square at the baseline (grows from the left). */
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  transition: width 400ms ease-out;
  min-width: 28px;
}

.bar-chart-bar--streams {
  background: var(--ion-color-primary);
}

.bar-chart-bar--downloads {
  background: var(--ion-color-secondary);
}

.bar-chart-value {
  font-family: var(--app-font-mono);
  font-size: 11px;
  color: #fff;
}

.bar-chart-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 13px;
  padding: 16px 0;
}
</style>

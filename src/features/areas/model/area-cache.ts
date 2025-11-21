import type { Plant } from '@/entities/plant';

const cache = new Map<number, Plant>();

export function setAreasCache(list: Plant[]) {
  list.forEach((area) => {
    if (typeof area.id === 'number') {
      cache.set(area.id, area);
    }
  });
}

export function setAreaCache(area: Plant | null) {
  if (area && typeof area.id === 'number') {
    cache.set(area.id, area);
  }
}

export function getAreaFromCache(id?: number | string | null): Plant | null {
  if (id === undefined || id === null) return null;
  const numericId = typeof id === 'string' ? Number(id) : id;
  if (Number.isNaN(numericId)) return null;
  return cache.get(numericId) ?? null;
}

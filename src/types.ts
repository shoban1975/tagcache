export interface CacheEntry<V> {
  key: string;
  value: V;
  insertedAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}

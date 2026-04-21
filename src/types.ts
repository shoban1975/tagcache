export interface CacheEntry<V> {
  key: string;
  value: V;
  insertedAt: number;
  expiresAt: number | null;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  expirations: number;
}

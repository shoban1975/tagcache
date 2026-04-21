export interface CacheEntry<V> {
  key: string;
  value: V;
  insertedAt: number;
  tags: ReadonlySet<string>;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  invalidations: number;
}

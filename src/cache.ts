import { CacheEntry, CacheStats } from "./types.js";

/**
 * Tiny in-memory cache.
 *
 * Base implementation: pre-TTL, pre-tags. Two parallel feature branches
 * extend this:
 *   - feat/ttl   adds per-entry expiry + a background sweeper.
 *   - feat/tags  adds tag-based invalidation (set with tags, then
 *                invalidateTag(t) removes every entry that carries t).
 *
 * Both branches modify set(), get(), and the CacheEntry type.
 */
export class Cache<V> {
  private store = new Map<string, CacheEntry<V>>();
  private hits = 0;
  private misses = 0;

  set(key: string, value: V): void {
    const entry: CacheEntry<V> = {
      key,
      value,
      insertedAt: Date.now(),
    };
    this.store.set(key, entry);
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (entry === undefined) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats(): CacheStats {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
    };
  }
}

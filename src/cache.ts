import { CacheEntry, CacheStats } from "./types.js";
import { TagIndex } from "./tagIndex.js";

/**
 * Tiny in-memory cache.
 *
 * feat/tags: tag-based invalidation.
 *   - set(key, value, tags?)              attach tags to an entry.
 *   - invalidateTag(tag)                  remove every entry that carries tag.
 *   - tagsFor(key)                        introspect the tags on a key.
 */
export class Cache<V> {
  private store = new Map<string, CacheEntry<V>>();
  private hits = 0;
  private misses = 0;
  private invalidations = 0;
  private tagIndex = new TagIndex();

  set(key: string, value: V, tags?: Iterable<string>): void {
    if (this.store.has(key)) {
      this.tagIndex.removeKey(key);
    }
    const tagSet: ReadonlySet<string> =
      tags === undefined ? new Set() : new Set(tags);
    const entry: CacheEntry<V> = {
      key,
      value,
      insertedAt: Date.now(),
      tags: tagSet,
    };
    this.store.set(key, entry);
    if (tagSet.size > 0) {
      this.tagIndex.add(key, tagSet);
    }
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
    if (!this.store.has(key)) return false;
    this.tagIndex.removeKey(key);
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.tagIndex.clear();
    this.hits = 0;
    this.misses = 0;
    this.invalidations = 0;
  }

  stats(): CacheStats {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      invalidations: this.invalidations,
    };
  }

  /**
   * Remove every entry that carries the given tag.
   * Returns the number of entries invalidated.
   */
  invalidateTag(tag: string): number {
    const keys = this.tagIndex.keysFor(tag);
    let removed = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        this.tagIndex.removeKey(key);
        removed++;
      }
    }
    this.invalidations += removed;
    return removed;
  }

  /** Snapshot of the tags on a key, or [] if missing. */
  tagsFor(key: string): string[] {
    const entry = this.store.get(key);
    if (entry === undefined) return [];
    return Array.from(entry.tags);
  }
}

import { CacheEntry, CacheStats } from "./types.js";

/**
 * Tiny in-memory cache.
 *
 * feat/ttl: per-entry expiry + background sweeper.
 *   - set(key, value, ttlMs?)  if ttlMs is given, entry expires that many ms later.
 *   - get(key)                 returns undefined for expired entries (and deletes them).
 *   - new Cache({ sweepIntervalMs }) starts a background timer that proactively
 *     removes expired entries; clear all timers with .destroy().
 */
export interface CacheOptions {
  sweepIntervalMs?: number;
}

export class Cache<V> {
  private store = new Map<string, CacheEntry<V>>();
  private hits = 0;
  private misses = 0;
  private expirations = 0;
  private sweeper: ReturnType<typeof setInterval> | null = null;

  constructor(options: CacheOptions = {}) {
    if (options.sweepIntervalMs && options.sweepIntervalMs > 0) {
      this.sweeper = setInterval(() => this.sweep(), options.sweepIntervalMs);
      // Don't keep the event loop alive just for sweeping.
      if (typeof this.sweeper.unref === "function") this.sweeper.unref();
    }
  }

  set(key: string, value: V, ttlMs?: number): void {
    const now = Date.now();
    const entry: CacheEntry<V> = {
      key,
      value,
      insertedAt: now,
      expiresAt: ttlMs && ttlMs > 0 ? now + ttlMs : null,
    };
    this.store.set(key, entry);
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (entry === undefined) {
      this.misses++;
      return undefined;
    }
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.expirations++;
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (entry === undefined) return false;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.expirations = 0;
  }

  stats(): CacheStats {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      expirations: this.expirations,
    };
  }

  /**
   * Proactively remove entries whose TTL has passed.
   * Called by the background sweeper if one was started.
   */
  sweep(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        this.store.delete(key);
        this.expirations++;
        removed++;
      }
    }
    return removed;
  }

  /** Stop the background sweeper. Idempotent. */
  destroy(): void {
    if (this.sweeper !== null) {
      clearInterval(this.sweeper);
      this.sweeper = null;
    }
  }
}

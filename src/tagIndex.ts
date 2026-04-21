/**
 * Bidirectional tag index: tag -> set of keys, key -> set of tags.
 *
 * Used by Cache to support invalidateTag() in O(|keys-with-that-tag|)
 * without scanning every entry.
 */
export class TagIndex {
  private tagToKeys = new Map<string, Set<string>>();
  private keyToTags = new Map<string, Set<string>>();

  add(key: string, tags: Iterable<string>): void {
    const tagSet = new Set<string>();
    for (const t of tags) {
      tagSet.add(t);
      let bucket = this.tagToKeys.get(t);
      if (bucket === undefined) {
        bucket = new Set<string>();
        this.tagToKeys.set(t, bucket);
      }
      bucket.add(key);
    }
    if (tagSet.size > 0) {
      this.keyToTags.set(key, tagSet);
    }
  }

  /** Remove the key from every tag bucket it belongs to. */
  removeKey(key: string): void {
    const tags = this.keyToTags.get(key);
    if (tags === undefined) return;
    for (const t of tags) {
      const bucket = this.tagToKeys.get(t);
      if (bucket === undefined) continue;
      bucket.delete(key);
      if (bucket.size === 0) this.tagToKeys.delete(t);
    }
    this.keyToTags.delete(key);
  }

  /** Returns the keys that carry the given tag (snapshot). */
  keysFor(tag: string): string[] {
    const bucket = this.tagToKeys.get(tag);
    return bucket === undefined ? [] : Array.from(bucket);
  }

  clear(): void {
    this.tagToKeys.clear();
    this.keyToTags.clear();
  }
}

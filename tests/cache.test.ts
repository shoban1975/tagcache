import { describe, it, expect } from "vitest";
import { Cache } from "../src/cache.js";

describe("Cache", () => {
  it("sets and gets a value", () => {
    const c = new Cache<number>();
    c.set("a", 1);
    expect(c.get("a")).toBe(1);
  });

  it("returns undefined for unknown keys", () => {
    const c = new Cache<number>();
    expect(c.get("missing")).toBeUndefined();
  });

  it("overwrites existing keys", () => {
    const c = new Cache<string>();
    c.set("k", "v1");
    c.set("k", "v2");
    expect(c.get("k")).toBe("v2");
  });

  it("deletes keys", () => {
    const c = new Cache<number>();
    c.set("a", 1);
    expect(c.delete("a")).toBe(true);
    expect(c.has("a")).toBe(false);
  });

  it("delete returns false for unknown keys", () => {
    const c = new Cache<number>();
    expect(c.delete("missing")).toBe(false);
  });

  it("clears all entries", () => {
    const c = new Cache<number>();
    c.set("a", 1);
    c.set("b", 2);
    c.clear();
    expect(c.stats().size).toBe(0);
  });

  it("tracks hit/miss stats", () => {
    const c = new Cache<number>();
    c.set("a", 1);
    c.get("a");
    c.get("a");
    c.get("missing");
    const s = c.stats();
    expect(s.hits).toBe(2);
    expect(s.misses).toBe(1);
    expect(s.size).toBe(1);
  });

  it("clear() resets hit/miss counters", () => {
    const c = new Cache<number>();
    c.set("a", 1);
    c.get("a");
    c.clear();
    expect(c.stats().hits).toBe(0);
    expect(c.stats().misses).toBe(0);
  });

  it("invalidateTag() removes every entry with the tag", () => {
    const c = new Cache<number>();
    c.set("u:1:profile", 1, ["user:1"]);
    c.set("u:1:settings", 2, ["user:1"]);
    c.set("u:2:profile", 3, ["user:2"]);
    expect(c.invalidateTag("user:1")).toBe(2);
    expect(c.has("u:1:profile")).toBe(false);
    expect(c.has("u:1:settings")).toBe(false);
    expect(c.has("u:2:profile")).toBe(true);
    expect(c.stats().invalidations).toBe(2);
  });

  it("invalidateTag() returns 0 for an unknown tag", () => {
    const c = new Cache<number>();
    c.set("a", 1, ["t1"]);
    expect(c.invalidateTag("t-unknown")).toBe(0);
  });

  it("tagsFor() returns the tags on a key", () => {
    const c = new Cache<number>();
    c.set("a", 1, ["t1", "t2"]);
    expect(new Set(c.tagsFor("a"))).toEqual(new Set(["t1", "t2"]));
    expect(c.tagsFor("missing")).toEqual([]);
  });

  it("re-setting a key removes it from old tag buckets", () => {
    const c = new Cache<number>();
    c.set("a", 1, ["t1"]);
    c.set("a", 2, ["t2"]);
    expect(c.invalidateTag("t1")).toBe(0);
    expect(c.has("a")).toBe(true);
    expect(c.invalidateTag("t2")).toBe(1);
    expect(c.has("a")).toBe(false);
  });

  it("delete() removes the key from its tag buckets", () => {
    const c = new Cache<number>();
    c.set("a", 1, ["t1"]);
    c.delete("a");
    expect(c.invalidateTag("t1")).toBe(0);
  });
});

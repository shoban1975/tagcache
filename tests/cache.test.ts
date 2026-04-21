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
});

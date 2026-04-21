# tagcache

A tiny in-memory cache for Node / TypeScript.

## Status

This is the **`feat/tags`** branch. It adds tag-based invalidation on top of
the base implementation.

## Usage

```ts
import { Cache } from "tagcache";

const c = new Cache<number>();

// Attach tags at insertion time.
c.set("u:1:profile",  loadProfile(1),  ["user:1"]);
c.set("u:1:settings", loadSettings(1), ["user:1"]);
c.set("u:2:profile",  loadProfile(2),  ["user:2"]);

// Single call invalidates every entry that carries the tag.
c.invalidateTag("user:1"); // 2

c.tagsFor("u:2:profile"); // ["user:2"]
```

### Notes

- Re-setting a key replaces its tag set entirely (the key is removed from
  its old tag buckets first).
- `delete(key)` also removes the key from every tag bucket it was in, so
  tag invalidation never points at stale entries.

## License

MIT

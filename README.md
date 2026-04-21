# tagcache

A tiny in-memory cache for Node / TypeScript.

## Status

This is the **base** version. Two parallel feature branches extend it:

- `feat/ttl` — adds per-entry time-to-live with a background sweeper.
- `feat/tags` — adds tag-based invalidation (set with `tags`, then `invalidateTag(t)` removes every entry that carries `t`).

Both branches are independently green on `npm test`. Merging them is the
work of this task.

## Usage (base API)

```ts
import { Cache } from "tagcache";

const c = new Cache<number>();
c.set("a", 1);
c.get("a"); // 1
c.delete("a");
c.stats(); // { size, hits, misses }
```

## License

MIT

# tagcache

A tiny in-memory cache for Node / TypeScript.

## Status

This is the **`feat/ttl`** branch. It adds per-entry expiry on top of the
base implementation.

## Usage

```ts
import { Cache } from "tagcache";

const c = new Cache<number>({ sweepIntervalMs: 1000 });

// Per-entry TTL in milliseconds. Omit to keep forever.
c.set("session:42", 1, 30_000);
c.get("session:42"); // 1, until 30s later

// Lazy expiry on get() + has().
// Background sweeper proactively reclaims memory if you opt in.
c.destroy(); // stop the sweeper
```

### Options

- `sweepIntervalMs`: if > 0, start a background timer that proactively removes
  expired entries every N ms. The timer is `unref()`'d so it won't keep the
  Node event loop alive on its own. Call `.destroy()` to stop it explicitly.

## License

MIT

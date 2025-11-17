// Simple rate-limit and ban utilities with Redis (Upstash) if available,
// and an in-memory fallback for local dev.

type Store = {
  incr: (key: string, expireSeconds: number) => Promise<number>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, expireSeconds?: number) => Promise<void>;
};

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const memory = (() => {
  const map = new Map<string, { value: string; expiresAt: number }>();
  return {
    incr: async (key: string, expireSeconds: number) => {
      const now = Date.now();
      const current = map.get(key);
      if (!current || current.expiresAt < now) {
        map.set(key, { value: "1", expiresAt: now + expireSeconds * 1000 });
        return 1;
      }
      const n = (parseInt(current.value || "0", 10) || 0) + 1;
      current.value = String(n);
      return n;
    },
    get: async (key: string) => {
      const now = Date.now();
      const v = map.get(key);
      if (!v || v.expiresAt < now) return null;
      return v.value;
    },
    set: async (key: string, value: string, expireSeconds = 0) => {
      const expiresAt = expireSeconds > 0 ? Date.now() + expireSeconds * 1000 : Date.now() + 365 * 24 * 3600 * 1000;
      map.set(key, { value, expiresAt });
    },
  } satisfies Store;
})();

const redis: Store | null = url && token ? {
  incr: async (key: string, expireSeconds: number) => {
    const count = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).then((r) => r.json()).then((j) => j.result as number);

    if (count === 1 && expireSeconds > 0) {
      await fetch(`${url}/expire/${encodeURIComponent(key)}/${expireSeconds}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    }
    return count;
  },
  get: async (key: string) => {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).then((r) => r.json());
    return (res.result ?? null) as string | null;
  },
  set: async (key: string, value: string, expireSeconds = 0) => {
    if (expireSeconds > 0) {
      await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${expireSeconds}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } else {
      await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    }
  },
} : null;

const store: Store = redis ?? memory;

export type LimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetSeconds: number;
  current: number;
};

export async function checkLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<LimitResult> {
  const current = await store.incr(key, windowSeconds);
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    limit,
    resetSeconds: windowSeconds,
    current,
  };
}

export async function isBanned(ip: string): Promise<boolean> {
  const v = await store.get(`ban:${ip}`);
  return v === "1";
}

export async function banIp(ip: string, seconds: number): Promise<void> {
  await store.set(`ban:${ip}`, "1", seconds);
}

export async function recordViolation(ip: string, windowSeconds = 600): Promise<number> {
  const n = await store.incr(`viol:${ip}`, windowSeconds);
  return n;
}

export const hasRedis = !!redis;

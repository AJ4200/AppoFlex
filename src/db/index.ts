import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }

  // Neon needs TLS. sslmode is handled here so the driver doesn't apply its own interpretation.
  const connectionString = url.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
    max: 10,
    idleTimeoutMillis: 30_000,
    // Generous enough for Neon to wake a suspended database
    connectionTimeoutMillis: 20_000,
  });
  // Idle connections are dropped by Neon; without a handler this would crash the process
  pool.on("error", (error) => console.warn("[db] idle connection error:", error.message));

  return drizzle(pool, { schema });
}

const globalForDb = globalThis as unknown as { __db?: Db };

// Created lazily so importing this module never fails during build
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    globalForDb.__db ??= createDb();
    return Reflect.get(globalForDb.__db, prop, receiver);
  },
});

export * from "./schema";

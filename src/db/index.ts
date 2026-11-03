import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

// Neon suspends idle databases; the request that wakes one can fail with a network error.
// Retrying only on thrown network errors (never on HTTP responses) is safe for writes.
const RETRIES = 3;
neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError;
};

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  return drizzle(neon(url), { schema });
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

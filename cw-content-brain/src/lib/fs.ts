import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const workspaceRoot = resolve(new URL("../..", import.meta.url).pathname);

export function fromRoot(path: string): string {
  return resolve(workspaceRoot, path);
}

export async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(fromRoot(path), "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  const target = fromRoot(path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeText(path: string, value: string): Promise<void> {
  const target = fromRoot(path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}


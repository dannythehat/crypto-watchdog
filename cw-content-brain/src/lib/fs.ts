import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageMarker = "cw-content-brain";

export function resolveToolRoot(start = process.cwd()): string {
  let current = resolve(start);

  while (true) {
    if (current.endsWith(packageMarker) && existsSync(resolve(current, "package.json"))) {
      return current;
    }

    if (existsSync(resolve(current, "cw-content-brain", "package.json"))) {
      return resolve(current, "cw-content-brain");
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return resolve(dirname(fileURLToPath(import.meta.url)), "../..");
}

export const workspaceRoot = resolveToolRoot();
export const repoRoot = resolve(workspaceRoot, "..");

export function fromRoot(path: string): string {
  return resolve(workspaceRoot, path);
}

export function fromRepoRoot(path: string): string {
  return resolve(repoRoot, path);
}

export async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(fromRoot(path), "utf8");
  return JSON.parse(raw) as T;
}

export async function readRepoText(path: string): Promise<string> {
  return readFile(fromRepoRoot(path), "utf8");
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

export function isDirectRun(metaUrl: string): boolean {
  return process.argv[1] ? fileURLToPath(metaUrl) === resolve(process.argv[1]) : false;
}

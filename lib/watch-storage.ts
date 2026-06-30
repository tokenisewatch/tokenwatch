import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { WatchMetadata } from "@/lib/watch-metadata";

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "watches");
export const METADATA_DIR = path.join(process.cwd(), "data", "watches");

export async function ensureStorageDirs() {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(METADATA_DIR, { recursive: true });
}

export async function saveWatchMetadata(metadata: WatchMetadata) {
  await ensureStorageDirs();
  const filePath = path.join(METADATA_DIR, `${metadata.watchId}.json`);
  await writeFile(filePath, JSON.stringify(metadata, null, 2), "utf-8");
  return filePath;
}

export function metadataFilePath(watchId: string | number) {
  return path.join(METADATA_DIR, `${watchId}.json`);
}

import crypto from "node:crypto";
import fs from "node:fs";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import type { LauncherManifest } from "@mmorpg/shared-types";

export async function fetchLauncherManifest(updateBaseUrl: string): Promise<LauncherManifest> {
  const response = await fetch(`${updateBaseUrl}/manifest.json`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Manifest request failed: ${response.status}`);
  }

  return response.json() as Promise<LauncherManifest>;
}

export async function downloadAsset(url: string, targetPath: string) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Asset download failed: ${response.status}`);
  }

  await pipeline(Readable.fromWeb(response.body as unknown as WebReadableStream<Uint8Array>), fs.createWriteStream(targetPath));
}

export async function verifyAsset(filePath: string, expectedSha256: string) {
  const hash = crypto.createHash("sha256");
  for await (const chunk of fs.createReadStream(filePath)) {
    hash.update(chunk);
  }
  const actual = hash.digest("hex");

  return {
    ok: actual === expectedSha256,
    actual,
    expected: expectedSha256
  };
}

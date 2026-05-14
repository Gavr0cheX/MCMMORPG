import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type JavaDetectionResult = {
  detected: boolean;
  version?: string;
  path?: string;
  error?: string;
  minecraftInstalled?: boolean;
  searchedPaths?: string[];
};

export async function detectJava(): Promise<JavaDetectionResult> {
  const candidates = javaCandidates();
  for (const candidate of candidates) {
    const result = await tryJava(candidate);
    if (result.detected) {
      return result;
    }
  }

  const fallback = await tryJava("java");
  if (fallback.detected) {
    return fallback;
  }

  const minecraftInstalled = fs.existsSync("/Applications/Minecraft.app");
  return {
    detected: false,
    minecraftInstalled,
    searchedPaths: candidates,
    error: minecraftInstalled
      ? "Minecraft.app is installed, but no Java runtime was found. Open the official Minecraft Launcher once to download its runtime, install Java 21, or set MINECRAFT_JAVA_PATH."
      : "Java runtime was not found. Install Java 21 or set MINECRAFT_JAVA_PATH."
  };
}

async function tryJava(javaPath: string): Promise<JavaDetectionResult> {
  try {
    const { stderr, stdout } = await execFileAsync(javaPath, ["-version"], { timeout: 5000 });
    const output = `${stderr}\n${stdout}`;
    const version = versionFromOutput(output);
    return {
      detected: true,
      path: javaPath,
      ...(version ? { version } : {})
    };
  } catch (error) {
    return {
      detected: false,
      error: error instanceof Error ? error.message : "Java not detected",
      path: javaPath
    };
  }
}

function javaCandidates() {
  const home = os.homedir();
  const candidates = [
    process.env.MINECRAFT_JAVA_PATH,
    process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, "bin/java") : undefined,
    ...javaHomeCandidates(),
    "/opt/homebrew/opt/openjdk@21/bin/java",
    "/opt/homebrew/opt/openjdk/bin/java",
    "/usr/local/opt/openjdk@21/bin/java",
    "/usr/local/opt/openjdk/bin/java",
    ...jvmBundleCandidates("/Library/Java/JavaVirtualMachines"),
    ...jvmBundleCandidates(path.join(home, "Library/Java/JavaVirtualMachines")),
    ...minecraftRuntimeCandidates(path.join(home, "Library/Application Support/minecraft/runtime"))
  ].filter(Boolean) as string[];

  return [...new Set(candidates)].filter((candidate) => fs.existsSync(candidate));
}

function javaHomeCandidates() {
  const candidates: string[] = [];
  for (const args of [["-v", "21"], []] as string[][]) {
    try {
      const result = execFileSyncString("/usr/libexec/java_home", args);
      if (result) {
        candidates.push(path.join(result.trim(), "bin/java"));
      }
    } catch {
      // macOS reports a friendly no-Java message here; keep scanning other locations.
    }
  }
  return candidates;
}

function jvmBundleCandidates(root: string) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name, "Contents/Home/bin/java"));
}

function minecraftRuntimeCandidates(root: string) {
  const candidates: string[] = [];
  collectJavaExecutables(root, candidates, 0, 10);
  return candidates;
}

function collectJavaExecutables(current: string, candidates: string[], depth: number, maxDepth: number) {
  if (depth > maxDepth || !fs.existsSync(current)) {
    return;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(current, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(current, entry.name);
    if (entry.isFile() && entry.name === "java" && entryPath.includes(`${path.sep}bin${path.sep}java`)) {
      candidates.push(entryPath);
      continue;
    }

    if (entry.isDirectory()) {
      collectJavaExecutables(entryPath, candidates, depth + 1, maxDepth);
    }
  }
}

function execFileSyncString(command: string, args: string[]) {
  return fs.existsSync(command)
    ? execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
    : "";
}

function versionFromOutput(output: string) {
  return output.match(/version "([^"]+)"/)?.[1] ?? output.match(/openjdk ([^\s]+)/)?.[1];
}

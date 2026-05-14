/// <reference types="vite/client" />

interface Window {
  launcher: {
    config(): Promise<{
      apiBaseUrl: string;
      updateBaseUrl: string;
      minecraftServerHost: string;
      minecraftServerPort: number;
      minecraftSessionHostSuffix: string;
    }>;
    manifest(): Promise<{
      channel: string;
      version: string;
      minecraftVersion: string;
      assetBaseUrl: string;
    }>;
    java(): Promise<{ detected: boolean; version?: string; path?: string; error?: string; minecraftInstalled?: boolean; searchedPaths?: string[] }>;
    launchMinecraft(input: {
      accessToken: string;
      minecraftUsername?: string;
      serverSlug?: string;
    }): Promise<{
      status: "prepared" | "started";
      username: string;
      serverSlug: string;
      serverHost: string;
      sessionHost: string;
      port: number;
      expiresAt: string;
      args: string[];
      pid?: number;
    }>;
    verifyAsset(input: { filePath: string; sha256: string }): Promise<{ ok: boolean; actual: string; expected: string }>;
    openExternal(url: string): Promise<void>;
    onUpdateAvailable(callback: (info: unknown) => void): () => void;
  };
}

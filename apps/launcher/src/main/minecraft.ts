import { spawn } from "node:child_process";
import { detectJava } from "./java.js";

export type MinecraftLaunchInput = {
  accessToken: string;
  minecraftUsername?: string;
  serverSlug?: string;
};

export type MinecraftLaunchResult = {
  status: "prepared" | "started";
  username: string;
  serverSlug: string;
  serverHost: string;
  sessionHost: string;
  port: number;
  expiresAt: string;
  args: string[];
  pid?: number;
};

type PlaySessionResponse = {
  token: string;
  username: string;
  expiresAt: string;
};

const DEFAULT_SERVER_HOST = "localhost";
const DEFAULT_SERVER_PORT = 25565;
const DEFAULT_SESSION_HOST_SUFFIX = "127.0.0.1.sslip.io";

export async function launchMinecraft(input: MinecraftLaunchInput, apiBaseUrl: string): Promise<MinecraftLaunchResult> {
  if (!input.accessToken) {
    throw new Error("You must authenticate before launching.");
  }

  const playSession = await startPlaySession(apiBaseUrl, input.accessToken, input.minecraftUsername);
  const serverHost = normalizeHost(process.env.MINECRAFT_SERVER_HOST ?? DEFAULT_SERVER_HOST);
  const port = Number.parseInt(process.env.MINECRAFT_SERVER_PORT ?? String(DEFAULT_SERVER_PORT), 10);
  const sessionHost = buildSessionHost(playSession.token, process.env.MINECRAFT_SESSION_HOST_SUFFIX ?? DEFAULT_SESSION_HOST_SUFFIX);
  const args = ["--server", sessionHost, "--port", String(Number.isFinite(port) ? port : DEFAULT_SERVER_PORT)];
  const executable = process.env.MINECRAFT_LAUNCH_EXECUTABLE;

  if (!executable) {
    return {
      status: "prepared",
      username: playSession.username,
      serverSlug: input.serverSlug ?? "lobby",
      serverHost,
      sessionHost,
      port: Number.isFinite(port) ? port : DEFAULT_SERVER_PORT,
      expiresAt: playSession.expiresAt,
      args
    };
  }

  const java = await detectJava();
  if (!java.detected) {
    throw new Error(java.error ?? "Java runtime was not detected.");
  }

  const child = spawn(executable, [...launchTemplateArgs(args)], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();

  return {
    status: "started",
    username: playSession.username,
    serverSlug: input.serverSlug ?? "lobby",
    serverHost,
    sessionHost,
    port: Number.isFinite(port) ? port : DEFAULT_SERVER_PORT,
    expiresAt: playSession.expiresAt,
    args,
    ...(child.pid ? { pid: child.pid } : {})
  };
}

async function startPlaySession(apiBaseUrl: string, accessToken: string, minecraftUsername?: string) {
  const response = await fetch(`${apiBaseUrl}/launcher/session/start`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(minecraftUsername ? { minecraftUsername } : {})
  });

  if (!response.ok) {
    throw new Error(`Unable to create launcher play session: ${response.status}`);
  }

  return response.json() as Promise<PlaySessionResponse>;
}

function normalizeHost(host: string) {
  const withoutProtocol = host.replace(/^https?:\/\//, "");
  const authority = withoutProtocol.split("/")[0] ?? DEFAULT_SERVER_HOST;
  const hostname = authority.split(":")[0] ?? DEFAULT_SERVER_HOST;
  return hostname.replace(/\.$/, "");
}

function buildSessionHost(token: string, suffix: string) {
  const normalizedSuffix = normalizeHost(suffix);
  return `session-${token}.${normalizedSuffix}`;
}

function launchTemplateArgs(connectionArgs: string[]) {
  const template = process.env.MINECRAFT_LAUNCH_ARGS;
  if (!template) {
    return connectionArgs;
  }

  return template
    .split(" ")
    .filter(Boolean)
    .flatMap((part) => {
      if (part === "{connectionArgs}") {
        return connectionArgs;
      }

      const serverHost = connectionArgs[1] ?? "";
      const serverPort = connectionArgs[3] ?? "";
      return part.replace("{serverHost}", serverHost).replace("{serverPort}", serverPort);
    });
}

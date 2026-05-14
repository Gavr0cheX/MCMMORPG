type LauncherConfig = {
  apiBaseUrl: string;
  updateBaseUrl: string;
  minecraftServerHost: string;
  minecraftServerPort: number;
  minecraftSessionHostSuffix: string;
};

let config: LauncherConfig | null = null;
let accessToken: string | null = null;

async function getConfig() {
  config ??= await window.launcher.config();
  return config;
}

export async function launcherLogin(identifier: string, password: string) {
  const { apiBaseUrl } = await getConfig();
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identifier, password })
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const payload = await response.json();
  accessToken = payload.accessToken;
  return payload;
}

export async function getServerStatus() {
  const { apiBaseUrl } = await getConfig();
  const response = await fetch(`${apiBaseUrl}/servers/status`, accessToken ? { headers: { authorization: `Bearer ${accessToken}` } } : undefined);

  if (!response.ok) {
    throw new Error("Unable to load server status");
  }

  return response.json();
}

export function isAuthenticated() {
  return Boolean(accessToken);
}

export async function launchGame(minecraftUsername?: string) {
  if (!accessToken) {
    throw new Error("Authenticate before launching");
  }

  return window.launcher.launchMinecraft({
    accessToken,
    ...(minecraftUsername ? { minecraftUsername } : {})
  });
}

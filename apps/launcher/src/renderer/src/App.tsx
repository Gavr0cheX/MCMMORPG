import { useEffect, useState } from "react";
import { launcherLogin, getServerStatus, launchGame } from "./lib/api.js";

type User = {
  username: string;
  displayName?: string | null;
};

export function App() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [manifest, setManifest] = useState<{ version: string; minecraftVersion: string } | null>(null);
  const [java, setJava] = useState<{ detected: boolean; version?: string; path?: string; error?: string; minecraftInstalled?: boolean } | null>(null);
  const [servers, setServers] = useState<Array<{ slug: string; status: string; onlinePlayers: number; maxPlayers: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!("launcher" in window)) {
      setError("Launcher bridge failed to initialize. Rebuild the packaged app and restart it.");
      return;
    }

    void window.launcher.manifest().then(setManifest).catch(() => undefined);
    void window.launcher.java().then(setJava);
    void getServerStatus().then(setServers).catch(() => undefined);
  }, []);

  async function submit() {
    setError(null);
    setLaunchStatus(null);
    try {
      const response = await launcherLogin(identifier, password);
      setUser(response.user);
      setServers(await getServerStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function play() {
    if (!user) {
      return;
    }

    setError(null);
    setLaunchStatus(null);
    setLaunching(true);

    try {
      const result = await launchGame(user.username);
      setLaunchStatus(result.status === "started" ? "Client started." : `Launch session ready for ${result.serverHost}:${result.port}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <main className="launcher">
      <section className="hero">
        <div>
          <p className="eyebrow">MMORPG Network</p>
          <h1>Launcher</h1>
          <p className="copy">Authenticate, patch, verify assets, and enter the Velocity network from one desktop client.</p>
        </div>
        <div className="status-strip">
          <span>Launcher {manifest?.version ?? "checking"}</span>
          <span>Minecraft {manifest?.minecraftVersion ?? "checking"}</span>
          <span>{java?.detected ? `Java ${java.version ?? "detected"}` : "Java required"}</span>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>{user ? `Welcome, ${user.displayName ?? user.username}` : "Login"}</h2>
          {!user ? (
            <div className="form">
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="email or username" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password" type="password" />
              {error ? <p className="error">{error}</p> : null}
              <button onClick={submit}>Authenticate</button>
            </div>
          ) : (
            <div className="form">
              {error ? <p className="error">{error}</p> : null}
              {launchStatus ? <p className="success">{launchStatus}</p> : null}
              <button onClick={play} disabled={launching}>
                {launching ? "Preparing" : "Play"}
              </button>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Server Status</h2>
          <div className="server-list">
            {servers.map((server) => (
              <div key={server.slug} className="server-row">
                <span>{server.slug}</span>
                <span>{server.status}</span>
                <strong>
                  {server.onlinePlayers}/{server.maxPlayers}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Patch Plan</h2>
          <p>Manifest checks, CDN downloads, SHA-256 verification, and modpack sync are handled before launch.</p>
          <p className="muted">
            {java?.detected
              ? `Java runtime ready${java.version ? `: ${java.version}` : ""}.`
              : java?.minecraftInstalled
                ? "Minecraft is installed. Java was not found as a system runtime, so Play will prepare a session while the full client runner is wired."
                : java?.error ?? "Checking Java runtime."}
          </p>
        </div>
      </section>
    </main>
  );
}

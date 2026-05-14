# Security

## Principles

- The backend is authoritative.
- Never trust launcher, website, or plugin-submitted economy/inventory values.
- Treat Redis pub/sub as internal coordination, not a durable ledger.
- Keep all internal tokens out of images and source control.

## Implemented Controls

- JWT access tokens and rotating refresh sessions.
- HttpOnly refresh and access cookies for browser route protection.
- Password hashing with bcrypt.
- Fastify rate limiting, helmet, CORS controls, and centralized errors.
- Internal heartbeat token for plugin-to-API server status updates.
- Economy admin actions create audit logs.
- Velocity modern forwarding configured.

## Production Additions

- Add email verification and password reset.
- Add MFA for admins.
- Move secrets to a managed secret store.
- Add WAF rules at Cloudflare.
- Add ban/mute enforcement at the proxy layer.
- Add signed launcher session handoff for game joins.

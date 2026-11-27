Status: active
Needs user: no
Updated: 2026-11-27 20:45
Agent: Claude desktop app, Opus 5.5

## Goal and why

Show my_star as a Discord activity on the user's profile, with a live avatar and profile links.

## Current state

- Discord app "with my_star" made (ID 1575857055397322893). Bot token is in `.env` (not committed).
- `.env` is complete. The live fetch works: it returns Miyabi (@my_star) and the real avatar.
- `npm start` ran and printed "Connected to Discord. Activity is live."
- User confirmed: the card shows, and the GIF avatar moves.

## Next steps

1. Optional: auto-start at Windows login (the program now runs only inside a session).
2. If the avatar does not show, upload it as an Art Asset (Rich Presence > Art Assets) as a fallback.

## Open problems

- `detailsUrl` / `stateUrl` / `largeImageUrl` are new Discord fields. They may not be clickable on all clients.

## Decisions and lessons (keep)

- Option A chosen: app name `with my_star`, type Playing, live avatar via bot token.
- Re-sending the same activity stops the GIF. Send only when data changes.
- Making a Discord app asks for an hCaptcha, and a token reset asks for 2FA. The user must do both.

## Where to look

- `index.js`, `README.md`

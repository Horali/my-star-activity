Status: active
Needs user: Look at your Discord profile and confirm the card shows the avatar, name and button.
Updated: 2026-11-27 20:25
Agent: Claude desktop app, Opus 5.5

## Goal and why

Show my_star as a Discord activity on the user's profile, with a live avatar and profile links.

## Current state

- Discord app "with my_star" made (ID 1575857055397322893). Bot token is in `.env` (not committed).
- `.env` is complete. The live fetch works: it returns Miyabi (@my_star) and the real avatar.
- `npm start` ran and printed "Connected to Discord. Activity is live."
- Not seen on screen yet: the Discord window was hidden in the tray.

## Next steps

1. User checks the card on their profile (a friend sees the button; the user does not).
2. If the avatar does not show, upload it as an Art Asset (Rich Presence > Art Assets) as a fallback.
3. my_star's avatar is animated (hash starts with `a_`). Try `.gif` in `avatarUrl()` if a moving avatar is wanted.
4. Optional: auto-start at Windows login.

## Open problems

- `detailsUrl` / `stateUrl` / `largeImageUrl` are new Discord fields. They may not be clickable on all clients.

## Decisions and lessons (keep)

- Option A chosen: app name `with my_star`, type Playing, live avatar via bot token.
- Making a Discord app asks for an hCaptcha, and a token reset asks for 2FA. The user must do both.

## Where to look

- `index.js`, `README.md`

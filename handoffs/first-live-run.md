Status: waiting
Needs user: Make the Discord application and fill in .env (README steps 1-7), then run npm start.
Updated: 2026-11-27 20:10
Agent: Claude desktop app, Opus 5.5

## Goal and why

Show my_star as a Discord activity on the user's profile, with a live avatar and profile links.

## Current state

- Program done and pushed. Dry run tested with a fake ID: output is correct.
- A bad bot token falls back to `config.json` values (tested, 401 handled).
- Not tested on real Discord yet: needs the user's application ID, bot token and my_star's user ID.

## Next steps

1. User follows README setup and runs `npm start`.
2. Check with the user (or a screenshot from a friend) that the card shows the avatar and button.
3. If the external avatar URL does not show, upload the avatar as an Art Asset as a fallback.
4. Optional: auto-start at Windows login.

## Open problems

- `detailsUrl` / `stateUrl` / `largeImageUrl` are new Discord fields. They may not be clickable on all clients.

## Decisions and lessons (keep)

- Option A chosen: app name `with my_star`, type Playing, live avatar via bot token.

## Where to look

- `index.js`, `README.md`

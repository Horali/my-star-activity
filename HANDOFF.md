# Handoff: my-star-activity

Discord Rich Presence program. It shows "Playing with my_star" with my_star's live avatar.
Repo: github.com/Horali/my-star-activity (private). Read `README.md` for setup.

## Active tasks

- First real run on Discord: `handoffs/first-live-run.md`
- Activity Controller link (Phase 2): task file `handoffs/phase2-connect-projects.md` in the DiscordActivityController repo

## Key facts

- Node 26, ES modules. Library: `@xhayper/discord-rpc` (supports `detailsUrl`, `stateUrl`, `largeImageUrl`).
- `index.js`: reads `.env` (CLIENT_ID, BOT_TOKEN, FRIEND_ID) and `config.json`.
- Avatar comes from `GET /users/{id}` with the bot token, every `refreshMinutes`.
- The Discord application name is the card headline. It must be `with my_star`.
- Never use a user token (selfbot). Never commit `.env`.

## Activity Controller

- `controller-client.mjs` (a copy from DiscordActivityController) checks in at `127.0.0.1:47400` every 2 s.
- The card shows only when Horaya says on AND the light is green or `none` (no controller). The controller switch does not change Horaya yet.

## Where to look

- `index.js`, `config.json`, `README.md`, `.env.example`

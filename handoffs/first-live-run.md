Status: waiting
Needs user: User is finding where the main Horaya runs (not Wispbyte: only horaya-backup there; user says not Kerit). Then HORAYA_URL + MYSTAR_SECRET + redeploy.
Updated: 2026-11-27 20:55
Agent: Claude desktop app, Opus 5.5
Touches: DiscordBot (Horali/Horaya-Bot): mystar.py, /mystar command, GET /mystar

## Goal and why

Show my_star as a Discord activity on the user's profile, with a live GIF avatar and profile links.
The user turns it on and off with Horaya's `/mystar on|off`. Default off.

## Current state

- Card works (user confirmed). App icon = my_star's avatar (fixes the "?" in voice channels; still picture).
- Program auto-starts at login: Startup\MyStarActivity.vbs -> start-hidden.vbs. Log: activity.log.
- Single-instance guard on 127.0.0.1:47321.
- Horaya code pushed (not deployed). `.env` has MYSTAR_SECRET; HORAYA_URL is empty, so the card is always on now.

## Next steps

1. User gives Horaya's public URL -> put it in `.env` as HORAYA_URL, restart the program.
2. User sets MYSTAR_SECRET on Horaya's host and redeploys. Test `/mystar on` and `/mystar off`.
3. Check that the GIF keeps moving with one copy running.

## Open problems

- Discord's client can pause GIFs (window not focused). Not in our control.
- A Discord reload (Ctrl+R) clears the card, but the program gets no event. Restart the program after a reload.
- The "?" voice icon: app icon is set (API shows it). Not confirmed yet in the voice list.

## Decisions and lessons (keep)

- Option A: app name `with my_star`, type Playing, live avatar via bot token.
- Re-sending the activity stops the GIF. Send only on change. Earlier GIF stops came from 3 copies running:
  TaskStop killed npm but not its node child.
- /mystar is for OWNER_ID only (not my_star, who is also in OWNER_IDS).
- Making a Discord app asks for an hCaptcha, and a token reset asks for 2FA. The user must do both.

## Where to look

- `index.js`, `README.md`, ../DiscordBot/mystar.py

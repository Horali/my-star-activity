Status: waiting
Needs user: Test /mystar on and /mystar off in Discord.
Updated: 2026-11-27 21:00
Agent: Claude desktop app, Opus 5.5
Touches: DiscordBot (Horali/Horaya-Bot): mystar.py, bot.py

## Goal and why

Show my_star as a Discord activity, with a live GIF avatar and profile links.
The user turns it on and off with Horaya's `/mystar on|off`. Default off.

## Current state

- Horaya (main role) runs on Wispbyte server "horaya-backup" at 78.154.103.20:14797.
  MYSTAR_SECRET is set there. GET /mystar works (tested: key -> JSON, no key -> 404).
- PC program: HORAYA_URL set, restarted, reads "Toggle: off". Runs hidden; auto-starts at login.
- App icon = my_star's avatar (voice "?" icon). Not confirmed in the voice list.

## Next steps

1. User runs /mystar on -> card shows within 15 s. /mystar off -> card goes away.
2. Confirm the voice-list icon.

## Open problems

- Discord's client can pause GIFs (window not focused). Not in our control.
- A Discord reload (Ctrl+R) clears the card with no event. Fix: run /mystar on again (rev counter re-sends).

## Decisions and lessons (keep)

- Wispbyte has no .git in the server, so Auto Update does nothing. Deploy = upload changed files in
  the Files page, then Restart. The upload tool reads only from this repo: copy files to `.upload/` first.
- Re-sending the activity stops the GIF. Send only on change. Single-instance guard on 127.0.0.1:47321.
- TaskStop kills npm but not its node child: kill node by PID.
- /mystar is for OWNER_ID only (not my_star, who is also in OWNER_IDS).
- Creating a Discord app needs an hCaptcha; a token reset needs 2FA. The user does both.
- Never type secrets into web fields: the user pastes them (clipboard is fine).

## Where to look

- `index.js`, `README.md`, ../DiscordBot/mystar.py

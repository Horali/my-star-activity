Status: waiting
Needs user: Confirm the card shows on the profile after the reconnect fix.
Updated: 2026-11-28 01:30
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

- /mystar is ONE command with optional options: power (on/off), status (2-128), reset_status. No options = show.
  Deployed and restarted; GET /mystar returns {on, rev, status}.

## Next steps

1. User runs /mystar options tested by the user and work.
2. Confirm the voice-list icon.

## Open problems

- Discord's client can pause GIFs (window not focused). Not in our control.

## Decisions and lessons (keep)

- Never reuse a destroyed RPC Client: on close the library destroys it. Make a new Client per link.
  The program checks client.isConnected every 15 s and reconnects (tested with Ctrl+R: card came back).
- Queue the sends: two sends at once showed the card twice.

- Horaya deploy: push to Horali/Horaya-Bot, then Restart on Wispbyte. The startup command now starts with a
  git-init-in-place block (tested: pulled 1b13e4c). Wispbyte's Clone button needs an empty server: do not use it.
- Re-sending the activity stops the GIF. Send only on change. Single-instance guard on 127.0.0.1:47321.
- TaskStop kills npm but not its node child: kill node by PID.
- /mystar is for OWNER_ID only (not my_star, who is also in OWNER_IDS).
- Creating a Discord app needs an hCaptcha; a token reset needs 2FA. The user does both.
- Never type secrets into web fields: the user pastes them (clipboard is fine).

- Do not use subcommands for /mystar: Discord put typed text into the subcommand slot ("Not a valid value").

## Where to look

- `index.js`, `README.md`, ../DiscordBot/mystar.py

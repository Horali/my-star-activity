# my-star-activity

A custom Discord activity. Your profile shows **"Playing with my_star"**, with my_star's live avatar,
their name, and links to their profile.

Other people see the card. You cannot see the button on your own card. This is normal.

## Set up (one time)

1. Open https://discord.com/developers/applications and click **New Application**.
2. Name the application `with my_star`. This name becomes the headline: "Playing with my_star".
3. On **General Information**, copy the **Application ID**.
4. Open the **Bot** page. Click **Reset Token** and copy the token. Keep it secret.
5. In Discord, open **Settings > Advanced** and turn on **Developer Mode**.
6. Right-click my_star's name and click **Copy User ID**.
7. Copy `.env.example` to `.env`. Paste the 3 values into `.env`.

You do not need to add the bot to a server. The bot only reads my_star's public profile.

## Run

The program starts by itself at Windows login, with no window. The file
`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MyStarActivity.vbs` runs `start-hidden.vbs`.
The output goes to `activity.log`. Only one copy can run at a time.

To start it by hand: run `npm install` (first time only), then `npm start`.

To check the card data without Discord, run `npm run dry`.

## Turn it on and off

Use Horaya's `/mystar on` and `/mystar off`. The card changes in about 15 seconds. The default is off.

1. Put Horaya's public address in `.env` as `HORAYA_URL`.
2. Put the same `MYSTAR_SECRET` in `.env` here and in Horaya's host `.env`.

If `HORAYA_URL` is empty, the card is always on. If Horaya does not answer, the card keeps its last state.

## Voice channel icon

The small icon next to your name in a voice channel is the Discord app's icon. The program sets it to my_star's
avatar, and updates it when the avatar changes. Discord shows this icon as a still picture.

## Why the GIF can stop

Discord's own app decides when a GIF plays. For example, it can pause GIFs when the Discord window is not focused.
The program sends the card only one time, because every re-send makes Discord reload the image.

## Change the text

Edit `config.json`:

- `state`: the second line under the name.
- `smallImage`: an image URL for the small corner badge (empty = no badge).
- `refreshMinutes`: how often the program reads the avatar again.
- `fallback`: the name and avatar to show if the bot token is missing or fails.

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

1. Open the Discord desktop app.
2. Run `npm install` (first time only).
3. Run `npm start`.

Keep the window open. When you close it, the activity goes away.

To check the card data without Discord, run `npm run dry`.

## Change the text

Edit `config.json`:

- `state`: the second line under the name.
- `smallImage`: an image URL for the small corner badge (empty = no badge).
- `refreshMinutes`: how often the program reads the avatar again.
- `fallback`: the name and avatar to show if the bot token is missing or fails.

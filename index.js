// Shows "Playing with my_star" on your Discord profile, with my_star's live avatar.
import { Client } from "@xhayper/discord-rpc";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("./config.json", import.meta.url), "utf8"));
const { CLIENT_ID, BOT_TOKEN, FRIEND_ID } = process.env;
const DRY_RUN = process.argv.includes("--dry");
const REFRESH_MS = config.refreshMinutes * 60 * 1000;
const RETRY_MS = 15 * 1000;
const startedAt = Date.now();

if (!CLIENT_ID || !FRIEND_ID) {
  console.error("Missing CLIENT_ID or FRIEND_ID in .env. See README.md.");
  process.exit(1);
}

const profileUrl = `https://discord.com/users/${FRIEND_ID}`;

// Fallback values when the bot token is missing or Discord's API fails.
let friend = { ...config.fallback };

function avatarUrl(user) {
  if (!user.avatar) {
    const index = Number((BigInt(FRIEND_ID) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${FRIEND_ID}/${user.avatar}.png?size=512`;
}

async function fetchFriend() {
  if (!BOT_TOKEN) return;
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${FRIEND_ID}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Discord API answered ${res.status}`);
    const user = await res.json();
    friend = {
      displayName: user.global_name || user.username,
      username: user.username,
      avatar: avatarUrl(user),
    };
    console.log(`Fetched ${friend.displayName} (@${friend.username})`);
  } catch (err) {
    console.warn(`Could not fetch friend, using last known data: ${err.message}`);
  }
}

function buildActivity() {
  return {
    type: 0, // "Playing" -> the card reads "Playing <app name>", e.g. "Playing with my_star"
    details: friend.displayName,
    detailsUrl: profileUrl,
    state: config.state,
    stateUrl: profileUrl,
    largeImageKey: friend.avatar,
    largeImageText: `@${friend.username}`,
    largeImageUrl: profileUrl,
    smallImageKey: config.smallImage || undefined,
    smallImageText: config.smallImageText || undefined,
    startTimestamp: startedAt,
    buttons: [{ label: `View ${friend.username}'s profile`.slice(0, 32), url: profileUrl }],
  };
}

if (DRY_RUN) {
  await fetchFriend();
  console.log(JSON.stringify(buildActivity(), null, 2));
  process.exit(0);
}

const client = new Client({ clientId: CLIENT_ID });

async function push() {
  try {
    await client.user?.setActivity(buildActivity());
  } catch (err) {
    console.warn(`Could not set activity: ${err.message}`);
  }
}

client.on("ready", async () => {
  console.log("Connected to Discord. Activity is live.");
  await push();
});

client.on("disconnected", () => {
  console.warn("Discord closed. Trying again soon...");
  setTimeout(connect, RETRY_MS);
});

async function connect() {
  try {
    await client.login();
  } catch {
    console.warn("Discord is not open yet. Trying again in 15 seconds...");
    setTimeout(connect, RETRY_MS);
  }
}

await fetchFriend();
setInterval(async () => {
  await fetchFriend();
  await push();
}, REFRESH_MS);
connect();

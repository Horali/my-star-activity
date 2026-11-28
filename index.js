// Shows "Playing with my_star" on your Discord profile, with my_star's live avatar.
// Horaya's /mystar command turns it on or off (see README.md).
import { Client } from "@xhayper/discord-rpc";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { createControllerClient } from "./controller-client.mjs";

const config = JSON.parse(readFileSync(new URL("./config.json", import.meta.url), "utf8"));
const ICON_FILE = new URL("./.icon-avatar", import.meta.url);
const { CLIENT_ID, BOT_TOKEN, FRIEND_ID, HORAYA_URL, MYSTAR_SECRET } = process.env;
const DRY_RUN = process.argv.includes("--dry");
const REFRESH_MS = config.refreshMinutes * 60 * 1000;
const TOGGLE_MS = 15 * 1000;
const RETRY_MS = 15 * 1000;
const API = "https://discord.com/api/v10";
const startedAt = Date.now();

if (!CLIENT_ID || !FRIEND_ID) {
  console.error("Missing CLIENT_ID or FRIEND_ID in .env. See README.md.");
  process.exit(1);
}

const profileUrl = `https://discord.com/users/${FRIEND_ID}`;
const botHeaders = { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" };

// Fallback values when the bot token is missing or Discord's API fails.
let friend = { ...config.fallback };
let avatarHash = null;

function avatarUrl(hash) {
  if (!hash) {
    const index = Number((BigInt(FRIEND_ID) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  // Hashes that start with "a_" are animated avatars: use the GIF so the card moves.
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${FRIEND_ID}/${hash}.${ext}?size=512`;
}

async function fetchFriend() {
  if (!BOT_TOKEN) return;
  try {
    const res = await fetch(`${API}/users/${FRIEND_ID}`, { headers: botHeaders });
    if (!res.ok) throw new Error(`Discord API answered ${res.status}`);
    const user = await res.json();
    avatarHash = user.avatar;
    friend = {
      displayName: user.global_name || user.username,
      username: user.username,
      avatar: avatarUrl(user.avatar),
    };
    console.log(`Fetched ${friend.displayName} (@${friend.username})`);
  } catch (err) {
    console.warn(`Could not fetch friend, using last known data: ${err.message}`);
  }
}

// The app icon is the small picture next to your name in voice channels.
// Keep it the same as my_star's avatar. Upload only when the avatar changed.
async function syncAppIcon() {
  if (!BOT_TOKEN || !avatarHash) return;
  let last = null;
  try { last = readFileSync(ICON_FILE, "utf8").trim(); } catch {}
  if (last === avatarHash) return;
  try {
    const img = await fetch(friend.avatar);
    const type = img.headers.get("content-type") || "image/png";
    const data = Buffer.from(await img.arrayBuffer()).toString("base64");
    const res = await fetch(`${API}/applications/@me`, {
      method: "PATCH",
      headers: botHeaders,
      body: JSON.stringify({ icon: `data:${type};base64,${data}` }),
    });
    if (!res.ok) throw new Error(`Discord API answered ${res.status}`);
    writeFileSync(ICON_FILE, avatarHash);
    console.log("Updated the app icon to my_star's avatar.");
  } catch (err) {
    console.warn(`Could not update the app icon: ${err.message}`);
  }
}

// Asks Horaya if the card should show. Without HORAYA_URL the card is always on.
let wantOn = !HORAYA_URL;
let rev = null; // goes up on every /mystar on
let resend = false;
let status = ""; // from /mystar status; empty = config.state
async function checkToggle() {
  if (!HORAYA_URL) return;
  try {
    const res = await fetch(`${HORAYA_URL.replace(/\/$/, "")}/mystar`, {
      headers: { "X-Mystar-Key": MYSTAR_SECRET || "" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Horaya answered ${res.status}`);
    const data = await res.json();
    wantOn = Boolean(data.on);
    if (rev !== null && data.rev !== rev && wantOn) resend = true;
    rev = data.rev;
    const newStatus = typeof data.status === "string" ? data.status : "";
    if (newStatus !== status) {
      status = newStatus;
      resend = true;
      console.log(`Status: ${status || "(default)"}`);
    }
  } catch (err) {
    console.warn(`Could not ask Horaya, keeping the card ${wantOn ? "on" : "off"}: ${err.message}`);
  }
}

function buildActivity() {
  return {
    type: 0, // "Playing" -> the card reads "Playing <app name>", e.g. "Playing with my_star"
    details: friend.displayName,
    detailsUrl: profileUrl,
    state: status || config.state,
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
  await checkToggle();
  console.log(`Toggle: ${wantOn ? "on" : "off"}`);
  console.log(JSON.stringify(buildActivity(), null, 2));
  process.exit(0);
}

// Only one copy may run. Two copies both send the card, and that stops the GIF.
const lock = createServer();
await new Promise((resolve) => {
  lock.once("error", () => {
    console.error("Another copy is already running. This copy stops.");
    process.exit(0);
  });
  lock.listen(47321, "127.0.0.1", resolve);
});

// The Activity Controller (traffic light). It decides which card shows when
// more than one program has a card. "none" means no controller runs: the card
// works alone, as before. "wait" means no answer yet: show nothing for a moment.
let light = "wait";
const allowed = () => wantOn && (light === "green" || light === "none");
const controller = createControllerClient({
  id: "mystar",
  name: "My Star",
  getState: () => ({
    ownSwitch: wantOn ? "on" : "off",
    online: connected,
    idle: false,
    showing: shown,
    preview: {
      headline: "Playing with my_star",
      details: friend.displayName || "",
      state: status || config.state || "",
      image: friend.avatar || "",
    },
  }),
  onLight: (next) => {
    if (next !== light) console.log(`Controller light: ${next}`);
    light = next;
    apply();
  },
});

let client = null;
let connected = false;
let shown = false; // what Discord shows now
let reconnecting = false;

// Send the card only when something changed.
// A re-send makes Discord reload the image, and the GIF can stop moving.
// Sends wait in a queue: two sends at the same time showed the card twice.
let queue = Promise.resolve();
function apply(force = false) {
  queue = queue.then(() => applyNow(force));
  return queue;
}

async function applyNow(force) {
  if (!connected) return;
  try {
    if (allowed() && (!shown || force)) {
      await client.user?.setActivity(buildActivity());
      shown = true;
      console.log("Card on.");
      controller.poke();
    } else if (!allowed() && shown) {
      await client.user?.clearActivity();
      shown = false;
      console.log("Card off.");
      controller.poke();
    }
  } catch (err) {
    // After a Discord reload (Ctrl+R) the old link breaks without a "disconnected" event.
    // Every send then fails, so start a new link. "ready" sends the card again.
    console.warn(`Could not update the card (${err?.message || err?.code || err}). Connecting again...`);
    await reconnect();
  }
}

async function reconnect() {
  if (reconnecting) return;
  reconnecting = true;
  connected = false;
  const old = client;
  client = null;
  try { await old?.destroy(); } catch {}
  reconnecting = false;
  connect();
}

function newClient() {
  const c = new Client({ clientId: CLIENT_ID });
  c.on("ready", async () => {
    if (c !== client) return;
    connected = true;
    shown = false;
    console.log("Connected to Discord.");
    await apply();
  });
  c.on("disconnected", () => {
    if (c !== client) return; // an old link we closed on purpose
    connected = false;
    console.warn("Discord closed. Trying again soon...");
    client = null;
    setTimeout(connect, RETRY_MS);
  });
  return c;
}

async function connect() {
  if (client) return;
  client = newClient();
  try {
    await client.login();
  } catch {
    client = null;
    console.warn("Discord is not open yet. Trying again in 15 seconds...");
    setTimeout(connect, RETRY_MS);
  }
}

await fetchFriend();
await syncAppIcon();
await checkToggle();
console.log(`Toggle: ${wantOn ? "on" : "off"}`);
controller.start();

setInterval(async () => {
  if (connected && client && !client.isConnected) {
    console.warn("The link to Discord is dead. Connecting again...");
    await reconnect();
  }
  await checkToggle();
  await apply(resend);
  resend = false;
}, TOGGLE_MS);

setInterval(async () => {
  const before = JSON.stringify(friend);
  await fetchFriend();
  if (JSON.stringify(friend) !== before) {
    console.log("Friend changed. Updating the card and icon.");
    await syncAppIcon();
    if (shown) await apply(true);
  }
}, REFRESH_MS);

connect();

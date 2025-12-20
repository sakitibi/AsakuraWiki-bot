const { Client, GatewayIntentBits } = require("discord.js");
const loadNgPatterns = require("./ngwords")
const listenSupabaseChange = require("./roomcode");
require("dotenv").config({
  path: "/Applications/NextTs/AsakuraWiki/discord_bot/.env"
});

// ▼ Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const juusanninTermsURL = "https://sakitibi-com9.webnode.jp/page/10";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  listenSupabaseChange(client, juusanninTermsURL);
});

client.login(process.env.DISCORD_BOT_TOKEN);

let NG_PATTERNS = loadNgPatterns();

// メッセージ監視
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const text = message.content;

  // 正規表現で判定
  const hit = NG_PATTERNS.find((regex) => regex.test(text));

  if (hit) {
    try {
      await message.delete();
      await message.channel.send(
        `⚠️ ${message.author} パターン: \`${hit}\` は[13nin利用規約](${juusanninTermsURL})に違反しています`
      );
    } catch (err) {
      console.error("NGワード処理エラー:", err);
    }
  }
});
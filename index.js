const { Client, GatewayIntentBits } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const loadNgPatterns = require("./ngwords")
const listenSupabaseChange = require("./roomcode");
require("dotenv").config();

// ▼ Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const juusanninTermsURL = "https://sakitibi-com9.webnode.jp/page/10";

// ▼ Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← Realtime を受信する場合はサービスキー推奨
);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  listenSupabaseChange(supabase);
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
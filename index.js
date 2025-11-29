const { Client, GatewayIntentBits } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ▼ Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const CHANNEL_ID = "1358349516067180674";
const TARGET_ID = "640a4587-5be7-4727-aee6-e9493050f022";

// ▼ Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← Realtime を受信する場合はサービスキー推奨
);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  listenSupabaseChange();
});

client.login(process.env.DISCORD_BOT_TOKEN);

// JSON 読み込み関数
function loadNgPatterns() {
  try {
    const data = fs.readFileSync(path.join(process.cwd(), "ngwords.json"), "utf8");
    const json = JSON.parse(data);

    const patterns = json.patterns || [];

    // 正規表現に変換
    const regexList = patterns.map((pattern) => {
      try {
        return new RegExp(pattern, "i"); // i = 大文字小文字無視
      } catch (e) {
        console.error(`正規表現エラー: ${pattern}`, e);
        return null;
      }
    }).filter(Boolean);

    console.log("NG 正規表現パターン読み込み:", regexList);

    return regexList;

  } catch (err) {
    console.error("ngwords.json 読み込みエラー:", err);
    return [];
  }
}

let NG_WORDS = loadNgPatterns();

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
        `⚠️ ${message.author} パターン: \`${hit}\` は13nin利用規約に違反しています`
      );
    } catch (err) {
      console.error("NGワード処理エラー:", err);
    }
  }
});

// ▼ ③ Supabase テーブル変更監視
async function listenSupabaseChange() {
const channel = supabase
  .channel("wiki_variables_search")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "wiki_variables",
    },
    async (payload) => {
      const newRow = payload.new;

      // ▼ UUID が一致する row だけ通知
      if (
        newRow.id !== TARGET_ID ||
        payload.old.value === payload.new.value ||
        !payload.new.value
    ) return;

      // ▼ ここから通知処理
      const msg = `最新のAmongus招待コード: ${payload.new.value}`;
      const ch = await client.channels.fetch(CHANNEL_ID);
      ch.send(msg);
    }
  )
  .subscribe();

  console.log("Supabase のリアルタイム監視開始");
}

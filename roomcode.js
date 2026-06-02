const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({
    path: "/Applications/discord_bot/.env"
});

const CHANNEL_ID = "1358349516067180674";
const TARGET_ID = "640a4587-5be7-4727-aee6-e9493050f022";

let supabase;
let realtimeChannel;

async function listenSupabaseChange(client, juusanninTermsURL) {
    // 🔒 グローバル保持
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        }
    );

    realtimeChannel = await supabase
        .channel("realtime:wiki_variables")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "wiki_variables",
            },
            async (payload) => {
                console.log("🔥 payload received", payload);

                const newRow = payload.new;
                const oldValue = payload.old?.value;
                const newValue = payload.new?.value;

                if (newRow.id !== TARGET_ID) return;
                if (oldValue === newValue) return;

                const msg = newValue
                ? `<@&1360380890441715712>
# 最新のAmongus招待コード: **${newValue}**
## Amongus部屋に参加の際は**誰がホストでも**[13nin利用規約](${juusanninTermsURL})が適応されます
## すでに満員や開始中の場合がございます。`.replace(/\n\t    /g, "")
                : "最新のAmongus招待コードは存在しません";

                const ch = await client.channels.fetch(CHANNEL_ID);

                const msgs = await ch.messages.fetch({ limit: 50 });
                for (const m of msgs.values()) {
                    if (
                        m.author.id === client.user.id &&
                        m.content.includes("最新のAmongus招待コード")
                    ) {
                        await m.delete().catch(() => {});
                    }
                }

                await ch.send(msg);
            }
        )
        .subscribe(async(status) => {
            console.log("📡 Realtime status:", status);
            if (status !== "SUBSCRIBED") {
                await listenSupabaseChange(client, juusanninTermsURL);
            }
        });

    console.log("✅ Supabase Realtime subscribe requested");
}

module.exports = listenSupabaseChange;

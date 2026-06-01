const { createClient } = require("@supabase/supabase-js");
const { exec } = require('child_process')

require("dotenv").config({
    path: "/Applications/discord_bot/.env"
});

let supabase;
let realtimeChannel;

function listenSupabaseChangeWikis() {
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

    realtimeChannel = supabase
        .channel("realtime:wikis")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "wikis",
            },
            async (payload) => {
                const WikiSlug = payload.new?.slug;
                const PageSlug = payload.new?.updated_page || payload.old?.updated_page;
                const NewTimeStamp = payload.new?.updated_at;
                const OldTimeStamp = payload.old?.updated_at;
                if (OldTimeStamp === NewTimeStamp) return;
                exec(`osascript -e 'display notification "${Slug} が更新されました。"'`, () => {
                    console.log(`${Slug} が更新されました。`);
                });
            }
        )
        .subscribe((status) => {
            console.log("📡 Realtime status:", status);
        });

    console.log("✅ Supabase Realtime subscribe requested");
}

module.exports = listenSupabaseChangeWikis;

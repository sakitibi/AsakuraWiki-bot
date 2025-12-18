const CHANNEL_ID = "1358349516067180674";
const TARGET_ID = "640a4587-5be7-4727-aee6-e9493050f022";
// ▼ ③ Supabase テーブル変更監視
async function listenSupabaseChange(supabase) {
    supabase
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
                    payload.old.value === payload.new.value
                ) return;

                // ▼ ここから通知処理
                let msg = null;
                if (payload.new.value) {
                    msg = `<@&1360380890441715712>\n# 最新のAmongus招待コード: **${payload.new.value}**\n## Amongus部屋に参加の際は**誰がホストでも**[13nin利用規約](${juusanninTermsURL})が適応されます、\n## すでに満員や開始中の場合がございます。`;
                } else {
                    msg = "最新のAmongus招待コードは存在しません";
                }

                const ch = await client.channels.fetch(CHANNEL_ID);

                // ▼ 古い通知メッセージを削除
                const msgs = await ch.messages.fetch({ limit: 50 });
                for (const m of msgs.values()) {
                    if (
                        m.author.id === client.user.id &&     // Bot のメッセージ
                        m.content.includes("最新のAmongus招待コード")
                    ) {
                        await m.delete().catch(() => {});
                    }
                }

                // ▼ 新しい通知を送信
                await ch.send(msg);
            }
        )
        .subscribe();

    console.log("Supabase のリアルタイム監視開始");
}

module.exports = listenSupabaseChange;
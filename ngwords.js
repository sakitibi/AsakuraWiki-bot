const fs = require("fs");
const path = require("path");

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

module.exports = loadNgPatterns;
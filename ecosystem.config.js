module.exports = {
    apps: [
        {
            name: "discord_bot",
            script: "index.js",
            cwd: "/Applications/NextTs/AsakuraWiki/discord_bot",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};

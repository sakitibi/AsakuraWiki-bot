module.exports = {
    apps: [
        {
            name: "discord_bot",
            script: "start.js",
            cwd: "/Applications/discord_bot",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};

const { exec } = require('child_process');

exec("caffeinate -i node /Applications/discord_bot/index.js", (stdout) => {
    try {
        console.log(stdout);
    } catch(e) {
        console.error(e);
    }
});
import registerCommands from "../util/registerCommands.js";
export default async function readyHandler(options) {
    const { client, commonCommands, modCommands, app } = options;
    const oAuthGuilds = await client.guilds.fetch();
    oAuthGuilds.each(async (oAuthGuild) => {
        const guildId = oAuthGuild.id;
        const guildCache = await app.guildCaches.getGuild(guildId);
        let commandsToRegister = [...commonCommands];
        if (guildCache.data.isModServer) {
            commandsToRegister = commandsToRegister.concat(...modCommands);
        }
        await registerCommands({
            client,
            guildId,
            commands: commandsToRegister,
        });
        if (guildCache.data.countingChannelId !== "-1") {
            try {
                const channel = await client.channels.fetch(guildCache.data.countingChannelId);
                if (channel !== null && channel.type === "GUILD_TEXT") {
                    guildCache.connectChannel(channel);
                }
            }
            catch (e) { }
        }
    });
}

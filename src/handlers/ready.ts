import registerCommands, { RegisterCommandsOptions } from "../util/command/registerCommands.js";
import type Discord from "discord.js";
import type App from "../class/App";

interface ReadyHandlerOptions {
  client: Discord.Client<boolean>,
  commonCommands: RegisterCommandsOptions["commands"],
  modCommands: RegisterCommandsOptions["commands"],
  app: App
}

export default async function readyHandler(options: ReadyHandlerOptions) {
  const { client, commonCommands, modCommands, app } = options;
  
  const oAuthGuilds = await client.guilds.fetch();
  oAuthGuilds.each(async (oAuthGuild) => {
    const guildId = oAuthGuild.id;
    const guildCache = await app.guildCaches.getGuild(guildId);

    let commandsToRegister = [...commonCommands];
    if (guildCache.data.isModServer) {
      console.log(guildCache.data);
      commandsToRegister = commandsToRegister.concat(...modCommands);
    }

    if (guildCache.data.countingChannelId !== "-1") {
      try {
        const channel = await client.channels.fetch(guildCache.data.countingChannelId);
        
        if (channel !== null && (channel.type === "GUILD_TEXT" || channel.type === "GUILD_PUBLIC_THREAD")) {
          guildCache.connectChannel(channel);
        }
      } catch (e) { }
    }

    await registerCommands({
      token: process.env.TOKEN as string,
      clientId: process.env.CLIENT_ID as string,
      guildId,
      commands: commandsToRegister,
    });
  });
}

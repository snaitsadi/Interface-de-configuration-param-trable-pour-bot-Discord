import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import { ConfigHandler } from './handlers/configHandler';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const configHandler = new ConfigHandler();

client.once(Events.ClientReady, async (c) => {
  console.log(` Bot is online! Logged in as ${c.user.tag}`);
  console.log(` Serving ${client.guilds.cache.size} guilds`);
  await configHandler.loadAllConfigs();
  
  // Register slash commands
  const commands = [
    {
      name: 'config',
      description: 'Show current bot configuration'
    },
    {
      name: 'reload',
      description: 'Reload bot configuration'
    }
  ];
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);
  
  try {
    console.log(' Registering slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands });
    console.log(' Slash commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on(Events.GuildCreate, async (guild) => {
  console.log(` Bot added to guild: ${guild.name} (${guild.id})`);
  await configHandler.loadGuildConfig(guild.id);
});

client.on(Events.GuildMemberAdd, async (member) => {
  const config = configHandler.getGuildConfig(member.guild.id);
  
  if (config?.welcome_channel && config?.welcome_message) {
    const channel = member.guild.channels.cache.get(config.welcome_channel);
    if (channel && channel.isTextBased()) {
      const welcomeMsg = config.welcome_message.replace('{user}', member.user.toString());
      await channel.send(welcomeMsg);
      console.log(` Welcome message sent to ${member.user.tag} in ${member.guild.name}`);
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'config') {
    const config = configHandler.getGuildConfig(interaction.guildId!);
    
    if (!config) {
      await interaction.reply({
        content: ' No configuration found for this server.',
        ephemeral: true
      });
      return;
    }
    
    const configInfo = Object.entries(config)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join('\n');
    
    await interaction.reply({
      content: ` **Current Configuration:**\n\`\`\`\n${configInfo}\n\`\`\``,
      ephemeral: true
    });
  }
  
  if (interaction.commandName === 'reload') {
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: ' You need administrator permissions to reload the configuration.',
        ephemeral: true
      });
      return;
    }
    
    await configHandler.loadGuildConfig(interaction.guildId!);
    await interaction.reply({
      content: ' Configuration reloaded successfully!',
      ephemeral: true
    });
  }
});

client.on(Events.Error, (error) => {
  console.error(' Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_BOT_TOKEN);
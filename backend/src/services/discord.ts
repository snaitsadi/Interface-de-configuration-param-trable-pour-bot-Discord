import axios from 'axios';

const DISCORD_API = 'https://discord.com/api/v10';

export const generateAuthURL = (): string => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.REDIRECT_URI!,
    response_type: 'code',
    scope: 'identify guilds',
    prompt: 'consent'
  });
  
  return `https://discord.com/api/oauth2/authorize?${params}`;
};

export const exchangeCode = async (code: string): Promise<any> => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.REDIRECT_URI!
  });
  
  const response = await axios.post(`${DISCORD_API}/oauth2/token`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  return response.data;
};

export const getDiscordUser = async (accessToken: string): Promise<any> => {
  const response = await axios.get(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  return response.data;
};

export const getUserGuilds = async (accessToken: string): Promise<any[]> => {
  const response = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  return response.data;
};

export const isBotInGuild = async (guildId: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${DISCORD_API}/guilds/${guildId}`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    });
    return response.status === 200;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false;
    }
    console.error('Error checking bot in guild:', error);
    return false;
  }
};

export const installBotToGuild = async (guildId: string): Promise<string> => {
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot&guild_id=${guildId}`;
  return inviteUrl;
};
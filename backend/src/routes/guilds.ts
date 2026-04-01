import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const DISCORD_API = 'https://discord.com/api/v10';

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const session = req.session as any;
  
  try {
    const response = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    
    const guilds = response.data;
    
    const guildsWithBot = await Promise.all(
      guilds.map(async (guild: any) => {
        let botInstalled = false;
        try {
          await axios.get(`${DISCORD_API}/guilds/${guild.id}`, {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
          });
          botInstalled = true;
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error(`Error checking bot in guild ${guild.id}:`, error.message);
          }
        }
        
        return { ...guild, botInstalled };
      })
    );
    
    res.json(guildsWithBot);
  } catch (error) {
    console.error('Error fetching guilds:', error);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
});

router.post('/:guildId/install', authMiddleware, async (req: Request, res: Response) => {
  const { guildId } = req.params;
  
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot&guild_id=${guildId}`;
  
  res.json({ success: true, inviteUrl });
});

export default router;
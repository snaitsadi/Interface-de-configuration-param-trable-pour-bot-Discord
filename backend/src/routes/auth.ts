import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const DISCORD_API = 'https://discord.com/api/v10';

router.get('/login', (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.REDIRECT_URI!,
    response_type: 'code',
    scope: 'identify guilds',
    prompt: 'consent'
  });
  
  const authURL = `https://discord.com/api/oauth2/authorize?${params}`;
  res.json({ url: authURL });
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('/login');
  }
  
  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: process.env.REDIRECT_URI!
    });
    
    const tokenResponse = await axios.post(`${DISCORD_API}/oauth2/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token } = tokenResponse.data;
    
    const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    (req.session as any).discordUser = userResponse.data;
    (req.session as any).accessToken = access_token;
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard.html`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect('/');
  }
});

router.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:8080');
  });
});

router.get('/user', (req: Request, res: Response) => {
  const session = req.session as any;
  if (session && session.discordUser) {
    res.json(session.discordUser);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
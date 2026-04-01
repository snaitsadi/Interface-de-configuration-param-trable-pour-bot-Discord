import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { authMiddleware } from '../middleware/auth';
import { generateConfigFile } from '../services/configGenerator';
import botConfig from '../config/botConfig.json';
import { translationAI } from '../config/translation';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/schema', authMiddleware, (req: Request, res: Response) => {
  res.json(botConfig);
});

router.get('/translate', authMiddleware, async (req: Request, res: Response) => {
  const { text, targetLang, sourceLang = 'en' } = req.query;
  
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const translated = await translationAI.translate(
      text as string,
      targetLang as string,
      sourceLang as string
    );
    res.json({ translated });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

router.post('/:guildId/generate', authMiddleware, upload.any(), async (req: Request, res: Response) => {
  const { guildId } = req.params;
  const config = req.body;
  const files = req.files as Express.Multer.File[];
  
  try {
    const configPath = await generateConfigFile(guildId, config, files);
    res.download(configPath, `${guildId}_config.json`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      fs.unlinkSync(configPath);
    });
  } catch (error) {
    console.error('Error generating config:', error);
    res.status(500).json({ error: 'Failed to generate configuration' });
  }
});

export default router;
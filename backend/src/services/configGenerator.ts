import fs from 'fs-extra';
import path from 'path';

export const generateConfigFile = async (
  guildId: string,
  config: any,
  files: Express.Multer.File[]
): Promise<string> => {
  const configDir = path.join(process.cwd(), 'configs');
  await fs.ensureDir(configDir);
  
  const processedConfig: any = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (key !== 'images' && value && typeof value === 'string' && value.trim()) {
      processedConfig[key] = value;
    }
  }
  
  for (const file of files) {
    const imageExt = path.extname(file.originalname);
    const imageName = `${guildId}_${file.fieldname}${imageExt}`;
    const imagePath = path.join(configDir, imageName);
    
    await fs.move(file.path, imagePath, { overwrite: true });
    processedConfig[file.fieldname] = imageName;
  }
  
  const configPath = path.join(configDir, `${guildId}_config.json`);
  await fs.writeJson(configPath, processedConfig, { spaces: 2 });
  
  return configPath;
};
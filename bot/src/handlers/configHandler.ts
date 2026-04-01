import fs from 'fs-extra';
import path from 'path';

export interface BotConfig {
  welcome_channel?: string;
  welcome_message?: string;
  mod_role?: string;
  max_warnings?: number;
  admin_user?: string;
  server_title?: string;
  server_icon?: string;
}

export class ConfigHandler {
  private configs: Map<string, BotConfig> = new Map();
  private configDir: string;

  constructor() {
    this.configDir = path.join(process.cwd(), '..', 'configs');
    console.log(` Config directory: ${this.configDir}`);
  }

  async loadAllConfigs(): Promise<void> {
    try {
      if (!await fs.pathExists(this.configDir)) {
        console.log(' Config directory not found, creating...');
        await fs.ensureDir(this.configDir);
        return;
      }
      
      const files = await fs.readdir(this.configDir);
      const configFiles = files.filter(file => file.endsWith('_config.json'));

      for (const file of configFiles) {
        const guildId = file.replace('_config.json', '');
        await this.loadGuildConfig(guildId);
      }

      console.log(` Loaded ${this.configs.size} configurations`);
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  }

  async loadGuildConfig(guildId: string): Promise<void> {
    try {
      const configPath = path.join(this.configDir, `${guildId}_config.json`);
      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        this.configs.set(guildId, config);
        console.log(` Loaded config for guild ${guildId}`);
      } else {
        console.log(` No config found for guild ${guildId}`);
      }
    } catch (error) {
      console.error(`Error loading config for guild ${guildId}:`, error);
    }
  }

  getGuildConfig(guildId: string): BotConfig | undefined {
    return this.configs.get(guildId);
  }

  async updateGuildConfig(guildId: string, config: BotConfig): Promise<void> {
    const configPath = path.join(this.configDir, `${guildId}_config.json`);
    await fs.writeJson(configPath, config, { spaces: 2 });
    this.configs.set(guildId, config);
    console.log(` Updated config for guild ${guildId}`);
  }
}
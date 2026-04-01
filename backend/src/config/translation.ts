interface TranslationCache {
  [key: string]: string;
}

class LocalTranslationAI {
  private cache: Map<string, TranslationCache> = new Map();
  
  constructor() {
    console.log(' Local Translation AI initialized');
  }
  
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    const cacheKey = `${sourceLang}-${targetLang}`;
    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, {});
    }
    
    const cache = this.cache.get(cacheKey)!;
    if (cache[text]) {
      return cache[text];
    }
    
    let translated = text;
    
    if (sourceLang === 'en' && targetLang === 'fr') {
      translated = this.translateEnToFr(text);
    } else if (sourceLang === 'fr' && targetLang === 'en') {
      translated = this.translateFrToEn(text);
    }
    
    cache[text] = translated;
    return translated;
  }
  
  private translateEnToFr(text: string): string {
    const translations: { [key: string]: string } = {
      'Welcome Channel': 'Canal d\'accueil',
      'Select the channel where welcome messages will be sent': 'Sélectionnez le canal où les messages de bienvenue seront envoyés',
      'Welcome Message': 'Message de bienvenue',
      'Message to send when a new member joins': 'Message à envoyer quand un nouveau membre rejoint',
      'Welcome to the server! ': 'Bienvenue sur le serveur ! ',
      'Moderator Role': 'Rôle modérateur',
      'Role for server moderators': 'Rôle pour les modérateurs du serveur',
      'Max Warnings': 'Avertissements maximum',
      'Maximum warnings before action': 'Avertissements maximum avant action',
      'Administrator User': 'Utilisateur administrateur',
      'User with admin privileges': 'Utilisateur avec privilèges administrateur',
      'Server Title': 'Titre du serveur',
      'Custom title for the server': 'Titre personnalisé pour le serveur',
      'Server Icon': 'Icône du serveur',
      'Custom icon for the server': 'Icône personnalisée pour le serveur',
      'My Discord Server': 'Mon serveur Discord'
    };
    
    return translations[text] || text;
  }
  
  private translateFrToEn(text: string): string {
    const translations: { [key: string]: string } = {
      'Canal d\'accueil': 'Welcome Channel',
      'Sélectionnez le canal où les messages de bienvenue seront envoyés': 'Select the channel where welcome messages will be sent',
      'Message de bienvenue': 'Welcome Message',
      'Message à envoyer quand un nouveau membre rejoint': 'Message to send when a new member joins',
      'Bienvenue sur le serveur ! ': 'Welcome to the server! ',
      'Rôle modérateur': 'Moderator Role',
      'Rôle pour les modérateurs du serveur': 'Role for server moderators',
      'Avertissements maximum': 'Max Warnings',
      'Avertissements maximum avant action': 'Maximum warnings before action',
      'Utilisateur administrateur': 'Administrator User',
      'Utilisateur avec privilèges administrateur': 'User with admin privileges',
      'Titre du serveur': 'Server Title',
      'Titre personnalisé pour le serveur': 'Custom title for the server',
      'Icône du serveur': 'Server Icon',
      'Icône personnalisée pour le serveur': 'Custom icon for the server',
      'Mon serveur Discord': 'My Discord Server'
    };
    
    return translations[text] || text;
  }
  
  detectLanguage(text: string): string {
    const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'pour', 'dans'];
    const words = text.toLowerCase().split(/\s+/);
    let frenchCount = 0;
    
    for (const word of words) {
      if (frenchWords.includes(word)) {
        frenchCount++;
      }
    }
    
    return frenchCount > words.length * 0.1 ? 'fr' : 'en';
  }
}

export const translationAI = new LocalTranslationAI();
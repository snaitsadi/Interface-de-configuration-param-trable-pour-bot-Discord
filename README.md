# Interface-de-configuration-param-trable-pour-bot-Discord
Interface de configuration paramétrable pour bot Discord
proposé par David Auber

Objectif du projet
L’objectif de ce projet est de concevoir et développer une interface/server/application web complète permettant le paramétrage d’un bot Discord. Cette interface devra permettre :

    La connexion d’un utilisateur à Discord ;
    La visualisation de l’ensemble des serveurs Discord auxquels l’utilisateur est connecté ;
    L’installation du bot sur un ou plusieurs de ces serveurs ;
    Le paramétrage du bot pour chacun des serveurs sur lesquels il est installé.
    De s’adapter automatiquement à la langue l’utilisateur en s'appuyant sur une "IA" de traduction s’exécutant localement. 

Description du projet
Dans le cadre de ce projet, un bot Discord fictif devra être développé. L’interface de l’application devra être automatiquement générées à partir :

    d’un fichier JSON  décrivant les paramètres de configuration,
    du token d’accès du bot, 

L’application web devra être capable de permettre à un utilisateur administrateur sur son serveur de générer l’ensemble des fichiers de configuration nécessaires au bon fonctionnement de son bot.
Types de paramètres pris en charge
Les différents types de paramètres manipulables pourront inclure, sans que cette liste soit exhaustive :

    Des forums ;
    Des nombres ;
    Des titres ;
    Des utilisateurs ;
    Des rôles ;
    Des textes au format Discord ;
    Des images. 

Contraintes techniques

    L’ensemble du développement devra être réalisé en TypeScript ;
    Utilisation de la dernière version de Discord.js ;
    Utilisation exclusive de Bootstrap pour l’interface utilisateur ;
    L’objectif est de limiter au maximum les dépendances externes, afin de réduire l’utilisation de bibliothèques logicielles tierces. 

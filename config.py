class Config:
    # configuration principale de l'application

    # Application
    APP_NAME = "Check_System"
    VERSION = 1.0
    DEBUG = True

    # Serveur Flask
    HOST = "127.0.0.1"
    PORT = 5000

    # Monitoring
    STAT_REFRESH_INTERVAL = 3 # 3 secondes entre les mises a jour des stats
    CPU_INTERVAL = 1 # secone pour mesure CPU
    MAX_HOSTORY_SIZE = 50 # nombre max de commande en historique

    # Limite d'affichage
    MAX_PROCESS_DISPLAY = 10
    MAX_SERVICES_DISPLAY = 20
    MAX_LOGS_DISPLAY = 10

    # Seuil d'alert (en porcentage)
    CPU_WARNING_THRESHOLD = 70
    CPU_CRITICAL_THRESHOLD = 90

    RAM_WARNING_THRESHOLD = 75
    RAM_CRITICAL_THRESHOLD = 90

    DISK_WARNING_THRESHOLD = 80
    DISK_CRITICAL_THRESHOLD = 90

    TEMP_WARNING_THRESHOLD = 75 # EN °C
    TEMP_CRITICAL_THRESHOLD = 85 # EN °C

    # Score de santé
    HEALTH_PENALTY_CPU_HIGHT = 10
    HEALTH_PENALTY_CPU_CRITICAL = 20

    HEALTH_PENALTY_RAM_HIGHT = 15
    HEALTH_PENALTY_RAM_CRITICAL = 25

    HEALTH_PENALTY_DISK_HIGHT = 10
    HEALTH_PENALTY_DISK_CRITICAL = 20

    HEALTH_PENALTY_TEMP_HIGHT = 15

    # Ping
    PING_COUNT = 2 # Nombre de pings

    # Securité
    REQUIRE_AUTH = False
    SECRET_KEY = "changer-en-production"

    # export
    EXPORT_DIRECTORY = "exports" # dossier pour export
    EXPORT_FORMAT = "txt"

    # interface
    COMMANDS_COLLAPSED_BY_DEFAUT = False # Replier la liste des commandes 
    SHOW_QUICK_STATS = True # Afficher les stats rapides e header
    ENABLE_NOTIFICATIONS = True # Notification javascript

    # Developpement
    ENABLE_PROFILING = False # Profiling des performances
    LOG_COMMANDS = True # Logger les commandes exécutées

# Categories de commandes pour filtrage
COMMANDS_CATEGORIES = {
    "monitoring" : ["cpu", "ram", "espace", "dashboard", "health"],
    "network": ["ping", "network", "ports"],
    "process": ["processus", "services", "kill"],
    "security": ["user", "security", "logs"],
    "diagnostic": ["sysinfo", "uptime", "temp", "battery"]
}

# messages personnalisés 
MESSAGES = {
    "welcome": "👋​ Bienvenue sur Check System",
    "error_permission": "​❌​ Permission refusé. Droit admin requis",
    "error_not_found": "​❌​ Ressource non trouvé",
    "error_invalid_command": "​❌​ Commande invalide. Tapez 'help' pour l'aide",
    "succes_kill": "✔️ processus arrêté avec succès",
    "info_no_battery": "​​🔌​ Pas de batterie détecté (PC de bureau)"
}
from pathlib import Path # Pour gérer les chemain de fichier dans l'appli

from flask import Flask # framwork web principal

from config import Config # Configuration centralisée de l'application (config.py)

from .routes.api import api_blueprint # Route API (endpoint Json)
from.routes.web import web_blueprint # Routes xeb (pages HTML)

# Configuration des chemains
BASE_DIR = Path(__file__).resolve().parent.parent # Etre à la base dir du projet (parent du dossier app)

# Dossier pour les templates html et fichiers statiques
TEMPLATE_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"

# FACTORY PATTERN
def create_app() -> Flask:
    #Créer l'instance de flask avec les emplacements des templates et des fichiers statiques
    app = Flask(
        __name__,
        template_folder=str(TEMPLATE_DIR),
        static_folder=str(STATIC_DIR)
    )

    # charge le configuration depuis config.py
    app.config.from_object(Config)

    # On enregistre les routes web (page html)
    app.register_blueprint(web_blueprint)

    # On enregistre les routes d'api (endoint json)
    app.register_blueprint(api_blueprint)

    # retourn l'aplication configuré etprete a etre utilisé
    return app
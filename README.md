# Flashcards - Jeux de classe

Application HTML/CSS/JS vanilla + PHP pour faire jouer une classe (CM2) à
partir d'ensembles de flashcards téléversés par l'enseignant : répétition
aléatoire, memory, carte manquante, trouve l'image (oral/écrit), loto,
chrono, pendu, vrai/faux, l'intrus des paires.

## Installation

1. Copiez ce dépôt sur un hébergement supportant PHP 8+ (aucune base de
   données n'est nécessaire, tout est stocké en fichiers dans `/data/`).
2. Créez `includes/config.php` à partir de `includes/config.php.example` :
   ```
   php -r "echo password_hash('votre-mot-de-passe', PASSWORD_DEFAULT);"
   ```
   Collez le hash obtenu dans `ADMIN_PASSWORD_HASH`.
3. Vérifiez que le dossier `/data/` est accessible en écriture par PHP.
4. Ouvrez `/admin/login.php`, connectez-vous, créez un ensemble et
   téléversez vos flashcards (JPG, mises automatiquement au format carré).
5. Une fois un certificat SSL actif sur le domaine, décommentez le bloc de
   redirection HTTPS en tête du fichier `.htaccess` à la racine.

## Structure

- `index.html` — accueil : choix de l'ensemble puis du jeu.
- `admin/` — espace enseignant protégé par mot de passe (gestion des
  ensembles et des cartes).
- `api/` — endpoints PHP appelés par l'espace enseignant.
- `jeux/` — une page par jeu.
- `assets/` — CSS et JS partagés.
- `data/` — ensembles créés par l'enseignant (non versionné, voir
  `.gitignore`).

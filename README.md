# Cloudflare + GitHub Pages

## Depots et environnements
- `https://gitlab.com/Guiraud/bingo-mascu.placedelinfo.org` sert d'environnement de preproduction (branche `dev`).
- Le depot GitHub public heberge la branche de production (`main` ou `gh-pages`) derriere Cloudflare.
- Ajoutez GitLab comme second remote : `git remote add gitlab git@gitlab.com:Guiraud/bingo-mascu.placedelinfo.org.git`.
- Travaillez sur `dev`, poussez vers GitLab (`git push gitlab dev`) pour publier le site de test, puis fusionnez/fast-forward vers la branche de production et poussez sur GitHub (`git push origin main`).

## Build command & Build output directory
Aucune commande ou dossier de build n'est necessaire pour l'instant. Laissez les champs vides dans les parametres GitHub Pages ou Cloudflare Pages : les fichiers statiques a la racine sont servis tels quels.

## GitLab Pages (preproduction)
### Pipeline CI (`.gitlab-ci.yml`)
```yaml
image: python:3.11

stages:
  - test
  - deploy

variables:
  PYTHONPYCACHEPREFIX: .cache

test:python:
  stage: test
  script:
    - python -m py_compile server.py
  only:
    - dev

pages:
  stage: deploy
  script:
    - rm -rf public
    - mkdir -p public
    - find . -maxdepth 1 ! -name '.' ! -name 'public' ! -name '.git' ! -name '.gitlab-ci.yml' -exec cp -r {} public/ \;
  artifacts:
    paths:
      - public
  only:
    - dev
```
- Le job `test:python` verifie la syntaxe de `server.py` avant publication.
- Le job `pages` copie tout le contenu necessaire dans `public/`; GitLab Pages publie ensuite `https://guiraud.gitlab.io/bingo-mascu.placedelinfo.org/`.
- Apres chaque commit sur `dev`, poussez vers GitLab pour re-deployer la preproduction.

## GitHub Pages (production)
- Assurez-vous que la branche configuree (souvent `main` ou `gh-pages`) reste a jour via fusion depuis `dev`.
- GitHub generera automatiquement le fichier `CNAME` quand vous definissez le domaine personnalise.
- Ne configurez pas de commande de build tant que le site reste statique.

## Cloudflare
### Configuration DNS
- **Sous-domaine (recommande)** :
  - Supprimez d'eventuels enregistrements `A` existants.
  - Ajoutez un `CNAME` pour `www` (ou un sous-domaine dedie) vers `votre-utilisateur.github.io`.
  - Activez le nuage orange pour beneficier du proxy/SSL Cloudflare.
- **Domaine apex** (`example.com`) :
  - Cloudflare genere un pseudo `A` (flattened) lorsque vous creez un `CNAME` vers `votre-utilisateur.github.io` ; sinon utilisez `CNAME Flattening` en ajoutant un `CNAME` pour `@`.
  - Ajoutez une redirection 301 de `example.com` vers `www.example.com` via `Rules > Redirect Rules` si vous souhaitez imposer le sous-domaine.

### Declarer le domaine dans GitHub Pages
1. Ouvrez `Settings > Pages` sur GitHub.
2. Renseignez le domaine personnalise (ex: `www.example.com`).
3. Verifiez que le fichier `CNAME` est cree apres le build.

### SSL/TLS
1. Dans Cloudflare, choisissez le mode `Full` (ou `Full (strict)` si vous possedez un certificat valide cote origine).
2. Activez `Always Use HTTPS` et `Automatic HTTPS Rewrites` dans `SSL/TLS > Edge Certificates`.
3. Confirmez que le certificat Cloudflare est `Active`.

### Optimisations facultatives
- `Speed > Optimization` : activez `Brotli` et `Early Hints`.
- `Caching` : fixez une `Browser Cache TTL` (ex: 1 heure) et n'utilisez `Cache Everything` que si vous maitrisez les impacts.
- `Security` : creez des regles de firewall pour limiter le trafic malveillant.

## Depannage
- Propagation DNS : peut prendre jusqu'a 24h. Controlez avec `dig` ou `nslookup`.
- Boucles de redirection : si HTTPS est force deux fois, desactivez `Enforce HTTPS` dans GitHub et laissez Cloudflare gerer.
- Erreurs 525/526 : repassez en mode `Full` non strict et verifiez que GitHub repond correctement en HTTPS.
- Contenu obsolete : purgez le cache Cloudflare (`Caching > Configuration > Purge Cache`) apres chaque publication majeure.

## Aller plus loin
- Utiliser Workers/Pages Rules pour des redirections avancees.
- Ajouter Cloudflare Analytics pour suivre le trafic sans scripts externes.
- Integrer un workflow GitHub Actions pour purger automatiquement le cache via l'API Cloudflare apres chaque deploy.

# ImmoSecureNet — Mise en production officielle

## Architecture cible

Domaine officiel → Firebase Hosting → application React/Vite → Firebase Authentication / Firestore / Storage.

Les opérations sensibles (paiements, validation administrative avancée, vérification d’identité, intégrations externes) pourront passer par un backend/API sécurisé séparé. Le client web ne doit jamais embarquer de secret serveur.

## État du dépôt

- Authentification Firebase réelle.
- Connexion Google : création automatique d’un profil utilisateur standard dans `users/{uid}`.
- Demande de compte professionnel depuis le profil.
- Annonces, favoris, panier, conversations et messages reliés à Firestore.
- Règles Firestore et Storage versionnées dans le dépôt.
- Firebase Hosting configuré dans `firebase.json`.
- Projet Firebase actuel : `automarket-suite`.

## Déploiement

1. Installer les dépendances : `npm install`
2. Vérifier TypeScript : `npm run lint`
3. Construire le site : `npm run build:web`
4. Se connecter à Firebase : `npm run firebase:login`
5. Déployer règles + site : `npm run deploy:firebase`

## Domaine personnalisé

Dans Firebase Console : Hosting → Ajouter un domaine personnalisé.

Ajouter le domaine officiel puis recopier les enregistrements DNS demandés chez le registrar du domaine. Attendre la validation DNS et l’émission automatique du certificat HTTPS.

Après activation du domaine, ajouter aussi le domaine dans Firebase Authentication → Settings → Authorized domains, sinon Google Sign-In peut être refusé sur le domaine officiel.

## Sécurité

- Ne jamais mettre de clé privée Firebase Admin, mot de passe ou secret API dans le frontend.
- Les clés du SDK Firebase Web sont des identifiants publics ; la sécurité repose sur Auth + Firestore Rules + Storage Rules.
- Toute opération administrative sensible doit être autorisée côté serveur ou par des règles Firebase strictes.
- Les comptes professionnels ne doivent jamais s’auto-attribuer un rôle : ils créent une `accessRequest`, puis l’administration valide.

## Avant ouverture au public

- Exécuter `npm run lint` et `npm run build:web` sans erreur.
- Déployer les règles Firestore/Storage.
- Tester : visiteur public, compte Google standard, inscription email, demande Agent/Agence, demande Bailleur/Propriétaire, publication, modération admin, favoris, panier, messages, lecture/non-lu.
- Ajouter le domaine officiel aux domaines autorisés Firebase Auth.
- Tester sur Android Chrome et sur l’APK/WebView avant publication mobile.

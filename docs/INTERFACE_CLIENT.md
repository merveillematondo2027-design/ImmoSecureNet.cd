# ImmoSecureNet — Interface client de référence

Ce document devient la référence fonctionnelle de l'accueil client et de la navigation pour la version Web responsive développée d'abord dans Google AI Studio, puis synchronisée avec GitHub et retravaillée avec Codex.

## 1. Accueil

### Trouver le bien idéal

Titre : **Trouver le bien idéal**

Sous-titre : **Vente, achat ou location de biens immobiliers**

Catégories principales :
- Terrains / Parcelles
- Maisons / Immeubles
- Bureaux
- Commerces
- Entrepôts
- Etc.

### Acheter ou louer un bien en toute sécurité

Le moteur de recherche doit proposer :

- **Type de bien** : Terrains / Parcelles ; Maisons / Immeubles ; Bureaux ; Commerces ; Entrepôts ; Etc.
- **Localisation hiérarchique** : Province > Ville > Commune > Quartier.
- **Plus de détails** :
  - Nombre de chambres : 2, 3, 4, 5, 6, 7, 8, plus.
  - Parking : 1, 2, plus.
  - Groupe électrogène.
  - Panneaux solaires.
  - Citerne.
  - Meublé.
  - Piscine.
  - Location court séjour.
- **Prix minimum**.
- **Prix maximum**.
- Bouton principal : **Chercher**.

## 2. Services ImmoSecureNet

Présenter les services sous forme de bande horizontale défilante :

- Publicité.
- Vérification et authentification des agents immobiliers ou agences immobilières.
- Vérification et traçabilité des biens et des transactions.
- Mise en relation pour la vente, l'achat ou la location.
- Gestion immobilière et gestion locative.
- Audits.
- Conseil juridique.
- Accompagnement administratif.
- Études immobilières.
- Architecture, ingénierie et construction.
- Financement immobilier pour preneurs, bailleurs, acquéreurs, etc.

## 3. Bandes de contenus récemment ajoutés

L'accueil doit afficher, dans cet ordre :

1. **Biens en vente** — bande horizontale des biens récemment ajoutés.
2. **Biens en location** — bande horizontale des biens récemment ajoutés.
3. **Marché de l'Habitat** — matériaux de construction et équipements pour la maison, récemment ajoutés.
4. **Expériences** — restaurants, hôtels, parcs, commerces, hébergements, loisirs, etc., récemment ajoutés.

Chaque carte doit être cliquable et exploiter les données Firebase disponibles lorsque possible.

## 4. Barre de navigation supérieure

Afficher uniquement :

- **Compte**.
- **Panier / Mes réservations**.

Le menu général n'est pas affiché en haut.

## 5. Barre de navigation inférieure

Ordre obligatoire :

1. **Accueil**.
2. **Journal immobilier et économique**.
3. **Publier** — bouton central plus visible ; nécessite une inscription/connexion.
4. **Messages**.
5. **Menu**.

## 6. Menu général

### Mes comptes

Accès à la gestion du compte utilisateur.

### Rechercher

- Bien à vendre.
- Bien à louer.
- Article du Marché de l'Habitat.
- Expériences.

### Nos services

- Publicité.
- Vérification et authentification des agents immobiliers ou agences immobilières.
- Vérification et traçabilité des biens et des transactions.
- Mise en relation vente, achat ou location.
- Gestion immobilière et gestion locative.
- Audits.
- Conseil juridique.
- Accompagnement administratif.
- Études immobilières.
- Architecture, ingénierie et construction.
- Financement immobilier.

### À propos de nous

- Notre philosophie.
- Notre vision.
- Nos valeurs.

### Contactez-nous

- Coordonnées.

Les favoris restent accessibles dans le menu et ne sont plus dans la barre de navigation inférieure.

## 7. Journal immobilier et économique

Le Journal est un kiosque numérique et éditorial.

La page principale affiche verticalement les couvertures des éditions, comme un fil d'actualité.

Lorsqu'une couverture est ouverte, l'édition fonctionne comme un livre :

- balayage de droite vers gauche : page suivante ;
- balayage de gauche vers droite : page précédente ;
- photos cliquables ;
- vidéos cliquables ;
- les vidéos ne démarrent qu'au clic ;
- lorsqu'on quitte la page vidéo, change de page, ferme l'édition ou quitte le Journal, toute vidéo en cours doit être automatiquement mise en pause.

Les pages peuvent contenir du texte, des photos, des vidéos, des publicités, des liens, des boutons et des contenus immobiliers ou économiques.

## 8. Direction de travail actuelle

Priorité actuelle :

**Google AI Studio → GitHub (`ImmoSecureNet.cd`) → Codex → stabilisation Web responsive → version mobile → publication Web → conversion/packaging Android plus tard.**

Pour l'instant, ne pas introduire de migration technique lourde qui ralentit la stabilisation de l'interface cliente.

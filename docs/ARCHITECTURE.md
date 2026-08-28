# ImmoSecureNet — Architecture

## Applications

- Mobile : utilisateurs
- Web : public et utilisateurs
- Business : entreprises et annonceurs
- Authority : autorités habilitées
- Admin : administration
- Support : service client
- Finance : finance
- Analytics : statistiques et direction

## Backend

API centrale ImmoSecureNet.

Technologie prévue :
- NestJS
- TypeScript
- PostgreSQL
- Redis
- Firebase
- Storage
- Google Maps

## Principe

Aucune application cliente ne se connecte directement à PostgreSQL.

Toutes les applications communiquent avec le backend via HTTPS/API.

## Sécurité

- Authentification
- RBAC
- Permissions
- Validation
- Rate limiting
- Audit logs
- Gestion des secrets

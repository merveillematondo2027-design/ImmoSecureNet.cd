# ImmoSecureNet — Modèle immobilier Firestore

## Collections d'annonces

Les annonces sont désormais séparées par transaction :

- `rentalProperties/{propertyId}` pour les biens à louer ;
- `saleProperties/{propertyId}` pour les biens à vendre.

L'ancienne collection `listings` reste lue temporairement uniquement pour assurer une migration sans coupure. Toute nouvelle publication est enregistrée dans l'une des deux collections finales.

## Types de biens

### Location

- `apartment`
- `furnishedApartment`
- `studio`
- `room`
- `house`
- `villa`
- `furnishedResidence`
- `hostel`
- `office`
- `commercialHouse`
- `factory`
- `industrialPremises`
- `storageSpace`
- `landParcel`

### Vente

- `apartment`
- `furnishedApartment`
- `studio`
- `house`
- `villa`
- `furnishedResidence`
- `hostel`
- `apartmentBuilding`
- `office`
- `commercialHouse`
- `factory`
- `industrialPremises`
- `storageSpace`
- `landParcel`

La location contient `room`. La vente contient `apartmentBuilding`.

## Structure d'une annonce

```text
{propertyId}
├── propertyType
├── transactionType          # rental | sale
├── title
├── description
├── price
├── currency
├── location
│   ├── provinceId
│   ├── cityId
│   ├── communeId
│   ├── neighborhoodId
│   ├── address
│   ├── latitude
│   └── longitude
├── propertyDetails
│   ├── bedrooms
│   ├── parkingCapacity
│   ├── generator
│   ├── solarPanels
│   ├── waterTank
│   ├── furnished
│   ├── swimmingPool
│   └── shortStayAvailable
├── publishedBy
├── status
├── createdAt
└── updatedAt
```

### Valeurs de `bedrooms`

`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9_plus`.

### Valeurs de `parkingCapacity`

`0`, `1`, `2`, `3`, `4_plus`.

Les équipements et commodités sont des booléens.

## Référentiel géographique

Le code conserve le référentiel RDC dans `src/data/propertyCatalog.ts`, avec les 26 provinces et les 24 communes de Kinshasa déjà définies.

Le modèle Firestore de référence prévu est :

```text
locations
└── rdc
    ├── provinces
    │   └── {provinceId}
    ├── cities
    │   └── {cityId}
    ├── communes
    │   └── {communeId}
    └── neighborhoods
        └── {neighborhoodId}
```

Cette forme ajoute le document racine `rdc` nécessaire à l'alternance collection/document imposée par Firestore, tout en conservant la classification fonctionnelle demandée `locations > provinces/cities/communes/neighborhoods`.

## Compatibilité

Le frontend normalise les données de ces deux collections vers le type `Listing` utilisé par les composants existants. Cela permet de conserver les modules déjà stables (accueil, détails, panier, messages, admin) pendant la migration du stockage.

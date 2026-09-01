export type PropertyIntent = 'RENT' | 'SALE';

export type PropertyTypeKey =
  | 'apartment'
  | 'furnishedApartment'
  | 'studio'
  | 'room'
  | 'house'
  | 'villa'
  | 'furnishedResidence'
  | 'hostel'
  | 'apartmentBuilding'
  | 'office'
  | 'commercialHouse'
  | 'factory'
  | 'industrialPremises'
  | 'storageSpace'
  | 'landParcel';

export type PropertyDetails = {
  bedrooms: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9_plus';
  parkingCapacity: '0' | '1' | '2' | '3' | '4_plus';
  generator: boolean;
  solarPanels: boolean;
  waterTank: boolean;
  furnished: boolean;
  swimmingPool: boolean;
  shortStayAvailable: boolean;
};

export type PropertyLocation = {
  provinceId: string;
  cityId: string;
  communeId: string;
  neighborhoodId: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export const rentalPropertyTypes = [
  {
    group: 'Résidentiel',
    items: [
      ['apartment', 'Appartement'],
      ['furnishedApartment', 'Appartement meublé'],
      ['studio', 'Studio'],
      ['room', 'Chambre'],
      ['house', 'Maison'],
      ['villa', 'Villa'],
      ['furnishedResidence', 'Résidence meublée'],
      ['hostel', 'Auberge'],
    ],
  },
  {
    group: 'Commercial et professionnel',
    items: [
      ['office', 'Bureau'],
      ['commercialHouse', 'Maison commerciale'],
    ],
  },
  {
    group: 'Industriel et stockage',
    items: [
      ['factory', 'Usine'],
      ['industrialPremises', 'Local industriel'],
      ['storageSpace', 'Espace de stockage'],
    ],
  },
  {
    group: 'Terrain',
    items: [['landParcel', 'Terrain / Parcelle']],
  },
] as const;

export const salePropertyTypes = [
  {
    group: 'Résidentiel',
    items: [
      ['apartment', 'Appartement'],
      ['furnishedApartment', 'Appartement meublé'],
      ['studio', 'Studio'],
      ['house', 'Maison'],
      ['villa', 'Villa'],
      ['furnishedResidence', 'Résidence meublée'],
      ['hostel', 'Auberge'],
    ],
  },
  {
    group: 'Immeubles',
    items: [['apartmentBuilding', 'Immeuble']],
  },
  {
    group: 'Commercial et professionnel',
    items: [
      ['office', 'Bureau'],
      ['commercialHouse', 'Maison commerciale'],
    ],
  },
  {
    group: 'Industriel et stockage',
    items: [
      ['factory', 'Usine'],
      ['industrialPremises', 'Local industriel'],
      ['storageSpace', 'Espace de stockage'],
    ],
  },
  {
    group: 'Terrain',
    items: [['landParcel', 'Terrain / Parcelle']],
  },
] as const;

export const bedroomOptions = [
  ['0', 'Studio / Sans chambre'],
  ['1', '1 chambre'],
  ['2', '2 chambres'],
  ['3', '3 chambres'],
  ['4', '4 chambres'],
  ['5', '5 chambres'],
  ['6', '6 chambres'],
  ['7', '7 chambres'],
  ['8', '8 chambres'],
  ['9_plus', '9 chambres ou plus'],
] as const;

export const parkingOptions = [
  ['0', 'Aucun'],
  ['1', '1 véhicule'],
  ['2', '2 véhicules'],
  ['3', '3 véhicules'],
  ['4_plus', '4 véhicules ou plus'],
] as const;

export const propertyAmenityOptions = [
  ['generator', 'Groupe électrogène'],
  ['solarPanels', 'Installation solaire'],
  ['waterTank', "Citerne / Réservoir d'eau"],
  ['furnished', 'Bien meublé'],
  ['swimmingPool', 'Piscine'],
  ['shortStayAvailable', 'Location de courte durée'],
] as const;

export const provinces = [
  'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kasaï', 'Kasaï-Central',
  'Kasaï-Oriental', 'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe',
  'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa',
].map((name, index) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
  name,
  countryCode: 'CD',
  isActive: true,
  displayOrder: index + 1,
}));

export const kinshasaCommunes = [
  'Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu', 'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso',
  'Lemba', 'Limete', 'Lingwala', 'Makala', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaba', 'Ngaliema',
  'Ngiri-Ngiri', 'Nsele', 'Selembao',
].map((name, index) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
  name,
  provinceId: 'kinshasa',
  cityId: 'kinshasa',
  isActive: true,
  displayOrder: index + 1,
}));

export const propertyCollectionForIntent = (intent: PropertyIntent) =>
  intent === 'RENT' ? 'rentalProperties' : 'saleProperties';

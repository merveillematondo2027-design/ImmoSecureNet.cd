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
    group: '1. RÉSIDENTIEL',
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
    group: '2. COMMERCIAL ET PROFESSIONNEL',
    items: [
      ['office', 'Bureau'],
      ['commercialHouse', 'Maison commerciale'],
    ],
  },
  {
    group: '3. INDUSTRIEL ET STOCKAGE',
    items: [
      ['factory', 'Usine'],
      ['industrialPremises', 'Local industriel'],
      ['storageSpace', 'Espace de stockage'],
    ],
  },
  {
    group: '4. TERRAIN',
    items: [['landParcel', 'Terrain / Parcelle']],
  },
] as const;

export const salePropertyTypes = [
  {
    group: '1. RÉSIDENTIEL',
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
    group: '2. IMMEUBLES',
    items: [['apartmentBuilding', 'Immeuble']],
  },
  {
    group: '3. COMMERCIAL ET PROFESSIONNEL',
    items: [
      ['office', 'Bureau'],
      ['commercialHouse', 'Maison commerciale'],
    ],
  },
  {
    group: '4. INDUSTRIEL ET STOCKAGE',
    items: [
      ['factory', 'Usine'],
      ['industrialPremises', 'Local industriel'],
      ['storageSpace', 'Espace de stockage'],
    ],
  },
  {
    group: '5. TERRAIN',
    items: [['landParcel', 'Terrain / Parcelle']],
  },
] as const;

export const bedroomOptions = [
  ['0', 'Studio'],
  ['1', '1 chambre + salon + cuisine + salle de bain'],
  ['2', '2 chambres + salon + cuisine + salle de bain'],
  ['3', '3 chambres + salon + cuisine + salle de bain'],
  ['4', '4 chambres + salon + cuisine + salle de bain'],
  ['5', '5 chambres + salon + cuisine + salle de bain'],
  ['6', '6 chambres + salon + cuisine + salle de bain'],
  ['7', '7 chambres + salon + cuisine + salle de bain'],
  ['8', '8 chambres + salon + cuisine + salle de bain'],
  ['9_plus', '9 chambres ou plus + pièces de vie'],
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

const slug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const provinces = [
  'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kasaï', 'Kasaï-Central',
  'Kasaï-Oriental', 'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe',
  'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa',
].map((name, index) => ({ id: slug(name), name, countryCode: 'CD', isActive: true, displayOrder: index + 1 }));

export const cities = [
  ['buta', 'Buta', 'bas-uele'], ['mbandaka', 'Mbandaka', 'equateur'], ['lubumbashi', 'Lubumbashi', 'haut-katanga'],
  ['kamina', 'Kamina', 'haut-lomami'], ['isiro', 'Isiro', 'haut-uele'], ['bunia', 'Bunia', 'ituri'],
  ['tshikapa', 'Tshikapa', 'kasai'], ['kananga', 'Kananga', 'kasai-central'], ['mbuji-mayi', 'Mbuji-Mayi', 'kasai-oriental'],
  ['kinshasa', 'Kinshasa', 'kinshasa'], ['matadi', 'Matadi', 'kongo-central'], ['kenge', 'Kenge', 'kwango'],
  ['bandundu', 'Bandundu', 'kwilu'], ['kabinda', 'Kabinda', 'lomami'], ['kolwezi', 'Kolwezi', 'lualaba'],
  ['inongo', 'Inongo', 'mai-ndombe'], ['kindu', 'Kindu', 'maniema'], ['lisala', 'Lisala', 'mongala'],
  ['goma', 'Goma', 'nord-kivu'], ['gbadolite', 'Gbadolite', 'nord-ubangi'], ['lusambo', 'Lusambo', 'sankuru'],
  ['bukavu', 'Bukavu', 'sud-kivu'], ['gemena', 'Gemena', 'sud-ubangi'], ['kalemie', 'Kalemie', 'tanganyika'],
  ['kisangani', 'Kisangani', 'tshopo'], ['boende', 'Boende', 'tshuapa'],
].map(([id, name, provinceId], index) => ({ id, name, code: id, provinceId, active: true, displayOrder: index + 1 }));

const communeRows: [string, string, string, string][] = [
  ['bandalungwa', 'Bandalungwa', 'kinshasa', 'kinshasa'], ['barumbu', 'Barumbu', 'kinshasa', 'kinshasa'], ['bumbu', 'Bumbu', 'kinshasa', 'kinshasa'],
  ['gombe', 'Gombe', 'kinshasa', 'kinshasa'], ['kalamu', 'Kalamu', 'kinshasa', 'kinshasa'], ['kasa-vubu', 'Kasa-Vubu', 'kinshasa', 'kinshasa'],
  ['kimbanseke', 'Kimbanseke', 'kinshasa', 'kinshasa'], ['kinshasa', 'Kinshasa', 'kinshasa', 'kinshasa'], ['kintambo', 'Kintambo', 'kinshasa', 'kinshasa'],
  ['kisenso', 'Kisenso', 'kinshasa', 'kinshasa'], ['lemba', 'Lemba', 'kinshasa', 'kinshasa'], ['limete', 'Limete', 'kinshasa', 'kinshasa'],
  ['lingwala', 'Lingwala', 'kinshasa', 'kinshasa'], ['makala', 'Makala', 'kinshasa', 'kinshasa'], ['maluku', 'Maluku', 'kinshasa', 'kinshasa'],
  ['masina', 'Masina', 'kinshasa', 'kinshasa'], ['matete', 'Matete', 'kinshasa', 'kinshasa'], ['mont-ngafula', 'Mont-Ngafula', 'kinshasa', 'kinshasa'],
  ['ndjili', "N'Djili", 'kinshasa', 'kinshasa'], ['ngaba', 'Ngaba', 'kinshasa', 'kinshasa'], ['ngaliema', 'Ngaliema', 'kinshasa', 'kinshasa'],
  ['ngiri-ngiri', 'Ngiri-Ngiri', 'kinshasa', 'kinshasa'], ['nsele', 'Nsele', 'kinshasa', 'kinshasa'], ['selembao', 'Selembao', 'kinshasa', 'kinshasa'],
  ['lubumbashi-commune', 'Lubumbashi', 'lubumbashi', 'haut-katanga'], ['kampemba', 'Kampemba', 'lubumbashi', 'haut-katanga'],
  ['kamalondo', 'Kamalondo', 'lubumbashi', 'haut-katanga'], ['kenya', 'Kenya', 'lubumbashi', 'haut-katanga'], ['katuba', 'Katuba', 'lubumbashi', 'haut-katanga'],
  ['ruwashi', 'Ruwashi', 'lubumbashi', 'haut-katanga'], ['annexe', 'Annexe', 'lubumbashi', 'haut-katanga'],
  ['goma', 'Goma', 'goma', 'nord-kivu'], ['karisimbi', 'Karisimbi', 'goma', 'nord-kivu'],
  ['ibanda', 'Ibanda', 'bukavu', 'sud-kivu'], ['kadutu', 'Kadutu', 'bukavu', 'sud-kivu'], ['bagira', 'Bagira', 'bukavu', 'sud-kivu'],
  ['matadi-commune', 'Matadi', 'matadi', 'kongo-central'], ['mvuzi', 'Mvuzi', 'matadi', 'kongo-central'], ['nzanza', 'Nzanza', 'matadi', 'kongo-central'],
];

export const communes = communeRows.map(([id, name, cityId, provinceId], index) => ({ id, name, code: id, cityId, provinceId, active: true, displayOrder: index + 1 }));
export const kinshasaCommunes = communes.filter((commune) => commune.cityId === 'kinshasa');

export const neighborhoods = [
  ['gombe', 'Gombe', 'gombe', ['Gombe']], ['haut-commande', 'Haut Commandement', 'gombe', ['Haut Commandement']],
  ['camp-tshatshi', 'Camp Tshatshi', 'gombe', ['Camp Tshatshi']], ['centre-ville', 'Centre-ville', 'gombe', ['Centre-ville', 'Centre ville']],
  ['lukunga', 'Lukunga', 'ngaliema', ['Lukunga']], ['ngomba-kikusa', 'Ngomba Kikusa', 'ngaliema', ['Ngomba Kikusa']],
  ['bumba', 'Bumba', 'ngaliema', ['Bumba']], ['binza-pigeon', 'Binza Pigeon', 'ngaliema', ['Binza', 'Binza Pigeon', 'Binza-Pigeon']],
  ['djelo-binza', 'Djelo-Binza', 'ngaliema', ['Djelo-Binza', 'Djelo Binza']], ['bangu', 'Bangu', 'ngaliema', ['Bangu']],
  ['punda', 'Punda', 'ngaliema', ['Punda']], ['kimpe', 'Kimpe', 'ngaliema', ['Kimpe']], ['anciens-combattants', 'Anciens Combattants', 'ngaliema', ['Anciens Combattants']],
  ['basoko', 'Basoko', 'ngaliema', ['Basoko']], ['congo', 'Congo', 'ngaliema', ['Congo']], ['joli-parc', 'Joli Parc', 'ngaliema', ['Joli Parc']],
  ['kinkenda', 'Kinkenda', 'ngaliema', ['Kinkenda']], ['kinsuka-pecheur', 'Kinsuka Pêcheur', 'ngaliema', ['Kinsuka', 'Kinsuka Pêcheur']],
  ['lonzo', 'Lonzo', 'ngaliema', ['Lonzo']], ['museyi', 'Museyi', 'ngaliema', ['Museyi']], ['maman-yemo', 'Maman Yemo', 'ngaliema', ['Maman Yemo']],
  ['manenga', 'Manenga', 'ngaliema', ['Manenga']], ['mfinda', 'Mfinda', 'ngaliema', ['Mfinda']], ['monganya', 'Monganya', 'ngaliema', ['Monganya']], ['lubudi', 'Lubudi', 'ngaliema', ['Lubudi']],
  ['agricole', 'Agricole', 'limete', ['Agricole']], ['funa', 'Funa', 'limete', ['Funa']], ['industriel', 'Industriel', 'limete', ['Industriel']],
  ['kingabwa', 'Kingabwa', 'limete', ['Kingabwa']], ['masiala', 'Masiala', 'limete', ['Masiala']], ['mayulu', 'Mayulu', 'limete', ['Mayulu']],
  ['mbamu', 'Mbamu', 'limete', ['Mbamu']], ['mombele', 'Mombele', 'limete', ['Mombele']], ['mososo', 'Mososo', 'limete', ['Mososo']],
  ['mfumu-mvula', 'Mfumu Mvula', 'limete', ['Mfumu Mvula']], ['ndanu', 'Ndanu', 'limete', ['Ndanu']], ['nzadi', 'Nzadi', 'limete', ['Nzadi']],
  ['residentiel', 'Résidentiel', 'limete', ['Résidentiel', 'Residentiel']], ['salongo', 'Salongo', 'limete', ['Salongo']],
].map(([id, name, communeId, searchKeywords]) => ({
  id: id as string,
  name: name as string,
  code: id as string,
  searchKeywords: searchKeywords as string[],
  communeId: communeId as string,
  cityId: 'kinshasa',
  provinceId: 'kinshasa',
  active: true,
}));

export const propertyCollectionForIntent = (intent: PropertyIntent) => intent === 'RENT' ? 'rentalProperties' : 'saleProperties';

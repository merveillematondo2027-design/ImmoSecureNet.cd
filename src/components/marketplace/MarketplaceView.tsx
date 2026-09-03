import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  Search,
  SlidersHorizontal,
  ShoppingCart,
} from 'lucide-react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useProperties } from '../../context/PropertyContext';
import { db } from '../../firebase';
import { Listing, ListingStatus, ListingType, PropertyType, UserRole } from '../../types';
import {
  bedroomOptions,
  cities,
  communes,
  neighborhoods,
  parkingOptions,
  propertyAmenityOptions,
  PropertyTypeKey,
  provinces,
  rentalPropertyTypes,
  salePropertyTypes,
} from '../../data/propertyCatalog';
import { HomeServicesStrip } from './HomeServicesStrip';
import { HomeFeed } from './HomeFeed';

type Intent = 'RENT' | 'SALE';
type ShowcaseItem = { id: string; title: string; subtitle: string; image: string; badge?: string };
type TriState = 'ANY' | 'YES' | 'NO';

const DEFAULT_ROTATION_SECONDS = 6;
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85';

const experienceItems: ShowcaseItem[] = [
  { id: 'experience-1', title: 'Restaurants', subtitle: 'Adresses et tables à découvrir', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
  { id: 'experience-2', title: 'Parcs & loisirs', subtitle: 'Sorties, détente et activités', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
];

const ishopItems: ShowcaseItem[] = [
  { id: 'ishop-1', title: 'I-SHOP', subtitle: 'Magasins et équipements pour la maison', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', badge: 'I-SHOP' },
];

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'XAF',
  maximumFractionDigits: 0,
}).format(price);

const mapCatalogTypeToLegacy = (value: PropertyTypeKey): PropertyType => {
  if (value === 'landParcel') return PropertyType.LAND;
  if (value === 'apartment' || value === 'furnishedApartment' || value === 'studio') return PropertyType.APARTMENT;
  if (value === 'villa') return PropertyType.VILLA;
  if (value === 'apartmentBuilding') return PropertyType.BUILDING;
  if (['office', 'commercialHouse', 'factory', 'industrialPremises', 'storageSpace'].includes(value)) return PropertyType.COMMERCIAL;
  return PropertyType.HOUSE;
};

const normalizeCatalogListing = (id: string, data: any, listingType: ListingType): Listing => {
  const key = String(data.propertyType || 'house') as PropertyTypeKey;
  const location = data.location || {};
  const details = data.propertyDetails || {};
  const publisher = data.publishedBy || {};
  const createdAt = String(data.publishedAt || data.createdAt || new Date().toISOString());

  return {
    id,
    propertyId: String(data.propertyId || id),
    title: String(data.title || 'Bien immobilier'),
    shortDescription: String(data.shortDescription || data.description || ''),
    fullDescription: String(data.fullDescription || data.description || ''),
    listingType,
    propertyType: mapCatalogTypeToLegacy(key),
    price: Number(data.price || 0),
    currency: data.currency || 'USD',
    location: {
      address: String(location.address || ''),
      city: String(location.city || location.cityName || location.cityId || ''),
      neighborhood: String(location.neighborhood || location.neighborhoodName || location.neighborhoodId || ''),
      country: String(location.country || 'RDC'),
      coordinates: location.latitude && location.longitude ? { lat: Number(location.latitude), lng: Number(location.longitude) } : undefined,
      provinceId: location.provinceId,
      cityId: location.cityId,
      communeId: location.communeId,
      neighborhoodId: location.neighborhoodId,
    } as any,
    surface: Number(data.surface || 0),
    bedrooms: Number(details.bedrooms === '9_plus' ? 9 : details.bedrooms ?? data.bedrooms ?? 0),
    bathrooms: Number(data.bathrooms || 0),
    features: Array.isArray(data.features) ? data.features : [],
    mainPhoto: String(data.mainPhoto || data.imageUrl || DEFAULT_HERO_IMAGE),
    galleryPhotos: Array.isArray(data.galleryPhotos) ? data.galleryPhotos : [],
    status: data.status || ListingStatus.ACTIVE,
    publishedBy: {
      id: String(publisher.id || data.ownerId || ''),
      name: String(publisher.name || data.ownerName || 'Annonceur ImmoSecureNet'),
      role: publisher.role || UserRole.OWNER,
      avatarUrl: publisher.avatarUrl,
      companyName: publisher.companyName,
      isVerified: Boolean(publisher.isVerified),
      phone: String(publisher.phone || ''),
      email: String(publisher.email || ''),
    },
    viewsCount: Number(data.viewsCount || 0),
    inquiriesCount: Number(data.inquiriesCount || 0),
    isFeatured: Boolean(data.isFeatured),
    publishedAt: createdAt,
    updatedAt: String(data.updatedAt || createdAt),
    propertyTypeKey: key,
    propertyDetails: details,
  } as Listing & { propertyTypeKey: PropertyTypeKey; propertyDetails: Record<string, unknown> };
};

const ListingStrip: React.FC<{
  title: string;
  listings: Listing[];
  seconds: number;
  onOpen: (listing: Listing) => void;
  onChat: (listing: Listing) => void;
  onCart?: (listing: Listing) => void;
  onSeeAll: () => void;
  accent: string;
}> = ({ title, listings, seconds, onOpen, onChat, onCart, onSeeAll, accent }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (listings.length <= 1) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % listings.length), Math.max(2500, seconds * 1000));
    return () => window.clearInterval(timer);
  }, [listings.length, seconds]);

  const item = listings[index];
  const showCart = Boolean(item && item.listingType === ListingType.SALE && onCart);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-base text-slate-900 uppercase">{title}</h3>
        <button onClick={onSeeAll} className="text-xs font-black text-[#1e3a8a] flex items-center gap-1">VOIR TOUT <ArrowRight className="w-3.5 h-3.5" /></button>
      </div>
      {item ? (
        <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
          <button onClick={() => onOpen(item)} className="relative w-full aspect-video text-left bg-slate-900">
            <img src={item.mainPhoto} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <span className={`absolute top-3 left-3 ${accent} text-white px-2.5 py-1 rounded-full text-[10px] font-black`}>{item.listingType === ListingType.RENT ? 'À LOUER' : 'À VENDRE'}</span>
            <div className="absolute inset-0 flex items-center justify-center"><span className="w-11 h-11 rounded-full bg-white/90 text-[#1e3a8a] flex items-center justify-center"><Play className="w-5 h-5" fill="currentColor" /></span></div>
            <div className="absolute left-4 right-4 bottom-4 text-white">
              <div className="font-black text-lg line-clamp-1">{item.title}</div>
              <div className="text-xs mt-1 flex justify-between gap-2"><span>{item.location.neighborhood}, {item.location.city}</span><strong>{formatPrice(item.price, item.currency)}</strong></div>
            </div>
          </button>
          <div className={`grid ${showCart ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <button onClick={() => onOpen(item)} className="py-3 text-xs font-bold text-[#1e3a8a]">Voir l’annonce</button>
            <button onClick={() => onChat(item)} className="py-3 text-xs font-bold text-[#16a34a] border-l border-slate-100 flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4" /> Discuter</button>
            {showCart && <button onClick={() => onCart?.(item)} className="py-3 text-xs font-bold text-slate-700 border-l border-slate-100 flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4" /> Panier</button>}
          </div>
        </div>
      ) : <div className="aspect-video bg-white border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-sm text-slate-500">Aucune annonce disponible</div>}
    </section>
  );
};

const GenericStrip: React.FC<{ title: string; items: ShowcaseItem[]; seconds: number; onOpen: () => void; accent: string }> = ({ title, items, seconds, onOpen, accent }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % items.length), Math.max(2500, seconds * 1000));
    return () => window.clearInterval(timer);
  }, [items.length, seconds]);
  const item = items[index];
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between"><h3 className="font-black text-base text-slate-900 uppercase">{title}</h3><button onClick={onOpen} className="text-xs font-black text-[#1e3a8a] flex items-center gap-1">VOIR TOUT <ArrowRight className="w-3.5 h-3.5" /></button></div>
      <button onClick={onOpen} className="relative w-full aspect-video rounded-2xl overflow-hidden text-left bg-slate-900">
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <span className={`absolute top-3 left-3 ${accent} text-white px-2.5 py-1 rounded-full text-[10px] font-black`}>{item.badge}</span>
        <div className="absolute left-4 right-4 bottom-4 text-white"><div className="font-black text-lg">{item.title}</div><div className="text-xs mt-1 text-white/90">{item.subtitle}</div></div>
      </button>
    </section>
  );
};

export const MarketplaceView: React.FC = () => {
  const { listings, setSelectedListing, setActiveNavTab, showToast, addToCart } = useProperties();
  const [intent, setIntent] = useState<Intent>('RENT');
  const [propertyType, setPropertyType] = useState<PropertyTypeKey | ''>('');
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [parkingCapacity, setParkingCapacity] = useState('');
  const [amenities, setAmenities] = useState<Record<string, TriState>>(() => Object.fromEntries(propertyAmenityOptions.map(([key]) => [key, 'ANY'])));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [rotationSeconds, setRotationSeconds] = useState(DEFAULT_ROTATION_SECONDS);
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);
  const [rentalCatalog, setRentalCatalog] = useState<Listing[]>([]);
  const [saleCatalog, setSaleCatalog] = useState<Listing[]>([]);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => onSnapshot(doc(db, 'appSettings', 'homepage'), (snapshot) => {
    const value = Number(snapshot.data()?.rotationSeconds);
    if (Number.isFinite(value) && value >= 2 && value <= 60) setRotationSeconds(value);
  }, (error) => console.warn('Lecture appSettings/homepage:', error.code)), []);

  useEffect(() => onSnapshot(doc(db, 'appSettings', 'branding'), (snapshot) => {
    setHeroImage(String(snapshot.data()?.homeCoverDataUrl || '') || DEFAULT_HERO_IMAGE);
  }, (error) => console.warn('Lecture appSettings/branding:', error.code)), []);

  useEffect(() => {
    const rentalQuery = query(collection(db, 'rentalProperties'), where('status', '==', ListingStatus.ACTIVE));
    return onSnapshot(rentalQuery, (snapshot) => setRentalCatalog(snapshot.docs.map((item) => normalizeCatalogListing(item.id, item.data(), ListingType.RENT))), (error) => console.warn('Lecture rentalProperties:', error.code));
  }, []);

  useEffect(() => {
    const saleQuery = query(collection(db, 'saleProperties'), where('status', '==', ListingStatus.ACTIVE));
    return onSnapshot(saleQuery, (snapshot) => setSaleCatalog(snapshot.docs.map((item) => normalizeCatalogListing(item.id, item.data(), ListingType.SALE))), (error) => console.warn('Lecture saleProperties:', error.code));
  }, []);

  const legacySale = useMemo(() => listings.filter((listing) => listing.listingType === ListingType.SALE), [listings]);
  const legacyRent = useMemo(() => listings.filter((listing) => listing.listingType === ListingType.RENT), [listings]);
  const effectiveListings = useMemo(() => [
    ...(saleCatalog.length ? saleCatalog : legacySale),
    ...(rentalCatalog.length ? rentalCatalog : legacyRent),
  ], [saleCatalog, rentalCatalog, legacySale, legacyRent]);
  const sortedListings = useMemo(() => [...effectiveListings].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()), [effectiveListings]);
  const saleListings = useMemo(() => sortedListings.filter((listing) => listing.listingType === ListingType.SALE), [sortedListings]);
  const rentListings = useMemo(() => sortedListings.filter((listing) => listing.listingType === ListingType.RENT), [sortedListings]);

  const typeGroups = intent === 'RENT' ? rentalPropertyTypes : salePropertyTypes;
  const cityOptions = useMemo(() => cities.filter((item) => !provinceId || item.provinceId === provinceId), [provinceId]);
  const communeOptions = useMemo(() => communes.filter((item) => !cityId || item.cityId === cityId), [cityId]);
  const neighborhoodOptions = useMemo(() => neighborhoods.filter((item) => !communeId || item.communeId === communeId), [communeId]);
  const selectedCityName = cityOptions.find((item) => item.id === cityId)?.name || cities.find((item) => item.id === cityId)?.name || '';

  const handleCityChange = (value: string) => {
    setCityId(value);
    setCommuneId('');
    setNeighborhoodId('');
    if (!value) return;
    const selectedCity = cities.find((item) => item.id === value);
    if (selectedCity?.provinceId) setProvinceId(selectedCity.provinceId);
  };

  const handleCommuneChange = (value: string) => {
    setCommuneId(value);
    setNeighborhoodId('');
    if (!value) return;
    const selectedCommune = communes.find((item) => item.id === value);
    if (!selectedCommune) return;
    setCityId(selectedCommune.cityId);
    setProvinceId(selectedCommune.provinceId);
  };

  const handleNeighborhoodChange = (value: string) => {
    setNeighborhoodId(value);
    if (!value) return;
    const selectedNeighborhood = neighborhoods.find((item) => item.id === value);
    if (!selectedNeighborhood) return;
    setCommuneId(selectedNeighborhood.communeId);
    setCityId(selectedNeighborhood.cityId);
    setProvinceId(selectedNeighborhood.provinceId);
  };

  const filteredResults = useMemo(() => sortedListings.filter((listing) => {
    if (listing.listingType !== (intent === 'RENT' ? ListingType.RENT : ListingType.SALE)) return false;
    const item: any = listing;
    const loc: any = listing.location;
    const detail = item.propertyDetails || {};

    if (propertyType) {
      if (item.propertyTypeKey) {
        if (item.propertyTypeKey !== propertyType) return false;
      } else if (mapCatalogTypeToLegacy(propertyType) !== listing.propertyType) return false;
    }

    if (provinceId) {
      const byId = loc.provinceId === provinceId;
      const provinceName = provinces.find((province) => province.id === provinceId)?.name?.toLowerCase();
      const byText = provinceName && `${listing.location.city} ${listing.location.address}`.toLowerCase().includes(provinceName);
      if (!byId && !byText) return false;
    }
    if (cityId) {
      const listingCity = listing.location.city.toLowerCase();
      if (loc.cityId !== cityId && listingCity !== selectedCityName.toLowerCase() && listingCity !== cityId.toLowerCase()) return false;
    }
    if (communeId && loc.communeId !== communeId && !listing.location.neighborhood.toLowerCase().includes(communeId.replace(/-/g, ' '))) return false;
    if (neighborhoodId) {
      const selectedNeighborhood = neighborhoods.find((item) => item.id === neighborhoodId);
      const searchable = `${listing.location.neighborhood} ${loc.neighborhoodId || ''} ${listing.location.address}`.toLowerCase();
      const matchesKeyword = selectedNeighborhood?.searchKeywords.some((keyword) => searchable.includes(keyword.toLowerCase()));
      if (loc.neighborhoodId !== neighborhoodId && !matchesKeyword) return false;
    }

    if (bedrooms && (bedrooms === '9_plus' ? listing.bedrooms < 9 : listing.bedrooms !== Number(bedrooms))) return false;
    if (parkingCapacity) {
      const actual = String(detail.parkingCapacity ?? '');
      if (actual ? actual !== parkingCapacity : !listing.features.join(' ').toLowerCase().includes('parking')) return false;
    }

    for (const [key, state] of Object.entries(amenities)) {
      if (state === 'ANY') continue;
      const direct = detail[key];
      const labels: Record<string, string[]> = {
        generator: ['groupe électrogène', 'generateur', 'générateur'],
        solarPanels: ['solaire', 'panneau solaire'],
        waterTank: ['citerne', "réservoir d'eau", 'reservoir'],
        furnished: ['meublé', 'meuble'],
        swimmingPool: ['piscine'],
        shortStayAvailable: ['court séjour', 'courte durée'],
      };
      const inferred = labels[key]?.some((label) => listing.features.join(' ').toLowerCase().includes(label)) || false;
      const value = typeof direct === 'boolean' ? direct : inferred;
      if ((state === 'YES' && !value) || (state === 'NO' && value)) return false;
    }

    if (minPrice && listing.price < Number(minPrice)) return false;
    if (maxPrice && listing.price > Number(maxPrice)) return false;
    return true;
  }), [sortedListings, intent, propertyType, provinceId, cityId, communeId, neighborhoodId, bedrooms, parkingCapacity, amenities, minPrice, maxPrice, selectedCityName]);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchSubmitted(true);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const chooseCategory = (value: string) => {
    if (value === 'HOTELS') {
      setActiveNavTab('hotel_partners');
      return;
    }
    const map: Record<string, PropertyTypeKey> = { LAND: 'landParcel', APARTMENT: 'apartment', HOME: 'house', OFFICE: 'office', COMMERCE: 'commercialHouse' };
    setPropertyType(map[value] || '');
    setSearchSubmitted(false);
    document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth' });
  };

  const chat = (listing: Listing) => {
    sessionStorage.setItem('immosecure_pending_contact', JSON.stringify({ type: 'LISTING', listingId: listing.id, publisherId: listing.publishedBy.id, publisherName: listing.publishedBy.name, listingTitle: listing.title, price: listing.price }));
    setActiveNavTab('messages');
  };

  const seeAll = (next: Intent) => {
    setIntent(next);
    setSearchSubmitted(true);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const categories = [
    ['LAND', 'Terrains / Parcelles'], ['APARTMENT', 'Appartements'], ['HOME', 'Maisons / Villas / Immeubles'],
    ['OFFICE', 'Bureaux'], ['COMMERCE', 'Commerces'], ['HOTELS', 'Hôtels'], ['OTHER', 'Autres'],
  ];

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto">
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1e3a8a] tracking-tight leading-tight">TROUVER LE BIEN IDÉAL</h1>
          <div className="mt-3 space-y-0.5">
            {categories.map(([value, label]) => (
              <button key={value} onClick={() => chooseCategory(value)} className="w-full flex items-center gap-2.5 py-1.5 text-left font-bold text-slate-700 min-h-9">
                <span className="w-[18px] h-[18px] rounded-full bg-[#16a34a] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3 h-3 text-white" /></span>
                <span className="text-[15px] sm:text-base leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth' })} className="block w-full"><img src={heroImage} alt="Présentation ImmoSecureNet" className="w-full aspect-[16/8] object-cover" /></button>
      </section>

      <section id="home-search" className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm scroll-mt-24">
        <div className="grid grid-cols-2">
          <button type="button" onClick={() => { setIntent('RENT'); setPropertyType(''); setSearchSubmitted(false); }} className={`py-4 font-black ${intent === 'RENT' ? 'bg-[#16a34a] text-white' : 'bg-emerald-50 text-emerald-800'}`}>À LOUER</button>
          <button type="button" onClick={() => { setIntent('SALE'); setPropertyType(''); setSearchSubmitted(false); }} className={`py-4 font-black ${intent === 'SALE' ? 'bg-[#1e3a8a] text-white' : 'bg-blue-50 text-blue-900'}`}>À VENDRE</button>
        </div>

        <form onSubmit={search} className="p-4 space-y-3">
          <div className="relative">
            <Building2 className="pointer-events-none w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select aria-label="Type de bien" value={propertyType} onChange={(event) => setPropertyType(event.target.value as PropertyTypeKey | '')} className="w-full border border-slate-300 rounded-xl pl-9 pr-9 py-3 text-sm bg-white appearance-none cursor-pointer">
              <option value="">Type de bien</option>
              {typeGroups.map((group) => <optgroup key={group.group} label={group.group}>{group.items.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</optgroup>)}
            </select>
            <ChevronDown className="pointer-events-none w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <MapPin className="pointer-events-none w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select aria-label="Province" value={provinceId} onChange={(event) => { setProvinceId(event.target.value); setCityId(''); setCommuneId(''); setNeighborhoodId(''); }} className="w-full border border-slate-300 rounded-xl pl-9 pr-8 py-3 text-sm bg-white appearance-none cursor-pointer">
                <option value="">Province</option>{provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select aria-label="Ville" value={cityId} onChange={(event) => handleCityChange(event.target.value)} className="w-full border border-slate-300 rounded-xl px-3 pr-9 py-3 text-sm bg-white appearance-none cursor-pointer">
                <option value="">Ville</option>{cityOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <select aria-label="Commune" value={communeId} onChange={(event) => handleCommuneChange(event.target.value)} className="w-full border border-slate-300 rounded-xl px-3 pr-9 py-3 text-sm bg-white appearance-none cursor-pointer">
                <option value="">Commune</option>{communeOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select aria-label="Quartier" value={neighborhoodId} onChange={(event) => handleNeighborhoodChange(event.target.value)} className="w-full border border-slate-300 rounded-xl px-3 pr-9 py-3 text-sm bg-white appearance-none cursor-pointer">
                <option value="">Quartier</option>{neighborhoodOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button type="button" onClick={() => setDetailsOpen((value) => !value)} className="w-full border border-slate-300 rounded-xl px-3 py-3 flex items-center justify-between text-sm font-bold text-slate-700 cursor-pointer active:bg-slate-50">
            <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Plus de détails</span>{detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {detailsOpen && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} className="border border-slate-300 rounded-xl px-3 py-3 text-sm bg-white cursor-pointer"><option value="">Nombre des pièces</option>{bedroomOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <select value={parkingCapacity} onChange={(event) => setParkingCapacity(event.target.value)} className="border border-slate-300 rounded-xl px-3 py-3 text-sm bg-white cursor-pointer"><option value="">Capacité de stationnement</option>{parkingOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </div>
              <div className="space-y-2">
                {propertyAmenityOptions.map(([key, label]) => (
                  <div key={key} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700">{label}</span>
                    <select value={amenities[key]} onChange={(event) => setAmenities((current) => ({ ...current, [key]: event.target.value as TriState }))} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white cursor-pointer"><option value="ANY">Indifférent</option><option value="YES">Oui</option><option value="NO">Non</option></select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="relative"><DollarSign className="pointer-events-none w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="number" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Prix min" className="w-full border border-slate-300 rounded-xl pl-9 pr-2 py-3 text-sm" /></div>
            <div className="relative"><DollarSign className="pointer-events-none w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Prix max" className="w-full border border-slate-300 rounded-xl pl-9 pr-2 py-3 text-sm" /></div>
          </div>

          <button type="submit" className={`w-full py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 ${intent === 'RENT' ? 'bg-[#16a34a]' : 'bg-[#1e3a8a]'}`}><Search className="w-4 h-4" /> RECHERCHER</button>
        </form>
      </section>

      {searchSubmitted && (
        <section ref={resultRef} className="space-y-3 scroll-mt-24">
          <div><h2 className="font-black text-lg">Résultats — {intent === 'RENT' ? 'À louer' : 'À vendre'}</h2><p className="text-xs text-slate-500">{filteredResults.length} annonce(s)</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredResults.map((listing) => (
              <article key={listing.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button onClick={() => setSelectedListing(listing)} className="w-full text-left"><img src={listing.mainPhoto} alt={listing.title} className="w-full aspect-video object-cover" /><div className="p-3"><h3 className="font-black text-sm">{listing.title}</h3><div className="mt-2 flex justify-between text-xs"><span>{listing.location.neighborhood}, {listing.location.city}</span><strong className="text-[#1e3a8a]">{formatPrice(listing.price, listing.currency)}</strong></div><div className="mt-2 flex gap-3 text-[10px] text-slate-500"><span className="flex gap-1"><BedDouble className="w-3 h-3" />{listing.bedrooms}</span><span className="flex gap-1"><Maximize2 className="w-3 h-3" />{listing.surface} m²</span></div></div></button>
                <div className={`grid ${listing.listingType === ListingType.SALE ? 'grid-cols-2' : 'grid-cols-1'} border-t`}><button onClick={() => chat(listing)} className="py-3 text-[#16a34a] font-bold text-xs flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4" /> Discuter</button>{listing.listingType === ListingType.SALE && <button onClick={() => void addToCart(listing)} className="py-3 text-slate-700 font-bold text-xs border-l flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4" /> Panier</button>}</div>
              </article>
            ))}
            {!filteredResults.length && <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Aucun bien ne correspond encore à ces critères.</div>}
          </div>
        </section>
      )}

      <ListingStrip title="À vendre" listings={saleListings} seconds={rotationSeconds} onOpen={setSelectedListing} onChat={chat} onCart={(listing) => void addToCart(listing)} onSeeAll={() => seeAll('SALE')} accent="bg-[#1e3a8a]" />
      <ListingStrip title="À louer" listings={rentListings} seconds={rotationSeconds} onOpen={setSelectedListing} onChat={chat} onSeeAll={() => seeAll('RENT')} accent="bg-[#16a34a]" />
      <HomeServicesStrip seconds={rotationSeconds} onSeeAll={() => setActiveNavTab('services')} />
      <GenericStrip title="Expériences" items={experienceItems} seconds={rotationSeconds} onOpen={() => showToast('La rubrique Expériences sera reliée à son catalogue complet.', 'info')} accent="bg-[#1e3a8a]" />
      <GenericStrip title="I-SHOP" items={ishopItems} seconds={rotationSeconds} onOpen={() => setActiveNavTab('furniture_marketplace')} accent="bg-[#16a34a]" />
      <HomeFeed listings={sortedListings} />
    </div>
  );
};

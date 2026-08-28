import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useProperties } from '../../context/PropertyContext';
import { db } from '../../firebase';
import { Listing, ListingType, PropertyType } from '../../types';

type Intent = 'RENT' | 'SALE';

type ShowcaseItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
};

const DEFAULT_ROTATION_SECONDS = 6;
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85';

const habitatItems: ShowcaseItem[] = [
  { id: 'habitat-1', title: 'Matériaux de construction', subtitle: 'Ciment, fer, peinture et autres matériaux', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', badge: 'Marché de l’habitat' },
  { id: 'habitat-2', title: 'Meubles & décoration', subtitle: 'Mobilier et aménagement de la maison', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', badge: 'Marché de l’habitat' },
  { id: 'habitat-3', title: 'Électroménager & équipements', subtitle: 'Équipements pratiques pour votre logement', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', badge: 'Marché de l’habitat' },
  { id: 'habitat-4', title: 'Énergie & solaire', subtitle: 'Solutions d’autonomie pour la maison', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80', badge: 'Marché de l’habitat' },
];

const experienceItems: ShowcaseItem[] = [
  { id: 'experience-1', title: 'Hôtels & séjours', subtitle: 'Découvrez des lieux de séjour et de détente', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
  { id: 'experience-2', title: 'Restaurants', subtitle: 'Adresses et tables à découvrir', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
  { id: 'experience-3', title: 'Parcs & loisirs', subtitle: 'Sorties, détente et activités', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
  { id: 'experience-4', title: 'Commerces & bonnes adresses', subtitle: 'Des établissements à découvrir près de vous', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
];

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'XAF',
  maximumFractionDigits: 0,
}).format(price);

const ListingTVStrip: React.FC<{
  title: string;
  listings: Listing[];
  rotationSeconds: number;
  onOpen: (listing: Listing) => void;
  onChat: (listing: Listing) => void;
  onSeeAll: () => void;
  accent: 'blue' | 'green';
}> = ({ title, listings, rotationSeconds, onOpen, onChat, onSeeAll, accent }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (listings.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % listings.length), Math.max(2500, rotationSeconds * 1000));
    return () => window.clearInterval(timer);
  }, [listings.length, rotationSeconds]);

  useEffect(() => {
    if (index >= listings.length) setIndex(0);
  }, [index, listings.length]);

  const item = listings[index];
  const accentClass = accent === 'blue' ? 'bg-[#1e3a8a]' : 'bg-[#16a34a]';

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <button onClick={onSeeAll} className="text-[11px] sm:text-xs font-bold text-[#1e3a8a] flex items-center gap-1">
          VOIR TOUT <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {item ? (
        <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
          <button type="button" onClick={() => onOpen(item)} className="relative w-full aspect-video bg-slate-900 text-left group">
            <img src={item.mainPhoto} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className={`absolute top-3 left-3 ${accentClass} text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase`}>
              {item.listingType === ListingType.RENT ? 'À louer' : 'À vendre'}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/90 text-[#1e3a8a] flex items-center justify-center shadow-lg"><Play className="w-5 h-5 ml-0.5" fill="currentColor" /></div>
            </div>
            <div className="absolute left-4 right-4 bottom-4 text-white">
              <div className="font-black text-base sm:text-xl line-clamp-1">{item.title}</div>
              <div className="text-xs sm:text-sm text-white/85 mt-1 flex items-center justify-between gap-3">
                <span className="line-clamp-1">{item.location.neighborhood}, {item.location.city}</span>
                <span className="font-black whitespace-nowrap">{formatPrice(item.price, item.currency)}</span>
              </div>
            </div>
          </button>
          <div className="grid grid-cols-2 border-t border-slate-100">
            <button onClick={() => onOpen(item)} className="py-2.5 text-xs font-bold text-[#1e3a8a] hover:bg-blue-50">Voir l’annonce</button>
            <button onClick={() => onChat(item)} className="py-2.5 text-xs font-bold text-[#16a34a] hover:bg-emerald-50 border-l border-slate-100 flex items-center justify-center gap-1.5">
              <MessageCircle className="w-4 h-4" /> Discuter
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-video rounded-2xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-center p-6 text-sm text-slate-500">Aucune annonce disponible dans cette rubrique pour le moment.</div>
      )}

      {listings.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {listings.map((listing, dotIndex) => (
            <button key={listing.id} type="button" aria-label={`Afficher ${listing.title}`} onClick={() => setIndex(dotIndex)} className={`h-1.5 rounded-full transition-all ${dotIndex === index ? 'w-5 bg-[#1e3a8a]' : 'w-1.5 bg-slate-300'}`} />
          ))}
        </div>
      )}
    </section>
  );
};

const GenericTVStrip: React.FC<{
  title: string;
  items: ShowcaseItem[];
  rotationSeconds: number;
  onOpen: (item: ShowcaseItem) => void;
  onSeeAll: () => void;
  accent: 'blue' | 'green';
}> = ({ title, items, rotationSeconds, onOpen, onSeeAll, accent }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), Math.max(2500, rotationSeconds * 1000));
    return () => window.clearInterval(timer);
  }, [items.length, rotationSeconds]);
  const item = items[index];
  const accentClass = accent === 'blue' ? 'bg-[#1e3a8a]' : 'bg-[#16a34a]';

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <button onClick={onSeeAll} className="text-[11px] sm:text-xs font-bold text-[#1e3a8a] flex items-center gap-1">VOIR TOUT <ArrowRight className="w-3.5 h-3.5" /></button>
      </div>
      <button type="button" onClick={() => onOpen(item)} className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-sm text-left group">
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className={`absolute top-3 left-3 ${accentClass} text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase`}>{item.badge}</div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-12 h-12 rounded-full bg-white/90 text-[#1e3a8a] flex items-center justify-center shadow-lg"><Play className="w-5 h-5 ml-0.5" fill="currentColor" /></div></div>
        <div className="absolute left-4 right-4 bottom-4 text-white"><div className="font-black text-base sm:text-xl">{item.title}</div><div className="text-xs sm:text-sm text-white/85 mt-1">{item.subtitle}</div></div>
      </button>
      <div className="flex items-center justify-center gap-1.5">
        {items.map((entry, dotIndex) => <button key={entry.id} type="button" aria-label={`Afficher ${entry.title}`} onClick={() => setIndex(dotIndex)} className={`h-1.5 rounded-full transition-all ${dotIndex === index ? 'w-5 bg-[#1e3a8a]' : 'w-1.5 bg-slate-300'}`} />)}
      </div>
    </section>
  );
};

export const MarketplaceView: React.FC = () => {
  const { listings, setSelectedListing, showToast, setActiveNavTab } = useProperties();
  const [intent, setIntent] = useState<Intent>('RENT');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [rotationSeconds, setRotationSeconds] = useState(DEFAULT_ROTATION_SECONDS);
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const homepageRef = doc(db, 'appSettings', 'homepage');
    return onSnapshot(homepageRef, (snap) => {
      if (!snap.exists()) return;
      const value = Number(snap.data()?.rotationSeconds);
      if (Number.isFinite(value) && value >= 2 && value <= 60) setRotationSeconds(value);
    }, () => setRotationSeconds(DEFAULT_ROTATION_SECONDS));
  }, []);

  useEffect(() => {
    const brandingRef = doc(db, 'appSettings', 'branding');
    return onSnapshot(brandingRef, (snap) => {
      const value = snap.exists() ? String(snap.data()?.homeCoverDataUrl || '') : '';
      setHeroImage(value || DEFAULT_HERO_IMAGE);
    }, () => setHeroImage(DEFAULT_HERO_IMAGE));
  }, []);

  const sortedListings = useMemo(() => [...listings].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()), [listings]);
  const saleListings = useMemo(() => sortedListings.filter((listing) => listing.listingType === ListingType.SALE), [sortedListings]);
  const rentListings = useMemo(() => sortedListings.filter((listing) => listing.listingType === ListingType.RENT), [sortedListings]);

  const filteredResults = useMemo(() => {
    const expectedListingType = intent === 'RENT' ? ListingType.RENT : ListingType.SALE;
    const normalizedLocation = location.trim().toLowerCase();
    const normalizedDetails = details.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return sortedListings.filter((listing) => {
      if (listing.listingType !== expectedListingType) return false;
      if (propertyType) {
        const acceptedTypes: Record<string, PropertyType[]> = {
          LAND: [PropertyType.LAND],
          HOME: [PropertyType.HOUSE, PropertyType.VILLA, PropertyType.BUILDING, PropertyType.APARTMENT],
          OFFICE: [PropertyType.COMMERCIAL],
          COMMERCIAL: [PropertyType.COMMERCIAL],
          OTHER: [],
        };
        const accepted = acceptedTypes[propertyType] || [];
        if (propertyType === 'OTHER') {
          if ([PropertyType.LAND, PropertyType.HOUSE, PropertyType.VILLA, PropertyType.BUILDING, PropertyType.APARTMENT, PropertyType.COMMERCIAL].includes(listing.propertyType)) return false;
        } else if (!accepted.includes(listing.propertyType)) return false;
      }
      if (normalizedLocation) {
        const haystack = `${listing.location.address} ${listing.location.city} ${listing.location.neighborhood} ${listing.location.country}`.toLowerCase();
        if (!haystack.includes(normalizedLocation)) return false;
      }
      if (normalizedDetails) {
        const haystack = `${listing.features.join(' ')} ${listing.bedrooms} chambres ${listing.bathrooms} salles de bain ${listing.shortDescription}`.toLowerCase();
        if (!haystack.includes(normalizedDetails)) return false;
      }
      if (min !== null && Number.isFinite(min) && listing.price < min) return false;
      if (max !== null && Number.isFinite(max) && listing.price > max) return false;
      return true;
    });
  }, [details, intent, location, maxPrice, minPrice, propertyType, sortedListings]);

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    setSearchSubmitted(true);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const showAllForIntent = (nextIntent: Intent) => {
    setIntent(nextIntent);
    setPropertyType(''); setLocation(''); setDetails(''); setMinPrice(''); setMaxPrice('');
    setSearchSubmitted(true);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const chooseCategory = (value: string) => {
    setPropertyType(value);
    setSearchSubmitted(true);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const startChat = (listing: Listing) => {
    sessionStorage.setItem('immosecure_pending_chat', JSON.stringify({
      listingId: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      publisher: listing.publishedBy,
    }));
    setActiveNavTab('messages');
  };

  const categories = [
    { label: 'Terrains / Parcelles', value: 'LAND' },
    { label: 'Maisons / Villas / Immeubles', value: 'HOME' },
    { label: 'Bureaux', value: 'OFFICE' },
    { label: 'Commerces', value: 'COMMERCIAL' },
    { label: 'Autres', value: 'OTHER' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mt-1">
        <div className="p-5 sm:p-7">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1e3a8a] tracking-tight leading-none">TROUVER LE BIEN IDÉAL</h1>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((item) => (
              <button key={item.value} type="button" onClick={() => chooseCategory(item.value)} className="flex items-center gap-2.5 text-left text-base sm:text-lg font-bold text-slate-700 hover:text-[#1e3a8a] rounded-xl px-1 py-1 transition-colors">
                <span className="w-5 h-5 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => { setPropertyType(''); setSearchSubmitted(false); }} className="block w-full relative aspect-[16/7] sm:aspect-[16/5] bg-slate-100 group" aria-label="Photo de présentation immobilière">
          <img src={heroImage} alt="Présentation ImmoSecureNet" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-2">
          <button type="button" onClick={() => setIntent('RENT')} className={`py-3.5 text-sm sm:text-base font-black transition-colors ${intent === 'RENT' ? 'bg-[#16a34a] text-white' : 'bg-emerald-50 text-emerald-800'}`}>À LOUER</button>
          <button type="button" onClick={() => setIntent('SALE')} className={`py-3.5 text-sm sm:text-base font-black transition-colors ${intent === 'SALE' ? 'bg-[#1e3a8a] text-white' : 'bg-blue-50 text-blue-900'}`}>À VENDRE</button>
        </div>
        <form onSubmit={handleSearch} className="p-4 sm:p-5 space-y-3">
          <div className="relative"><Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl pl-9 pr-9 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"><option value="">Type de bien</option><option value="LAND">Terrains / Parcelles</option><option value="HOME">Maisons / Villas / Immeubles</option><option value="OFFICE">Bureaux</option><option value="COMMERCIAL">Commerces</option><option value="OTHER">Autres</option></select><ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
          <div className="relative"><MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Localisation : ville, commune ou quartier" className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" /></div>
          <div className="relative"><SlidersHorizontal className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Plus de détails : chambres, piscine, parking…" className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative"><DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Prix min" className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" /></div>
            <div className="relative"><DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Prix max" className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" /></div>
          </div>
          <button type="submit" className={`w-full py-3.5 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors ${intent === 'RENT' ? 'bg-[#16a34a] hover:bg-green-700' : 'bg-[#1e3a8a] hover:bg-[#1e40af]'}`}><Search className="w-4 h-4" /> RECHERCHER LES ANNONCES {intent === 'RENT' ? 'À LOUER' : 'À VENDRE'}</button>
        </form>
      </section>

      {searchSubmitted && (
        <section ref={resultRef} className="scroll-mt-24 space-y-3">
          <div><h2 className="font-black text-base sm:text-lg text-slate-900">Résultats — {intent === 'RENT' ? 'À louer' : 'À vendre'}</h2><p className="text-xs text-slate-500">{filteredResults.length} annonce(s) correspondante(s)</p></div>
          {filteredResults.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredResults.map((listing) => (
                <div key={listing.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button type="button" onClick={() => setSelectedListing(listing)} className="w-full text-left"><img src={listing.mainPhoto} alt={listing.title} className="w-full aspect-video object-cover" /><div className="p-3"><div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white ${listing.listingType === ListingType.RENT ? 'bg-[#16a34a]' : 'bg-[#1e3a8a]'}`}>{listing.listingType === ListingType.RENT ? 'À louer' : 'À vendre'}</div><h3 className="font-black text-sm text-slate-900 mt-2 line-clamp-1">{listing.title}</h3><p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.location.neighborhood}, {listing.location.city}</p><div className="flex items-center justify-between gap-2 mt-2"><span className="font-black text-[#1e3a8a] text-sm">{formatPrice(listing.price, listing.currency)}</span><span className="flex items-center gap-2 text-[10px] text-slate-500"><span className="flex items-center gap-0.5"><BedDouble className="w-3 h-3" /> {listing.bedrooms}</span><span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" /> {listing.surface} m²</span></span></div></div></button>
                  <button type="button" onClick={() => startChat(listing)} className="w-full py-2.5 border-t border-slate-100 text-xs font-bold text-[#16a34a] hover:bg-emerald-50 flex items-center justify-center gap-1.5"><MessageCircle className="w-4 h-4" /> Discuter avec {listing.publishedBy.companyName || listing.publishedBy.name}</button>
                </div>
              ))}
            </div>
          ) : <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-sm text-slate-500">Aucun bien {intent === 'RENT' ? 'à louer' : 'à vendre'} ne correspond encore à ces critères.</div>}
        </section>
      )}

      <ListingTVStrip title="À vendre" listings={saleListings} rotationSeconds={rotationSeconds} onOpen={setSelectedListing} onChat={startChat} onSeeAll={() => showAllForIntent('SALE')} accent="blue" />
      <ListingTVStrip title="À louer" listings={rentListings} rotationSeconds={rotationSeconds} onOpen={setSelectedListing} onChat={startChat} onSeeAll={() => showAllForIntent('RENT')} accent="green" />
      <GenericTVStrip title="Marché de l’habitat" items={habitatItems} rotationSeconds={rotationSeconds} accent="green" onOpen={(item) => showToast(`${item.title} : catalogue en préparation.`, 'info')} onSeeAll={() => showToast('Le catalogue complet du Marché de l’habitat sera relié à ses produits.', 'info')} />
      <GenericTVStrip title="Expériences" items={experienceItems} rotationSeconds={rotationSeconds} accent="blue" onOpen={(item) => showToast(`${item.title} : détails en préparation.`, 'info')} onSeeAll={() => showToast('La rubrique Expériences complète sera reliée à son catalogue.', 'info')} />
    </div>
  );
};

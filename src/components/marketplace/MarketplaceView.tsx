import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BedDouble, Building2, CheckCircle2, ChevronDown, DollarSign, MapPin,
  Maximize2, MessageCircle, Play, Search, SlidersHorizontal, ShoppingCart,
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useProperties } from '../../context/PropertyContext';
import { db } from '../../firebase';
import { Listing, ListingType, PropertyType } from '../../types';

type Intent = 'RENT' | 'SALE';
type ShowcaseItem = { id: string; title: string; subtitle: string; image: string; badge?: string };

const DEFAULT_ROTATION_SECONDS = 6;
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85';

const experienceItems: ShowcaseItem[] = [
  { id: 'experience-1', title: 'Hôtels & séjours', subtitle: 'Lieux de séjour et de détente', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
  { id: 'experience-2', title: 'Restaurants', subtitle: 'Adresses et tables à découvrir', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
  { id: 'experience-3', title: 'Parcs & loisirs', subtitle: 'Sorties, détente et activités', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', badge: 'Expérience' },
];

const furnitureItems: ShowcaseItem[] = [
  { id: 'furniture-1', title: 'Maison Élégance', subtitle: 'Salons, chambres et décoration', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', badge: 'Mobiliers' },
  { id: 'furniture-2', title: 'Congo Design Mobilier', subtitle: 'Mobilier contemporain et bureaux', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80', badge: 'Mobiliers' },
];

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'XAF', maximumFractionDigits: 0,
}).format(price);

const ListingStrip: React.FC<{
  title: string;
  listings: Listing[];
  seconds: number;
  onOpen: (l: Listing) => void;
  onChat: (l: Listing) => void;
  onCart?: (l: Listing) => void;
  onSeeAll: () => void;
  accent: string;
}> = ({ title, listings, seconds, onOpen, onChat, onCart, onSeeAll, accent }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (listings.length <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % listings.length), Math.max(2500, seconds * 1000));
    return () => window.clearInterval(timer);
  }, [listings.length, seconds]);
  const item = listings[index];
  const showCart = Boolean(item && item.listingType === ListingType.SALE && onCart);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between"><h3 className="font-black text-base text-slate-900 uppercase">{title}</h3><button onClick={onSeeAll} className="text-xs font-black text-[#1e3a8a] flex items-center gap-1">VOIR TOUT <ArrowRight className="w-3.5 h-3.5" /></button></div>
      {item ? <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <button onClick={() => onOpen(item)} className="relative w-full aspect-video text-left bg-slate-900">
          <img src={item.mainPhoto} alt={item.title} className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <span className={`absolute top-3 left-3 ${accent} text-white px-2.5 py-1 rounded-full text-[10px] font-black`}>{item.listingType === ListingType.RENT ? 'À LOUER' : 'À VENDRE'}</span>
          <div className="absolute inset-0 flex items-center justify-center"><span className="w-11 h-11 rounded-full bg-white/90 text-[#1e3a8a] flex items-center justify-center"><Play className="w-5 h-5" fill="currentColor" /></span></div>
          <div className="absolute left-4 right-4 bottom-4 text-white"><div className="font-black text-lg line-clamp-1">{item.title}</div><div className="text-xs mt-1 flex justify-between gap-2"><span>{item.location.neighborhood}, {item.location.city}</span><strong>{formatPrice(item.price, item.currency)}</strong></div></div>
        </button>
        <div className={`grid ${showCart ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button onClick={() => onOpen(item)} className="py-3 text-xs font-bold text-[#1e3a8a]">Voir l’annonce</button>
          <button onClick={() => onChat(item)} className="py-3 text-xs font-bold text-[#16a34a] border-l border-slate-100 flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4" /> Discuter</button>
          {showCart && <button onClick={() => onCart?.(item)} className="py-3 text-xs font-bold text-slate-700 border-l border-slate-100 flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4" /> Panier</button>}
        </div>
      </div> : <div className="aspect-video bg-white border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-sm text-slate-500">Aucune annonce disponible</div>}
    </section>
  );
};

const GenericStrip: React.FC<{ title: string; items: ShowcaseItem[]; seconds: number; onOpen: () => void; accent: string }> = ({ title, items, seconds, onOpen, accent }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => { if (items.length <= 1) return; const timer = window.setInterval(() => setIndex((i) => (i + 1) % items.length), Math.max(2500, seconds * 1000)); return () => window.clearInterval(timer); }, [items.length, seconds]);
  const item = items[index];
  return <section className="space-y-2"><div className="flex items-center justify-between"><h3 className="font-black text-base text-slate-900 uppercase">{title}</h3><button onClick={onOpen} className="text-xs font-black text-[#1e3a8a] flex items-center gap-1">VOIR TOUT <ArrowRight className="w-3.5 h-3.5" /></button></div><button onClick={onOpen} className="relative w-full aspect-video rounded-2xl overflow-hidden text-left bg-slate-900"><img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><span className={`absolute top-3 left-3 ${accent} text-white px-2.5 py-1 rounded-full text-[10px] font-black`}>{item.badge}</span><div className="absolute left-4 right-4 bottom-4 text-white"><div className="font-black text-lg">{item.title}</div><div className="text-xs mt-1 text-white/90">{item.subtitle}</div></div></button></section>;
};

export const MarketplaceView: React.FC = () => {
  const { listings, setSelectedListing, setActiveNavTab, showToast } = useProperties();
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

  useEffect(() => onSnapshot(doc(db, 'appSettings', 'homepage'), (snap) => { const v = Number(snap.data()?.rotationSeconds); if (Number.isFinite(v) && v >= 2 && v <= 60) setRotationSeconds(v); }), []);
  useEffect(() => onSnapshot(doc(db, 'appSettings', 'branding'), (snap) => setHeroImage(String(snap.data()?.homeCoverDataUrl || '') || DEFAULT_HERO_IMAGE)), []);

  const sortedListings = useMemo(() => [...listings].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()), [listings]);
  const saleListings = useMemo(() => sortedListings.filter((l) => l.listingType === ListingType.SALE), [sortedListings]);
  const rentListings = useMemo(() => sortedListings.filter((l) => l.listingType === ListingType.RENT), [sortedListings]);

  const filteredResults = useMemo(() => sortedListings.filter((listing) => {
    if (listing.listingType !== (intent === 'RENT' ? ListingType.RENT : ListingType.SALE)) return false;
    const accepted: Record<string, PropertyType[]> = { LAND: [PropertyType.LAND], HOME: [PropertyType.HOUSE, PropertyType.VILLA, PropertyType.BUILDING, PropertyType.APARTMENT], OFFICE: [PropertyType.COMMERCIAL], COMMERCIAL: [PropertyType.COMMERCIAL] };
    if (propertyType && propertyType !== 'OTHER' && !accepted[propertyType]?.includes(listing.propertyType)) return false;
    const loc = `${listing.location.address} ${listing.location.city} ${listing.location.neighborhood} ${listing.location.country}`.toLowerCase();
    if (location.trim() && !loc.includes(location.toLowerCase())) return false;
    const det = `${listing.features.join(' ')} ${listing.bedrooms} chambres ${listing.shortDescription}`.toLowerCase();
    if (details.trim() && !det.includes(details.toLowerCase())) return false;
    if (minPrice && listing.price < Number(minPrice)) return false;
    if (maxPrice && listing.price > Number(maxPrice)) return false;
    return true;
  }), [sortedListings, intent, propertyType, location, details, minPrice, maxPrice]);

  const search = (e: React.FormEvent) => { e.preventDefault(); setSearchSubmitted(true); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); };
  const chooseCategory = (value: string) => { if (value === 'FURNITURE') { setActiveNavTab('furniture_marketplace'); return; } setPropertyType(value); setSearchSubmitted(false); document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth' }); };
  const chat = (listing: Listing) => { sessionStorage.setItem('immosecure_pending_contact', JSON.stringify({ type: 'LISTING', listingId: listing.id, publisherId: listing.publishedBy.id, publisherName: listing.publishedBy.name, listingTitle: listing.title })); setActiveNavTab('messages'); };
  const seeAll = (nextIntent: Intent) => { setIntent(nextIntent); setSearchSubmitted(true); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); };
  const addToCart = (listing: Listing) => {
    const key = 'immosecure_cart';
    const current = JSON.parse(localStorage.getItem(key) || '[]') as Array<{ id: string; title: string; price: number; currency: string; image: string }>;
    if (!current.some((item) => item.id === listing.id)) {
      current.push({ id: listing.id, title: listing.title, price: listing.price, currency: listing.currency, image: listing.mainPhoto });
      localStorage.setItem(key, JSON.stringify(current));
      showToast('Annonce ajoutée à Mon panier.', 'success');
    } else {
      showToast('Cette annonce est déjà dans Mon panier.', 'info');
    }
  };

  const categories = [
    ['LAND', 'Terrains / Parcelles'],
    ['HOME', 'Maisons / Villas / Immeubles'],
    ['OFFICE', 'Bureaux'],
    ['COMMERCIAL', 'Commerces'],
    ['FURNITURE', 'Mobiliers'],
    ['OTHER', 'Autres'],
  ];

  return <div className="space-y-5 pb-24 max-w-4xl mx-auto">
    <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1e3a8a] tracking-tight leading-tight">TROUVER LE BIEN IDÉAL</h1>
        <div className="mt-3 space-y-0.5">
          {categories.map(([value, label]) => (
            <button
              key={value}
              onClick={() => chooseCategory(value)}
              className="w-full flex items-center gap-2.5 py-1.5 text-left font-bold text-slate-700 hover:text-[#1e3a8a] min-h-9"
            >
              <span className="w-[18px] h-[18px] rounded-full bg-[#16a34a] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3 h-3 text-white" /></span>
              <span className="text-[15px] sm:text-base leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth' })} className="block w-full"><img src={heroImage} alt="Présentation ImmoSecureNet" className="w-full aspect-[16/8] object-cover" /></button>
    </section>

    <section id="home-search" className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm scroll-mt-24">
      <div className="grid grid-cols-2"><button onClick={() => setIntent('RENT')} className={`py-4 font-black ${intent === 'RENT' ? 'bg-[#16a34a] text-white' : 'bg-emerald-50 text-emerald-800'}`}>À LOUER</button><button onClick={() => setIntent('SALE')} className={`py-4 font-black ${intent === 'SALE' ? 'bg-[#1e3a8a] text-white' : 'bg-blue-50 text-blue-900'}`}>À VENDRE</button></div>
      <form onSubmit={search} className="p-4 space-y-3">
        <div className="relative"><Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-9 pr-9 py-3 text-sm bg-white appearance-none"><option value="">Type de bien</option><option value="LAND">Terrains / Parcelles</option><option value="HOME">Maisons / Villas / Immeubles</option><option value="OFFICE">Bureaux</option><option value="COMMERCIAL">Commerces</option><option value="OTHER">Autres</option></select><ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>
        <div className="relative"><MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Localisation" className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-3 text-sm" /></div>
        <div className="relative"><SlidersHorizontal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Plus de détails" className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-3 text-sm" /></div>
        <div className="grid grid-cols-2 gap-3"><div className="relative"><DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Prix min" className="w-full border border-slate-300 rounded-xl pl-9 pr-2 py-3 text-sm" /></div><div className="relative"><DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Prix max" className="w-full border border-slate-300 rounded-xl pl-9 pr-2 py-3 text-sm" /></div></div>
        <button className={`w-full py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 ${intent === 'RENT' ? 'bg-[#16a34a]' : 'bg-[#1e3a8a]'}`}><Search className="w-4 h-4" /> RECHERCHER</button>
      </form>
    </section>

    {searchSubmitted && <section ref={resultRef} className="space-y-3 scroll-mt-24"><div><h2 className="font-black text-lg">Résultats — {intent === 'RENT' ? 'À louer' : 'À vendre'}</h2><p className="text-xs text-slate-500">{filteredResults.length} annonce(s)</p></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{filteredResults.map((listing) => <article key={listing.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><button onClick={() => setSelectedListing(listing)} className="w-full text-left"><img src={listing.mainPhoto} alt={listing.title} className="w-full aspect-video object-cover" /><div className="p-3"><h3 className="font-black text-sm">{listing.title}</h3><div className="mt-2 flex justify-between text-xs"><span>{listing.location.neighborhood}, {listing.location.city}</span><strong className="text-[#1e3a8a]">{formatPrice(listing.price, listing.currency)}</strong></div><div className="mt-2 flex gap-3 text-[10px] text-slate-500"><span className="flex gap-1"><BedDouble className="w-3 h-3" />{listing.bedrooms}</span><span className="flex gap-1"><Maximize2 className="w-3 h-3" />{listing.surface} m²</span></div></div></button><div className={`grid ${listing.listingType === ListingType.SALE ? 'grid-cols-2' : 'grid-cols-1'} border-t border-slate-100`}><button onClick={() => chat(listing)} className="py-3 text-[#16a34a] font-bold text-xs flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4" /> Discuter</button>{listing.listingType === ListingType.SALE && <button onClick={() => addToCart(listing)} className="py-3 text-slate-700 font-bold text-xs border-l border-slate-100 flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4" /> Panier</button>}</div></article>)}</div></section>}

    <ListingStrip title="À vendre" listings={saleListings} seconds={rotationSeconds} onOpen={setSelectedListing} onChat={chat} onCart={addToCart} onSeeAll={() => seeAll('SALE')} accent="bg-[#1e3a8a]" />
    <ListingStrip title="À louer" listings={rentListings} seconds={rotationSeconds} onOpen={setSelectedListing} onChat={chat} onSeeAll={() => seeAll('RENT')} accent="bg-[#16a34a]" />
    <GenericStrip title="Expériences" items={experienceItems} seconds={rotationSeconds} onOpen={() => showToast('La rubrique Expériences sera reliée à son catalogue complet.', 'info')} accent="bg-[#1e3a8a]" />
    <GenericStrip title="Mobiliers" items={furnitureItems} seconds={rotationSeconds} onOpen={() => setActiveNavTab('furniture_marketplace')} accent="bg-[#16a34a]" />
  </div>;
};

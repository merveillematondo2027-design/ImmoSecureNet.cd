import React, { useMemo } from 'react';
import { ArrowLeft, BedDouble, Building2, MapPin, Maximize2, MessageCircle, ShoppingCart } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { Listing, ListingType, PropertyType } from '../../types';

const categoryConfig: Record<string, { title: string; description: string; matches: (listing: Listing) => boolean }> = {
  LAND: { title: 'Terrains / Parcelles', description: 'Découvrez les terrains et parcelles disponibles à la vente ou à la location.', matches: (l) => l.propertyType === PropertyType.LAND },
  APARTMENT: { title: 'Appartements', description: 'Appartements standards, meublés, studios et résidences.', matches: (l) => l.propertyType === PropertyType.APARTMENT },
  HOME: { title: 'Maisons / Villas / Immeubles', description: 'Maisons, villas, résidences et immeubles disponibles.', matches: (l) => [PropertyType.HOUSE, PropertyType.VILLA, PropertyType.BUILDING].includes(l.propertyType) },
  OFFICE: { title: 'Bureaux', description: 'Bureaux et espaces professionnels pour vos activités.', matches: (l) => l.propertyType === PropertyType.COMMERCIAL && /bureau|office/i.test(`${l.title} ${l.shortDescription}`) },
  COMMERCE: { title: 'Commerces', description: 'Locaux commerciaux, maisons commerciales et espaces d’activité.', matches: (l) => l.propertyType === PropertyType.COMMERCIAL },
  OTHER: { title: 'Autres biens', description: 'Autres opportunités immobilières publiées sur ImmoSecureNet.', matches: () => true },
};

const price = (listing: Listing) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: listing.currency === 'USD' ? 'USD' : 'USD', maximumFractionDigits: 0 }).format(listing.price);

export const CategoryBrowseView: React.FC = () => {
  const { listings, setSelectedListing, setActiveNavTab, addToCart } = useProperties();
  const key = sessionStorage.getItem('immosecure_property_category') || 'OTHER';
  const config = categoryConfig[key] || categoryConfig.OTHER;
  const filtered = useMemo(() => listings.filter(config.matches), [listings, key]);
  const chat = (listing: Listing) => {
    sessionStorage.setItem('immosecure_pending_contact', JSON.stringify({ type: 'LISTING', listingId: listing.id, publisherId: listing.publishedBy.id, publisherName: listing.publishedBy.name, listingTitle: listing.title, price: listing.price }));
    setActiveNavTab('messages');
  };

  return <div className="max-w-5xl mx-auto pb-24 space-y-5">
    <button onClick={() => setActiveNavTab('marketplace')} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour à l’accueil</button>
    <section className="rounded-3xl bg-gradient-to-r from-[#1e3a8a] to-blue-600 text-white p-6 sm:p-8 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center"><Building2 className="w-6 h-6"/></div>
      <h1 className="text-2xl sm:text-3xl font-black mt-4">{config.title}</h1>
      <p className="text-sm text-blue-100 mt-2 max-w-2xl">{config.description}</p>
      <div className="mt-5 flex gap-2"><span className="px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold">{filtered.length} annonce(s)</span><button onClick={() => setActiveNavTab('marketplace')} className="px-3 py-1.5 rounded-full bg-white text-[#1e3a8a] text-xs font-black">Recherche avancée</button></div>
    </section>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((listing) => <article key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button onClick={() => setSelectedListing(listing)} className="block w-full text-left"><img src={listing.mainPhoto} alt={listing.title} className="w-full aspect-[4/3] object-cover"/><div className="p-4"><div className="flex items-center justify-between gap-3"><span className={`text-[10px] px-2 py-1 rounded-full font-black ${listing.listingType === ListingType.RENT ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{listing.listingType === ListingType.RENT ? 'À LOUER' : 'À VENDRE'}</span><strong className="text-[#1e3a8a] text-sm">{price(listing)}</strong></div><h2 className="font-black mt-2 line-clamp-2">{listing.title}</h2><p className="text-xs text-slate-500 mt-2 flex gap-1"><MapPin className="w-3.5 h-3.5"/>{listing.location.neighborhood}, {listing.location.city}</p><div className="flex gap-4 mt-3 text-xs text-slate-500"><span className="flex gap-1"><BedDouble className="w-3.5 h-3.5"/>{listing.bedrooms} ch.</span><span className="flex gap-1"><Maximize2 className="w-3.5 h-3.5"/>{listing.surface} m²</span></div></div></button>
        <div className={`grid ${listing.listingType === ListingType.SALE ? 'grid-cols-2' : 'grid-cols-1'} border-t border-slate-100`}><button onClick={() => chat(listing)} className="py-3 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4"/>Discuter</button>{listing.listingType === ListingType.SALE && <button onClick={() => void addToCart(listing)} className="py-3 text-xs font-bold text-[#1e3a8a] border-l flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4"/>Panier</button>}</div>
      </article>)}
      {!filtered.length && <div className="sm:col-span-2 lg:col-span-3 bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-500">Aucune annonce n’est encore disponible dans cette rubrique.</div>}
    </div>
  </div>;
};

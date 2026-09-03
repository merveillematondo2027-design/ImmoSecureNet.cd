import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Home, Search, ShoppingBag, Store, BriefcaseBusiness, Info, MapPin } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useProperties } from '../../context/PropertyContext';
import { Listing } from '../../types';
import { provinces, cities, communes, neighborhoods, rentalPropertyTypes, salePropertyTypes } from '../../data/propertyCatalog';

type SearchResult = {
  id: string;
  type: 'property' | 'product' | 'shop' | 'service' | 'location' | 'section' | 'category';
  title: string;
  subtitle?: string;
  keywords: string;
  payload?: any;
};

const services = [
  'Enregistrement des contrats de vente et des contrats de bail',
  'Vérification et authentification des agents et agences immobilières',
  'Mise en relation pour la vente, l’achat ou la location',
  'Études immobilières, architecture, ingénierie et construction',
  'Financement immobilier',
  'Assurance immobilière et autres',
  'Publicité immobilière',
  'Audits, conseil juridique et accompagnement administratif',
];

const normalize = (value: unknown) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const iconFor = (type: SearchResult['type']) => {
  if (type === 'property') return Building2;
  if (type === 'product') return ShoppingBag;
  if (type === 'shop') return Store;
  if (type === 'service') return BriefcaseBusiness;
  if (type === 'location') return MapPin;
  if (type === 'section') return Home;
  return Info;
};

export const GlobalSearchView: React.FC = () => {
  const { listings, setSelectedListing, setActiveNavTab } = useProperties();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [term, setTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'shopProducts'), where('active', '==', true)),
      (snapshot) => setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      () => setProducts([]));
    const unsubShops = onSnapshot(collection(db, 'shops'),
      (snapshot) => setShops(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((shop: any) => shop.active !== false)),
      () => setShops([]));
    return () => { unsubProducts(); unsubShops(); };
  }, []);

  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    listings.forEach((listing: Listing) => {
      results.push({
        id: `property:${listing.id}`,
        type: 'property',
        title: listing.title,
        subtitle: `${listing.location?.neighborhood || ''} ${listing.location?.city || ''}`.trim(),
        keywords: normalize([
          listing.title,
          listing.shortDescription,
          listing.fullDescription,
          listing.location?.address,
          listing.location?.neighborhood,
          listing.location?.city,
          listing.publishedBy?.name,
          listing.publishedBy?.companyName,
          ...(listing.features || []),
        ].filter(Boolean).join(' ')),
        payload: listing,
      });
    });

    products.forEach((product) => results.push({
      id: `product:${product.id}`,
      type: 'product',
      title: product.title || 'Produit I-SHOP',
      subtitle: [product.category, product.shopName].filter(Boolean).join(' • '),
      keywords: normalize([product.title, product.description, product.category, product.shopName].join(' ')),
      payload: product,
    }));

    shops.forEach((shop) => results.push({
      id: `shop:${shop.id}`,
      type: 'shop',
      title: shop.name || 'Boutique I-SHOP',
      subtitle: shop.description || shop.address || 'Boutique I-SHOP',
      keywords: normalize([shop.name, shop.description, shop.address].join(' ')),
      payload: shop,
    }));

    services.forEach((service, index) => results.push({
      id: `service:${index}`,
      type: 'service',
      title: service,
      subtitle: 'Service ImmoSecureNet',
      keywords: normalize(service),
      payload: { index },
    }));

    const categoryRows = [...rentalPropertyTypes, ...salePropertyTypes]
      .flatMap((group) => group.items)
      .filter((row, index, array) => array.findIndex((item) => item[0] === row[0]) === index);
    categoryRows.forEach(([value, label]) => results.push({
      id: `category:${value}`,
      type: 'category',
      title: label,
      subtitle: 'Type de bien',
      keywords: normalize(`${label} ${value}`),
      payload: { value },
    }));

    provinces.forEach((item) => results.push({ id: `province:${item.id}`, type: 'location', title: item.name, subtitle: 'Province', keywords: normalize(item.name), payload: item }));
    cities.forEach((item) => results.push({ id: `city:${item.id}`, type: 'location', title: item.name, subtitle: 'Ville', keywords: normalize(`${item.name} ${item.provinceId}`), payload: item }));
    communes.forEach((item) => results.push({ id: `commune:${item.id}`, type: 'location', title: item.name, subtitle: 'Commune', keywords: normalize(`${item.name} ${item.cityId} ${item.provinceId}`), payload: item }));
    neighborhoods.forEach((item) => results.push({ id: `neighborhood:${item.id}`, type: 'location', title: item.name, subtitle: 'Quartier', keywords: normalize(`${item.name} ${(item.searchKeywords || []).join(' ')} ${item.communeId}`), payload: item }));

    [
      ['Accueil', 'Page d’accueil de la plateforme', 'marketplace'],
      ['I-SHOP', 'Produits, boutiques et équipements', 'furniture_marketplace'],
      ['Nos services', 'Services immobiliers et professionnels', 'services'],
      ['Mes comptes', 'Profil et compte utilisateur', 'accounts'],
      ['Messages', 'Messagerie de la plateforme', 'messages'],
      ['À propos de nous', 'Informations sur ImmoSecureNet', 'about'],
      ['Contactez-nous', 'Coordonnées et assistance', 'contact'],
    ].forEach(([title, subtitle, tab]) => results.push({ id: `section:${tab}`, type: 'section', title, subtitle, keywords: normalize(`${title} ${subtitle}`), payload: { tab } }));

    return results;
  }, [listings, products, shops]);

  const visibleResults = useMemo(() => {
    const q = normalize(term);
    if (!q) return [];
    const words = q.split(' ').filter(Boolean);
    return allResults
      .map((item) => ({ item, score: words.reduce((score, word) => score + (normalize(item.title).includes(word) ? 4 : item.keywords.includes(word) ? 1 : -10), 0) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)
      .map(({ item }) => item);
  }, [term, allResults]);

  const openResult = (result: SearchResult) => {
    if (result.type === 'property') {
      setSelectedListing(result.payload as Listing);
      return;
    }
    if (result.type === 'product' || result.type === 'shop') {
      sessionStorage.setItem('immosecure_ishop_search', result.title);
      setActiveNavTab('furniture_marketplace');
      return;
    }
    if (result.type === 'service') {
      sessionStorage.setItem('immosecure_service_index', String(result.payload?.index ?? 0));
      setActiveNavTab('service_module');
      return;
    }
    if (result.type === 'section') {
      setActiveNavTab(result.payload.tab);
      return;
    }
    if (result.type === 'category') {
      sessionStorage.setItem('immosecure_global_property_type', result.payload.value);
      setActiveNavTab('marketplace');
      return;
    }
    if (result.type === 'location') {
      sessionStorage.setItem('immosecure_global_location', JSON.stringify(result.payload));
      setActiveNavTab('marketplace');
    }
  };

  return <div className="max-w-4xl mx-auto pb-24 space-y-4">
    <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm sticky top-2 z-20">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center shrink-0"><Search className="w-5 h-5"/></div>
        <div className="min-w-0"><h1 className="font-black text-xl text-slate-900">Recherche générale</h1><p className="text-xs text-slate-500">Recherchez librement dans toute la plateforme.</p></div>
      </div>
      <div className="relative mt-4">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input ref={inputRef} value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Tapez un nom, mot, lieu, produit, boutique, service..." className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-base outline-none focus:border-[#1e3a8a] focus:bg-white" autoComplete="off" inputMode="search" />
      </div>
    </section>

    {!term.trim() ? <section className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center"><Search className="w-10 h-10 text-slate-300 mx-auto"/><h2 className="font-black mt-3">Écrivez ce que vous cherchez</h2><p className="text-sm text-slate-500 mt-1">Exemples : Gombe, appartement, ORCA, financement, plomberie, agent, villa, Kinshasa.</p></section> :
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1"><h2 className="font-black">Résultats</h2><span className="text-xs text-slate-500">{visibleResults.length} trouvé(s)</span></div>
      {visibleResults.map((result) => {
        const Icon = iconFor(result.type);
        return <button key={result.id} onClick={() => openResult(result)} className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-left hover:border-[#1e3a8a] hover:bg-blue-50/30 transition">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0"><Icon className="w-5 h-5"/></div>
          <div className="min-w-0 flex-1"><div className="font-bold text-sm text-slate-900 truncate">{result.title}</div>{result.subtitle && <div className="text-xs text-slate-500 mt-1 truncate">{result.subtitle}</div>}</div>
          <span className="text-[10px] uppercase font-black text-slate-400">{result.type}</span>
        </button>;
      })}
      {!visibleResults.length && <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center text-sm text-slate-500">Aucun résultat pour « {term} ».</div>}
    </section>}
  </div>;
};

import React, { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, ExternalLink, MessageCircle, Plus, Search, ShoppingBag, Store, Wifi } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { brandLogos } from './brandLogos';

type ShopCategory = 'MAISON' | 'CONNECTIVITE' | 'SERVICES' | 'EXPERIENCES';

type FurnitureProduct = {
  id: string;
  name: string;
  price?: number;
  image: string;
};

type FurnitureShop = {
  id: string;
  name: string;
  city: string;
  description: string;
  category: ShopCategory;
  logo?: string;
  verified: boolean;
  externalUrl?: string;
  products: FurnitureProduct[];
};

const PRODUCT_IMAGES = {
  salon: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  appliance: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  wifi: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
  service: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
};

const DEMO_PRODUCTS = (prefix: string, category: ShopCategory): FurnitureProduct[] => {
  if (category === 'CONNECTIVITE') {
    return [{ id: `${prefix}-wifi`, name: 'Équipements & offres de connectivité', image: PRODUCT_IMAGES.wifi }];
  }
  if (category === 'EXPERIENCES') {
    return [{ id: `${prefix}-experience`, name: 'Services, séjours et expériences', image: PRODUCT_IMAGES.hotel }];
  }
  if (category === 'SERVICES') {
    return [{ id: `${prefix}-service`, name: 'Services partenaires pour l’habitat', image: PRODUCT_IMAGES.service }];
  }
  return [
    { id: `${prefix}-home`, name: 'Mobilier & équipements pour la maison', image: PRODUCT_IMAGES.salon },
    { id: `${prefix}-equip`, name: 'Catalogue habitat', image: PRODUCT_IMAGES.appliance },
  ];
};

const SHOPS: FurnitureShop[] = [
  { id: 'els', name: 'ELS', city: 'RDC', description: 'Boutique partenaire — catalogue maison à compléter.', category: 'MAISON', logo: brandLogos.els, verified: true, products: DEMO_PRODUCTS('els', 'MAISON') },
  { id: 'complast', name: 'Complast', city: 'RDC', description: 'Boutique partenaire — catalogue maison à compléter.', category: 'MAISON', logo: brandLogos.complast, verified: true, products: DEMO_PRODUCTS('complast', 'MAISON') },
  { id: 'fouani', name: 'Fouani Group', city: 'RDC', description: 'Équipements et solutions pour la maison.', category: 'MAISON', logo: brandLogos.fouani, verified: true, products: DEMO_PRODUCTS('fouani', 'MAISON') },
  { id: 'fournitures-plus', name: 'Fournitures et Plus', city: 'Kinshasa, RDC', description: 'Mobilier, fournitures et équipements pour la maison et le bureau.', category: 'MAISON', logo: brandLogos['fournitures-plus'], verified: true, externalUrl: 'https://www.facebook.com/FournituresEtPlusKIN', products: DEMO_PRODUCTS('fournitures-plus', 'MAISON') },
  { id: 'congo-electro', name: 'Congo Electro', city: 'RDC', description: 'Équipements électriques et solutions pour l’habitat.', category: 'MAISON', logo: brandLogos['congo-electro'], verified: true, externalUrl: 'https://www.facebook.com/CONGOELECTRO', products: DEMO_PRODUCTS('congo-electro', 'MAISON') },
  { id: 'uac', name: 'UAC', city: 'RDC', description: 'Boutique partenaire — catalogue habitat à compléter.', category: 'MAISON', logo: brandLogos.uac, verified: true, products: DEMO_PRODUCTS('uac', 'MAISON') },
  { id: 'orca', name: 'ORCA Kinshasa', city: 'Kinshasa, RDC', description: 'Mobilier, décoration et équipements pour la maison.', category: 'MAISON', logo: brandLogos.orca, verified: true, externalUrl: 'https://www.facebook.com/OrcaKinshasa', products: DEMO_PRODUCTS('orca', 'MAISON') },
  { id: 'cimenterie-lukala', name: 'Cimenterie de Lukala', city: 'RDC', description: 'Matériaux et solutions pour la construction et l’habitat.', category: 'MAISON', verified: true, externalUrl: 'https://www.facebook.com/CimenteriedeLUKALA', products: DEMO_PRODUCTS('cimenterie-lukala', 'MAISON') },
  { id: 'devhome-drc', name: 'DevHome DRC', city: 'RDC', description: 'Partenaire habitat et immobilier.', category: 'MAISON', verified: true, externalUrl: 'https://www.facebook.com/devhomedrc', products: DEMO_PRODUCTS('devhome-drc', 'MAISON') },
  { id: 'starlink', name: 'Starlink', city: 'RDC', description: 'Solutions de connectivité pour la maison.', category: 'CONNECTIVITE', logo: brandLogos.starlink, verified: true, products: DEMO_PRODUCTS('starlink', 'CONNECTIVITE') },
  { id: 'vodacom', name: 'Vodacom', city: 'RDC', description: 'Solutions internet et connectivité pour l’habitat.', category: 'CONNECTIVITE', logo: brandLogos.vodacom, verified: true, products: DEMO_PRODUCTS('vodacom', 'CONNECTIVITE') },
  { id: 'airtel', name: 'Airtel Xstream AirFiber', city: 'RDC', description: 'Solutions internet et connectivité pour la maison.', category: 'CONNECTIVITE', logo: brandLogos.airtel, verified: true, products: DEMO_PRODUCTS('airtel', 'CONNECTIVITE') },
  { id: 'wifi', name: 'Wi‑Fi & Routeurs', city: 'RDC', description: 'Équipements Wi‑Fi, routeurs et accessoires de connectivité.', category: 'CONNECTIVITE', logo: brandLogos.wifi, verified: false, products: DEMO_PRODUCTS('wifi', 'CONNECTIVITE') },
  { id: 'canalplus-rdc', name: 'CANAL+ RDC', city: 'RDC', description: 'Télévision, divertissement et services pour la maison.', category: 'SERVICES', verified: true, externalUrl: 'https://www.facebook.com/canalplusrdc', products: DEMO_PRODUCTS('canalplus-rdc', 'SERVICES') },
  { id: 'fch-blazon', name: 'FCH by Blazon Hotels', city: 'RDC', description: 'Hébergement et expérience partenaire.', category: 'EXPERIENCES', verified: true, externalUrl: 'https://www.facebook.com/FCHbyBlazonHotels', products: DEMO_PRODUCTS('fch-blazon', 'EXPERIENCES') },
  { id: 'hilton-kinshasa', name: 'Hilton Kinshasa', city: 'Kinshasa, RDC', description: 'Hôtel et expérience partenaire à Kinshasa.', category: 'EXPERIENCES', verified: true, externalUrl: 'https://www.facebook.com/HiltonKinshasa', products: DEMO_PRODUCTS('hilton-kinshasa', 'EXPERIENCES') },
  { id: 'air-congo', name: 'Air Congo', city: 'RDC', description: 'Transport aérien et expérience de voyage.', category: 'EXPERIENCES', verified: true, externalUrl: 'https://www.air-congo.com/en/home', products: DEMO_PRODUCTS('air-congo', 'EXPERIENCES') },
  { id: 'partenaire-61575234555121', name: 'Partenaire ImmoSecureNet', city: 'RDC', description: 'Page partenaire à identifier et compléter.', category: 'SERVICES', verified: false, externalUrl: 'https://www.facebook.com/profile.php?id=61575234555121', products: DEMO_PRODUCTS('partenaire-61575234555121', 'SERVICES') },
];

const categoryLabel = (category: ShopCategory) => {
  if (category === 'CONNECTIVITE') return 'CONNECTIVITÉ';
  if (category === 'SERVICES') return 'SERVICES';
  if (category === 'EXPERIENCES') return 'EXPÉRIENCES';
  return 'MAISON';
};

export const FurnitureMarketplaceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { setActiveNavTab, showToast } = useProperties();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'TOUS' | ShopCategory>('TOUS');
  const [selectedShop, setSelectedShop] = useState<FurnitureShop | null>(null);

  const shops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHOPS.filter((shop) => {
      const categoryMatch = category === 'TOUS' || shop.category === category;
      const queryMatch = !q || `${shop.name} ${shop.city} ${shop.description}`.toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [query, category]);

  const openExternal = (shop: FurnitureShop) => {
    if (!shop.externalUrl) {
      setSelectedShop(shop);
      return;
    }
    window.open(shop.externalUrl, '_blank', 'noopener,noreferrer');
  };

  const startChat = (shop: FurnitureShop, product?: FurnitureProduct) => {
    sessionStorage.setItem('immosecure_pending_contact', JSON.stringify({
      type: 'FURNITURE_SHOP',
      shopId: shop.id,
      shopName: shop.name,
      productId: product?.id,
      productName: product?.name,
    }));
    setActiveNavTab('messages');
  };

  const createShop = () => {
    if (!currentUser) {
      showToast('Connectez-vous ou créez un compte pour ouvrir votre magasin.', 'info');
      setActiveNavTab('menu');
      return;
    }
    showToast('Votre espace magasin sera lié à votre profil vendeur.', 'success');
  };

  const Logo = ({ shop, large = false }: { shop: FurnitureShop; large?: boolean }) => (
    shop.logo ? (
      <img src={shop.logo} alt={`Logo ${shop.name}`} className={`${large ? 'max-w-[75%] max-h-24' : 'max-w-full max-h-full'} object-contain`} />
    ) : (
      <div className={`${large ? 'w-24 h-24 text-3xl' : 'w-16 h-16 text-xl'} rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center font-black`}>
        {shop.name.split(' ').slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase()}
      </div>
    )
  );

  if (selectedShop) {
    return (
      <div className="pb-24 max-w-3xl mx-auto space-y-4">
        <button onClick={() => setSelectedShop(null)} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]">
          <ArrowLeft className="w-4 h-4" /> Retour aux partenaires
        </button>

        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <button type="button" onClick={() => openExternal(selectedShop)} className="w-full h-36 sm:h-44 bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center p-5 border-b border-slate-100 relative">
            <Logo shop={selectedShop} large />
            {selectedShop.externalUrl && <span className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-[#1e3a8a]"><ExternalLink className="w-4 h-4" /></span>}
          </button>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-xl text-slate-900 truncate">{selectedShop.name}</h1>
                  {selectedShop.verified && <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedShop.city}</p>
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-600">{categoryLabel(selectedShop.category)}</span>
            </div>
            <p className="text-sm text-slate-600 mt-3">{selectedShop.description}</p>
            <div className={`grid ${selectedShop.externalUrl ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-4`}>
              <button onClick={() => startChat(selectedShop)} className="py-3 rounded-xl bg-[#16a34a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Discuter
              </button>
              <button onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })} className="py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Catalogue
              </button>
              {selectedShop.externalUrl && <button onClick={() => openExternal(selectedShop)} className="py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" /> Page</button>}
            </div>
          </div>
        </section>

        <section id="shop-catalog" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg text-slate-900">Catalogue</h2>
            <span className="text-[10px] text-slate-500">Démonstration</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {selectedShop.products.map((product) => (
              <article key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{product.name}</h3>
                  {typeof product.price === 'number' && <div className="font-black text-[#1e3a8a] mt-1">${product.price}</div>}
                  <button onClick={() => startChat(selectedShop, product)} className="w-full mt-2 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" /> Discuter
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto space-y-4">
      <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[#1e3a8a]">
          <Store className="w-6 h-6" />
          <h1 className="text-2xl font-black">Mobiliers</h1>
        </div>
        <p className="text-sm text-slate-500 mt-2">Touchez un logo pour ouvrir la page officielle lorsqu’elle est disponible. Touchez le nom du partenaire pour entrer dans sa page ImmoSecureNet, son catalogue et discuter.</p>
        <button onClick={createShop} className="w-full mt-4 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Créer mon magasin
        </button>
      </section>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un partenaire..." className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => setCategory('TOUS')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${category === 'TOUS' ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-slate-600 border-slate-200'}`}>Tous</button>
        <button onClick={() => setCategory('MAISON')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${category === 'MAISON' ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white text-slate-600 border-slate-200'}`}>Maison & équipements</button>
        <button onClick={() => setCategory('CONNECTIVITE')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 ${category === 'CONNECTIVITE' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}><Wifi className="w-3.5 h-3.5" /> Connectivité</button>
        <button onClick={() => setCategory('SERVICES')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${category === 'SERVICES' ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-slate-600 border-slate-200'}`}>Services</button>
        <button onClick={() => setCategory('EXPERIENCES')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${category === 'EXPERIENCES' ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white text-slate-600 border-slate-200'}`}>Expériences</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shops.map((shop) => (
          <article key={shop.id} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm min-w-0">
            <button type="button" onClick={() => openExternal(shop)} className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 overflow-hidden relative">
              <Logo shop={shop} />
              {shop.externalUrl && <span className="absolute right-2 top-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[#1e3a8a]"><ExternalLink className="w-3.5 h-3.5" /></span>}
            </button>
            <button type="button" onClick={() => setSelectedShop(shop)} className="w-full text-left mt-2">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-black text-xs text-slate-900 truncate">{shop.name}</span>
                {shop.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <span className="text-[10px] text-slate-500">Voir la page ImmoSecureNet</span>
            </button>
          </article>
        ))}
      </div>

      {shops.length === 0 && <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Aucun partenaire ne correspond à votre recherche.</div>}
    </div>
  );
};

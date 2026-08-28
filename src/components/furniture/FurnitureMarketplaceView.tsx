import React, { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, MessageCircle, Plus, Search, ShoppingBag, Store, Wifi } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { brandLogos } from './brandLogos';

type ShopCategory = 'MAISON' | 'CONNECTIVITE';

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
  logo: string;
  verified: boolean;
  products: FurnitureProduct[];
};

const PRODUCT_IMAGES = {
  salon: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  table: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80',
  appliance: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  office: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=900&q=80',
  wifi: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
};

const DEMO_PRODUCTS = (prefix: string, category: ShopCategory): FurnitureProduct[] =>
  category === 'CONNECTIVITE'
    ? [
        { id: `${prefix}-wifi`, name: 'Équipements & offres de connectivité', image: PRODUCT_IMAGES.wifi },
      ]
    : [
        { id: `${prefix}-home`, name: 'Mobilier & équipements pour la maison', image: PRODUCT_IMAGES.salon },
        { id: `${prefix}-equip`, name: 'Catalogue habitat', image: PRODUCT_IMAGES.appliance },
      ];

const SHOPS: FurnitureShop[] = [
  { id: 'els', name: 'ELS', city: 'RDC', description: 'Boutique partenaire — catalogue maison à compléter.', category: 'MAISON', logo: brandLogos.els, verified: true, products: DEMO_PRODUCTS('els', 'MAISON') },
  { id: 'complast', name: 'Complast', city: 'RDC', description: 'Boutique partenaire — catalogue maison à compléter.', category: 'MAISON', logo: brandLogos.complast, verified: true, products: DEMO_PRODUCTS('complast', 'MAISON') },
  { id: 'fouani', name: 'Fouani Group', city: 'RDC', description: 'Équipements et solutions pour la maison.', category: 'MAISON', logo: brandLogos.fouani, verified: true, products: DEMO_PRODUCTS('fouani', 'MAISON') },
  { id: 'fournitures-plus', name: 'Fournitures et Plus', city: 'RDC', description: 'Mobilier, fournitures et équipements pour la maison et le bureau.', category: 'MAISON', logo: brandLogos['fournitures-plus'], verified: true, products: DEMO_PRODUCTS('fournitures-plus', 'MAISON') },
  { id: 'congo-electro', name: 'Congo Electro', city: 'RDC', description: 'Équipements électriques et solutions pour l’habitat.', category: 'MAISON', logo: brandLogos['congo-electro'], verified: true, products: DEMO_PRODUCTS('congo-electro', 'MAISON') },
  { id: 'uac', name: 'UAC', city: 'RDC', description: 'Boutique partenaire — catalogue habitat à compléter.', category: 'MAISON', logo: brandLogos.uac, verified: true, products: DEMO_PRODUCTS('uac', 'MAISON') },
  { id: 'orca', name: 'ORCA', city: 'RDC', description: 'Mobilier, décoration et équipements pour la maison.', category: 'MAISON', logo: brandLogos.orca, verified: true, products: DEMO_PRODUCTS('orca', 'MAISON') },
  { id: 'starlink', name: 'Starlink', city: 'RDC', description: 'Solutions de connectivité pour la maison.', category: 'CONNECTIVITE', logo: brandLogos.starlink, verified: true, products: DEMO_PRODUCTS('starlink', 'CONNECTIVITE') },
  { id: 'vodacom', name: 'Vodacom', city: 'RDC', description: 'Solutions internet et connectivité pour l’habitat.', category: 'CONNECTIVITE', logo: brandLogos.vodacom, verified: true, products: DEMO_PRODUCTS('vodacom', 'CONNECTIVITE') },
  { id: 'airtel', name: 'Airtel Xstream AirFiber', city: 'RDC', description: 'Solutions internet et connectivité pour la maison.', category: 'CONNECTIVITE', logo: brandLogos.airtel, verified: true, products: DEMO_PRODUCTS('airtel', 'CONNECTIVITE') },
  { id: 'wifi', name: 'Wi‑Fi & Routeurs', city: 'RDC', description: 'Équipements Wi‑Fi, routeurs et accessoires de connectivité.', category: 'CONNECTIVITE', logo: brandLogos.wifi, verified: false, products: DEMO_PRODUCTS('wifi', 'CONNECTIVITE') },
];

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
      showToast('Connectez-vous ou créez un compte pour ouvrir votre espace Mobilier.', 'info');
      setActiveNavTab('menu');
      return;
    }
    showToast('Votre espace Mobilier sera lié à votre profil vendeur.', 'success');
  };

  if (selectedShop) {
    return (
      <div className="pb-24 max-w-3xl mx-auto space-y-4">
        <button onClick={() => setSelectedShop(null)} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]">
          <ArrowLeft className="w-4 h-4" /> Retour aux Mobiliers
        </button>

        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="h-36 sm:h-44 bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center p-5 border-b border-slate-100">
            <img src={selectedShop.logo} alt={`Logo ${selectedShop.name}`} className="max-w-[75%] max-h-24 object-contain" />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-xl text-slate-900 truncate">{selectedShop.name}</h1>
                  {selectedShop.verified && <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedShop.city}</p>
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {selectedShop.category === 'CONNECTIVITE' ? 'CONNECTIVITÉ' : 'MAISON'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-3">{selectedShop.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => startChat(selectedShop)} className="py-3 rounded-xl bg-[#16a34a] text-white font-bold text-sm flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Discuter
              </button>
              <button onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })} className="py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Catalogue
              </button>
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
        <p className="text-sm text-slate-500 mt-2">Les enseignes sont présentées par leur logo. Touchez une enseigne pour ouvrir sa page, son catalogue et discuter directement avec le vendeur.</p>
        <button onClick={createShop} className="w-full mt-4 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Créer mon espace Mobilier
        </button>
      </section>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une enseigne..." className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => setCategory('TOUS')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${category === 'TOUS' ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-slate-600 border-slate-200'}`}>Tous</button>
        <button onClick={() => setCategory('MAISON')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${category === 'MAISON' ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white text-slate-600 border-slate-200'}`}>Maison & équipements</button>
        <button onClick={() => setCategory('CONNECTIVITE')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 ${category === 'CONNECTIVITE' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}><Wifi className="w-3.5 h-3.5" /> Connectivité</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shops.map((shop) => (
          <button key={shop.id} onClick={() => setSelectedShop(shop)} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm text-left hover:border-[#1e3a8a]/30 transition-colors min-w-0">
            <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 overflow-hidden">
              <img src={shop.logo} alt={`Logo ${shop.name}`} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="mt-2 flex items-center gap-1 min-w-0">
              <span className="font-black text-xs text-slate-900 truncate">{shop.name}</span>
              {shop.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </div>
            <span className="text-[10px] text-slate-500">Voir la page</span>
          </button>
        ))}
      </div>

      {shops.length === 0 && <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Aucune enseigne ne correspond à votre recherche.</div>}
    </div>
  );
};

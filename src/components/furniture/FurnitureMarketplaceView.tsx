import React, { useMemo, useState } from 'react';
import { ArrowLeft, MessageCircle, Search, ShoppingBag, Store, BadgeCheck, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

type FurnitureProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type FurnitureShop = {
  id: string;
  name: string;
  city: string;
  description: string;
  logo: string;
  cover: string;
  verified: boolean;
  products: FurnitureProduct[];
};

const SHOPS: FurnitureShop[] = [
  {
    id: 'shop-1',
    name: 'Maison Élégance',
    city: 'Kinshasa',
    description: 'Salons, chambres, tables et décoration pour la maison.',
    logo: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=220&q=80',
    cover: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    products: [
      { id: 'p1', name: 'Salon moderne 5 places', price: 850, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
      { id: 'p2', name: 'Table à manger 6 places', price: 420, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80' },
    ],
  },
  {
    id: 'shop-2',
    name: 'Congo Design Mobilier',
    city: 'Lubumbashi',
    description: 'Mobilier contemporain, bureaux et aménagement intérieur.',
    logo: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=220&q=80',
    cover: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    products: [
      { id: 'p3', name: 'Fauteuil lounge', price: 190, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80' },
      { id: 'p4', name: 'Bureau professionnel', price: 330, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80' },
    ],
  },
];

export const FurnitureMarketplaceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { setActiveNavTab, showToast } = useProperties();
  const [query, setQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<FurnitureShop | null>(null);

  const shops = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHOPS;
    return SHOPS.filter((shop) => `${shop.name} ${shop.city} ${shop.description}`.toLowerCase().includes(q));
  }, [query]);

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
    showToast('La création de magasin sera reliée au profil vendeur. Votre espace est prêt à être complété.', 'success');
  };

  if (selectedShop) {
    return (
      <div className="pb-24 space-y-4 max-w-3xl mx-auto">
        <button onClick={() => setSelectedShop(null)} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]">
          <ArrowLeft className="w-4 h-4" /> Retour aux magasins
        </button>

        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="relative h-40 sm:h-52">
            <img src={selectedShop.cover} alt={selectedShop.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
              <img src={selectedShop.logo} alt="Logo magasin" className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow" />
              <div className="text-white min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-xl truncate">{selectedShop.name}</h1>
                  {selectedShop.verified && <BadgeCheck className="w-5 h-5 text-emerald-300 shrink-0" />}
                </div>
                <div className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedShop.city}</div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600">{selectedShop.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => startChat(selectedShop)} className="py-3 rounded-xl bg-[#16a34a] text-white font-bold text-sm flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Discuter
              </button>
              <button className="py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Catalogue
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-black text-lg text-slate-900 mb-3">Catalogue du magasin</h2>
          <div className="grid grid-cols-2 gap-3">
            {selectedShop.products.map((product) => (
              <article key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{product.name}</h3>
                  <div className="font-black text-[#1e3a8a] mt-1">${product.price}</div>
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
    <div className="pb-24 space-y-4 max-w-3xl mx-auto">
      <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#1e3a8a]"><Store className="w-6 h-6" /><h1 className="text-2xl font-black">Magasins de meubles</h1></div>
            <p className="text-sm text-slate-500 mt-2">Découvrez les magasins, ouvrez leur page, consultez leur catalogue et discutez directement avec le vendeur.</p>
          </div>
        </div>
        <button onClick={createShop} className="w-full mt-4 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Créer mon magasin
        </button>
      </section>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un magasin ou une ville..." className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" />
      </div>

      <div className="space-y-4">
        {shops.map((shop) => (
          <article key={shop.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <button onClick={() => setSelectedShop(shop)} className="w-full text-left">
              <img src={shop.cover} alt={shop.name} className="w-full aspect-[16/8] object-cover" />
              <div className="p-4 flex gap-3 items-center">
                <img src={shop.logo} alt="Logo magasin" className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><h2 className="font-black text-base text-slate-900 truncate">{shop.name}</h2>{shop.verified && <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />}</div>
                  <div className="text-xs text-slate-500">{shop.city} • {shop.products.length} produit(s)</div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{shop.description}</p>
                </div>
              </div>
            </button>
            <div className="grid grid-cols-2 border-t border-slate-100">
              <button onClick={() => setSelectedShop(shop)} className="py-3 text-xs font-bold text-[#1e3a8a]">Voir le magasin</button>
              <button onClick={() => startChat(shop)} className="py-3 text-xs font-bold text-[#16a34a] border-l border-slate-100 flex items-center justify-center gap-1.5"><MessageCircle className="w-4 h-4" /> Discuter</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

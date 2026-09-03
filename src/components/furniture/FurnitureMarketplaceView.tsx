import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Search,
  ShoppingCart,
  Store,
  X,
} from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { brandLogos } from './brandLogos';

type Shop = {
  id: string;
  ownerId?: string;
  name: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  phone?: string;
  address?: string;
  verified?: boolean;
  active?: boolean;
};

type ShopProduct = {
  id: string;
  shopId: string;
  shopName?: string;
  shopLogo?: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  stock?: number;
  active?: boolean;
  createdAt?: unknown;
};

const categories = [
  'Tous',
  'Réseau & Connectivité',
  'Meubles & Décoration',
  'Électricité',
  'Plomberie',
  'Électronique & High-Tech',
  'Téléphones & Accessoires',
  'Informatique',
  'Électroménager',
  'Matériaux de construction',
  'Quincaillerie & Outillage',
  'Produits ménagers',
  'Autres produits',
];

const partnerFallbacks: Shop[] = [
  { id: 'orca', name: 'ORCA Kinshasa', logo: brandLogos.orca, verified: true, active: true },
  { id: 'fournitures-plus', name: 'Fournitures et Plus', logo: brandLogos['fournitures-plus'], verified: true, active: true },
  { id: 'congo-electro', name: 'Congo Electro', logo: brandLogos['congo-electro'], verified: true, active: true },
  { id: 'cimenterie-lukala', name: 'Cimenterie de Lukala', verified: true, active: true },
  { id: 'devhome-drc', name: 'DevHome DRC', verified: true, active: true },
];

const money = (value: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toLocaleString('fr-FR')} ${currency}`;
  }
};

const ShopLogo: React.FC<{ shop?: Shop; fallbackName?: string; className?: string }> = ({ shop, fallbackName, className = '' }) => {
  const name = shop?.name || fallbackName || 'Boutique';
  if (shop?.logo) return <img src={shop.logo} alt={`Logo ${name}`} className={`object-contain bg-white ${className}`} />;
  return <div className={`bg-white flex items-center justify-center font-black text-[#1e3a8a] text-center p-1 ${className}`}>{name.slice(0, 2).toUpperCase()}</div>;
};

export const FurnitureMarketplaceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { setActiveNavTab, setActiveConversationId, showToast } = useProperties();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const unsubShops = onSnapshot(
      collection(db, 'shops'),
      (snapshot) => setShops(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Shop, 'id'>) })).filter((shop) => shop.active !== false)),
      (error) => console.warn('shops:', error.code),
    );
    const unsubProducts = onSnapshot(
      query(collection(db, 'shopProducts'), where('active', '==', true)),
      (snapshot) => setProducts(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ShopProduct, 'id'>) }))),
      (error) => console.warn('shopProducts:', error.code),
    );
    return () => { unsubShops(); unsubProducts(); };
  }, []);

  const allShops = useMemo(() => {
    const map = new Map<string, Shop>();
    partnerFallbacks.forEach((shop) => map.set(shop.id, shop));
    shops.forEach((shop) => map.set(shop.id, { ...map.get(shop.id), ...shop }));
    return Array.from(map.values());
  }, [shops]);

  const filteredProducts = useMemo(() => {
    const queryText = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const categoryOk = selectedCategory === 'Tous' || product.category === selectedCategory;
      const searchOk = !queryText || [product.title, product.description, product.shopName, product.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(queryText));
      return categoryOk && searchOk;
    });
  }, [products, searchTerm, selectedCategory]);

  const selectedShop = selectedShopId ? allShops.find((shop) => shop.id === selectedShopId) : undefined;
  const selectedShopProducts = selectedShopId ? products.filter((product) => product.shopId === selectedShopId) : [];

  const openProduct = (product: ShopProduct) => { setSelectedProduct(product); setActiveImage(0); };
  const requireAuth = () => {
    if (currentUser) return true;
    showToast('Connectez-vous ou créez un compte pour continuer.', 'info');
    setActiveNavTab('accounts');
    return false;
  };

  const addProductToCart = async (product: ShopProduct) => {
    if (!requireAuth() || !currentUser) return;
    try {
      await addDoc(collection(db, 'carts'), {
        userId: currentUser.id,
        listingId: `shopProduct:${product.id}`,
        itemType: 'shopProduct',
        productId: product.id,
        shopId: product.shopId,
        title: product.title,
        price: Number(product.price || 0),
        currency: product.currency || 'USD',
        image: product.images?.[0] || '',
        createdAt: new Date().toISOString(),
      });
      showToast('Produit ajouté au panier.', 'success');
    } catch (error) {
      console.error('I-SHOP panier:', error);
      showToast("Impossible d'ajouter ce produit au panier.", 'error');
    }
  };

  const discussProduct = async (product: ShopProduct) => {
    if (!requireAuth() || !currentUser) return;
    const shop = allShops.find((item) => item.id === product.shopId);
    if (!shop?.ownerId) { showToast("Cette boutique n'a pas encore relié son compte de messagerie.", 'info'); return; }
    if (shop.ownerId === currentUser.id) { showToast('Vous êtes le propriétaire de cette boutique.', 'info'); return; }
    try {
      const participants = [currentUser.id, shop.ownerId].sort();
      const conversationId = `shop_${participants.join('_')}_${product.id}`;
      await setDoc(doc(db, 'conversations', conversationId), {
        participantIds: participants,
        participants: {
          [currentUser.id]: { name: currentUser.fullName || currentUser.email || 'Utilisateur', avatarUrl: currentUser.avatarUrl || '' },
          [shop.ownerId]: { name: shop.name, avatarUrl: shop.logo || '' },
        },
        contextType: 'shopProduct',
        contextId: product.id,
        contextTitle: product.title,
        contextImage: product.images?.[0] || '',
        shopId: shop.id,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
      setActiveConversationId(conversationId);
      setActiveNavTab('messages');
    } catch (error) {
      console.error('I-SHOP discussion:', error);
      showToast("Impossible d'ouvrir la discussion.", 'error');
    }
  };

  if (selectedShopId && selectedShop) {
    return <div className="pb-24 max-w-4xl mx-auto space-y-4">
      <button type="button" onClick={() => setSelectedShopId(null)} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a] px-1"><ArrowLeft className="w-4 h-4" />Retour à I-SHOP</button>
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-[#16a34a] overflow-hidden">{selectedShop.coverImage && <img src={selectedShop.coverImage} alt="Couverture boutique" className="w-full h-full object-cover" />}</div>
        <div className="p-5 -mt-12 relative"><ShopLogo shop={selectedShop} className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg" /><div className="mt-3"><h1 className="text-2xl font-black text-slate-900">{selectedShop.name}</h1><p className="text-sm text-slate-500 mt-1">{selectedShop.description || 'Boutique partenaire I-SHOP'}</p>{selectedShop.address && <p className="text-xs text-slate-400 mt-2">{selectedShop.address}</p>}</div></div>
      </section>
      <section><div className="flex items-center justify-between mb-3 px-1"><h2 className="font-black text-lg">Produits de la boutique</h2><span className="text-xs text-slate-500">{selectedShopProducts.length} produit(s)</span></div>
        {selectedShopProducts.length === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-sm text-slate-500">Cette boutique n’a pas encore publié de produit dans I-SHOP.</div> : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{selectedShopProducts.map((product) => <ProductCard key={product.id} product={product} shop={selectedShop} onOpen={() => openProduct(product)} onShop={() => undefined} />)}</div>}
      </section>
      {selectedProduct && <ProductModal product={selectedProduct} shop={selectedShop} activeImage={activeImage} setActiveImage={setActiveImage} onClose={() => setSelectedProduct(null)} onCart={() => addProductToCart(selectedProduct)} onDiscuss={() => discussProduct(selectedProduct)} onShop={() => { setSelectedProduct(null); setSelectedShopId(selectedProduct.shopId); }} />}
    </div>;
  }

  return <div className="pb-24 max-w-5xl mx-auto space-y-5">
    <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center"><Store className="w-6 h-6" /></div><div><h1 className="text-2xl font-black text-[#1e3a8a]">I-SHOP</h1><p className="text-sm text-slate-500">Produits, équipements et fournitures pour l’habitat.</p></div></div>
      <div className="relative mt-4"><Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher un produit, une catégorie ou une boutique" className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-[#1e3a8a]" /></div>
    </section>

    <section className="relative">
      <div className="flex items-center justify-between mb-2 px-1"><h2 className="font-black text-lg">Catégorie</h2><span className="text-xs text-slate-400">Filtrer les produits</span></div>
      <button type="button" onClick={() => setCategoryOpen((value) => !value)} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 flex items-center justify-between shadow-sm text-left">
        <span><span className="block text-[10px] uppercase tracking-wide text-slate-400 font-bold">Catégorie sélectionnée</span><span className="font-black text-slate-800">{selectedCategory}</span></span>
        <ChevronDown className={`w-5 h-5 text-[#1e3a8a] transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
      </button>
      {categoryOpen && <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[52vh] overflow-y-auto">
        {categories.map((category) => <button key={category} type="button" onClick={() => { setSelectedCategory(category); setCategoryOpen(false); }} className={`w-full px-4 py-3.5 flex items-center justify-between text-left border-b border-slate-100 last:border-0 ${selectedCategory === category ? 'bg-blue-50 text-[#1e3a8a]' : 'text-slate-700 hover:bg-slate-50'}`}><span className="text-sm font-bold">{category}</span>{selectedCategory === category && <Check className="w-4 h-4 text-[#16a34a]" />}</button>)}
      </div>}
    </section>

    <section><div className="flex items-center justify-between mb-3 px-1"><h2 className="font-black text-lg">Produits</h2><span className="text-xs text-slate-500">{filteredProducts.length} résultat(s)</span></div>
      {filteredProducts.length === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center"><Store className="w-9 h-9 text-slate-300 mx-auto mb-3" /><p className="font-bold text-slate-700">Aucun produit disponible</p><p className="text-xs text-slate-500 mt-1">Les produits publiés par les boutiques apparaîtront ici automatiquement.</p></div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{filteredProducts.map((product) => { const shop = allShops.find((item) => item.id === product.shopId); return <ProductCard key={product.id} product={product} shop={shop} onOpen={() => openProduct(product)} onShop={() => setSelectedShopId(product.shopId)} />; })}</div>}
    </section>

    <section><div className="flex items-center justify-between mb-3 px-1"><h2 className="font-black text-lg">Boutiques</h2><span className="text-xs text-slate-500">Touchez un logo</span></div><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">{allShops.map((shop) => <button key={shop.id} type="button" onClick={() => setSelectedShopId(shop.id)} className="bg-white border border-slate-200 rounded-2xl p-3 aspect-square shadow-sm flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition"><ShopLogo shop={shop} className="w-14 h-14 rounded-xl" /><span className="text-[10px] font-bold text-slate-700 line-clamp-2 text-center">{shop.name}</span></button>)}</div></section>

    {selectedProduct && <ProductModal product={selectedProduct} shop={allShops.find((item) => item.id === selectedProduct.shopId)} activeImage={activeImage} setActiveImage={setActiveImage} onClose={() => setSelectedProduct(null)} onCart={() => addProductToCart(selectedProduct)} onDiscuss={() => discussProduct(selectedProduct)} onShop={() => { setSelectedProduct(null); setSelectedShopId(selectedProduct.shopId); }} />}
  </div>;
};

const ProductCard: React.FC<{ product: ShopProduct; shop?: Shop; onOpen: () => void; onShop: () => void }> = ({ product, shop, onOpen, onShop }) => <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
  <button type="button" onClick={onOpen} className="w-full text-left"><div className="aspect-square bg-slate-100 overflow-hidden">{product.images?.[0] ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart className="w-9 h-9" /></div>}</div><div className="p-3"><h3 className="font-bold text-sm text-slate-900 line-clamp-2 min-h-[2.5rem]">{product.title}</h3><p className="text-[#1e3a8a] font-black mt-1">{money(Number(product.price || 0), product.currency || 'USD')}</p></div></button>
  <button type="button" onClick={onShop} className="w-full px-3 pb-3 flex items-center gap-2 text-left"><ShopLogo shop={shop} fallbackName={product.shopName} className="w-7 h-7 rounded-lg border border-slate-100" /><span className="text-[10px] font-semibold text-slate-500 truncate flex-1">{shop?.name || product.shopName || 'Boutique I-SHOP'}</span><ChevronRight className="w-3 h-3 text-slate-300" /></button>
</article>;

const ProductModal: React.FC<{ product: ShopProduct; shop?: Shop; activeImage: number; setActiveImage: (index: number) => void; onClose: () => void; onCart: () => void; onDiscuss: () => void; onShop: () => void; }> = ({ product, shop, activeImage, setActiveImage, onClose, onCart, onDiscuss, onShop }) => {
  const images = product.images?.length ? product.images : [''];
  return <div className="fixed inset-0 z-[80] bg-slate-950/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}><div className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl" onClick={(event) => event.stopPropagation()}>
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-slate-100"><div><p className="text-xs text-slate-400">I-SHOP</p><h2 className="font-black text-slate-900 line-clamp-1">{product.title}</h2></div><button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-5 h-5" /></button></div>
    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">{images[activeImage] ? <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart className="w-12 h-12" /></div>}</div>
    {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-3">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`w-16 h-16 rounded-xl shrink-0 overflow-hidden border-2 ${activeImage === index ? 'border-[#1e3a8a]' : 'border-transparent'}`}><img src={image} alt="" className="w-full h-full object-cover" /></button>)}</div>}
    <div className="p-5 space-y-5"><div><p className="text-xs font-bold text-[#16a34a] uppercase tracking-wide">{product.category}</p><h2 className="text-xl font-black mt-1">{product.title}</h2><p className="text-2xl text-[#1e3a8a] font-black mt-2">{money(Number(product.price || 0), product.currency || 'USD')}</p>{typeof product.stock === 'number' && <p className="text-xs text-slate-500 mt-1">Stock : {product.stock}</p>}</div>
      {product.description && <div><h3 className="font-black text-sm mb-2">Détails du produit</h3><p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p></div>}
      <button type="button" onClick={onShop} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-left"><ShopLogo shop={shop} fallbackName={product.shopName} className="w-12 h-12 rounded-xl" /><div className="flex-1 min-w-0"><div className="font-black text-sm truncate">{shop?.name || product.shopName || 'Boutique I-SHOP'}</div><div className="text-xs text-slate-500">Voir le profil et tous les produits</div></div><ChevronRight className="w-4 h-4 text-slate-400" /></button>
      <div className="grid grid-cols-2 gap-3 sticky bottom-0 bg-white pt-2 pb-1"><button type="button" onClick={onDiscuss} className="h-12 rounded-2xl border border-[#16a34a] text-[#15803d] font-black text-sm flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" />Discuter</button><button type="button" onClick={onCart} className="h-12 rounded-2xl bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center gap-2"><ShoppingCart className="w-5 h-5" />Ajouter au panier</button></div>
    </div>
  </div></div>;
};

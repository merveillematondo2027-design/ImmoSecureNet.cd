import React, { useMemo, useState } from 'react';
import { Building2, CheckCircle2, ImagePlus, PackagePlus, Send, ShieldCheck, Store, UploadCloud } from 'lucide-react';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { ListingType, UserRole } from '../../types';
import {
  bedroomOptions,
  cities,
  communes,
  neighborhoods,
  parkingOptions,
  provinces,
  rentalPropertyTypes,
  salePropertyTypes,
} from '../../data/propertyCatalog';

const SHOP_CATEGORIES = [
  'Réseau & Connectivité', 'Meubles & Décoration', 'Électricité', 'Plomberie',
  'Électronique & High-Tech', 'Téléphones & Accessoires', 'Informatique',
  'Électroménager', 'Matériaux de construction', 'Quincaillerie & Outillage',
  'Produits ménagers', 'Autres produits',
];

const PUBLISHER_ROLES = [UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER, UserRole.SELLER];

const roleLabel = (role?: UserRole) => {
  if (role === UserRole.AGENT) return 'Agent immobilier';
  if (role === UserRole.AGENCY) return 'Agence immobilière';
  if (role === UserRole.OWNER) return 'Bailleur / Propriétaire';
  if (role === UserRole.SELLER) return 'Vendeur I-SHOP';
  return 'Utilisateur';
};

const safeFileName = (value: string) => value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');

export const PublishHubView: React.FC = () => {
  const { currentUser } = useAuth();
  const { createListing, showToast, setActiveNavTab } = useProperties();
  const [busy, setBusy] = useState(false);
  const isSeller = currentUser?.role === UserRole.SELLER;
  const canPublish = !!currentUser && PUBLISHER_ROLES.includes(currentUser.role);

  const [transaction, setTransaction] = useState<'RENT' | 'SALE'>('RENT');
  const [propertyTypeKey, setPropertyTypeKey] = useState('apartment');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [provinceId, setProvinceId] = useState('kinshasa');
  const [cityId, setCityId] = useState('kinshasa');
  const [communeId, setCommuneId] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [parkingCapacity, setParkingCapacity] = useState('0');
  const [generator, setGenerator] = useState(false);
  const [solarPanels, setSolarPanels] = useState(false);
  const [waterTank, setWaterTank] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [swimmingPool, setSwimmingPool] = useState(false);
  const [shortStayAvailable, setShortStayAvailable] = useState(false);
  const [propertyFiles, setPropertyFiles] = useState<File[]>([]);

  const [shopName, setShopName] = useState(currentUser?.companyName || '');
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState(SHOP_CATEGORIES[0]);
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCurrency, setProductCurrency] = useState('USD');
  const [stock, setStock] = useState('1');
  const [productFiles, setProductFiles] = useState<File[]>([]);

  const propertyGroups = transaction === 'RENT' ? rentalPropertyTypes : salePropertyTypes;
  const visibleCities = useMemo(() => cities.filter((item) => item.provinceId === provinceId), [provinceId]);
  const visibleCommunes = useMemo(() => communes.filter((item) => item.cityId === cityId), [cityId]);
  const visibleNeighborhoods = useMemo(() => neighborhoods.filter((item) => !communeId || item.communeId === communeId), [communeId]);

  const uploadImages = async (files: File[], kind: 'real-estate' | 'products') => {
    if (!currentUser) return [];
    const limited = files.slice(0, kind === 'real-estate' ? 8 : 6);
    const urls: string[] = [];
    for (const file of limited) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) throw new Error(`L'image ${file.name} dépasse 10 Mo.`);
      const path = `publications/${currentUser.id}/${kind}/${Date.now()}-${safeFileName(file.name)}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, { contentType: file.type });
      urls.push(await getDownloadURL(fileRef));
    }
    return urls;
  };

  const submitProperty = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || ![UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER].includes(currentUser.role)) return;
    if (!title.trim() || !price || !provinceId || !cityId) {
      showToast('Complétez le titre, le prix, la province et la ville.', 'error');
      return;
    }
    setBusy(true);
    try {
      const images = await uploadImages(propertyFiles, 'real-estate');
      const city = cities.find((item) => item.id === cityId)?.name || cityId;
      const neighborhood = neighborhoods.find((item) => item.id === neighborhoodId)?.name || neighborhoodId;
      const ok = await createListing({
        listingType: transaction === 'RENT' ? ListingType.RENT : ListingType.SALE,
        title: title.trim(),
        shortDescription: description.trim().slice(0, 180),
        fullDescription: description.trim(),
        price: Number(price),
        currency: currency as any,
        location: {
          provinceId, cityId, communeId, neighborhoodId, address: address.trim(), city, neighborhood, country: 'RD Congo',
        } as any,
        propertyTypeKey,
        propertyDetails: {
          bedrooms, parkingCapacity, generator, solarPanels, waterTank, furnished, swimmingPool, shortStayAvailable,
        },
        mainPhoto: images[0] || '',
        galleryPhotos: images,
      } as any);
      if (ok) {
        setTitle(''); setDescription(''); setPrice(''); setAddress(''); setPropertyFiles([]);
      }
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || 'Impossible de publier cette annonce.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const getOrCreateShop = async () => {
    if (!currentUser) throw new Error('Compte vendeur requis.');
    const snap = await getDocs(query(collection(db, 'shops'), where('ownerId', '==', currentUser.id)));
    if (!snap.empty) return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
    if (!shopName.trim()) throw new Error('Indiquez le nom de votre magasin.');
    const shopRef = doc(collection(db, 'shops'));
    const payload = {
      ownerId: currentUser.id,
      name: shopName.trim(),
      logo: currentUser.avatarUrl || '',
      description: 'Boutique I-SHOP ImmoSecureNet',
      phone: currentUser.phone || '',
      verified: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(shopRef, payload);
    return { id: shopRef.id, ...payload };
  };

  const submitProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || currentUser.role !== UserRole.SELLER) return;
    if (!productTitle.trim() || !productPrice) {
      showToast('Le nom et le prix du produit sont obligatoires.', 'error');
      return;
    }
    setBusy(true);
    try {
      const shop = await getOrCreateShop();
      const images = await uploadImages(productFiles, 'products');
      const productRef = doc(collection(db, 'shopProducts'));
      await setDoc(productRef, {
        sellerId: currentUser.id,
        shopId: shop.id,
        shopName: shop.name,
        shopLogo: shop.logo || '',
        title: productTitle.trim(),
        description: productDescription.trim(),
        category: productCategory,
        price: Number(productPrice),
        currency: productCurrency,
        images,
        stock: Math.max(0, Number(stock || 0)),
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      showToast('Produit publié dans I-SHOP.', 'success');
      setProductTitle(''); setProductDescription(''); setProductPrice(''); setStock('1'); setProductFiles([]);
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || 'Publication du produit impossible.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!currentUser || !canPublish) {
    return <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-7 text-center shadow-sm">
      <ShieldCheck className="w-12 h-12 mx-auto text-[#1e3a8a] mb-4" />
      <h1 className="text-xl font-black text-slate-900">Publication réservée aux comptes professionnels</h1>
      <p className="text-sm text-slate-500 mt-2">Les utilisateurs standards ne peuvent pas publier. Créez ou demandez un compte Agent/Agence, Bailleur/Propriétaire ou Vendeur.</p>
      <button onClick={() => setActiveNavTab('accounts')} className="mt-5 px-5 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm">Voir Mes comptes</button>
    </div>;
  }

  return <div className="max-w-4xl mx-auto pb-10 space-y-5">
    <section className="bg-gradient-to-r from-[#1e3a8a] to-[#0f766e] rounded-3xl p-5 sm:p-7 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div><div className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Centre de publication</div><h1 className="text-2xl font-black mt-1">Publier sur ImmoSecureNet</h1><p className="text-sm text-white/80 mt-2">Votre espace est adapté à votre rôle et aux contenus que vous êtes autorisé à publier.</p></div>
        <span className="px-3 py-2 bg-white/15 border border-white/20 rounded-xl text-xs font-black shrink-0">{roleLabel(currentUser.role)}</span>
      </div>
    </section>

    {!isSeller ? <form onSubmit={submitProperty} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Building2 className="w-6 h-6" /></div><div><h2 className="font-black text-lg">Annonce immobilière</h2><p className="text-xs text-slate-500">Vente ou location — soumise à validation avant mise en ligne.</p></div></div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Opération</span><select value={transaction} onChange={(e)=>{setTransaction(e.target.value as any); setPropertyTypeKey(e.target.value === 'RENT' ? 'apartment' : 'apartment');}} className="w-full p-3 rounded-xl border border-slate-300 bg-white"><option value="RENT">À louer</option><option value="SALE">À vendre</option></select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Type de bien</span><select value={propertyTypeKey} onChange={(e)=>setPropertyTypeKey(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white">{propertyGroups.map((group)=><optgroup key={group.group} label={group.group}>{group.items.map(([value,label])=><option key={value} value={value}>{label}</option>)}</optgroup>)}</select></label>
        <label className="space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Titre de l’annonce</span><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ex. Appartement 3 chambres à Gombe" className="w-full p-3 rounded-xl border border-slate-300" /></label>
        <label className="space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Description</span><textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={4} placeholder="Décrivez clairement le bien, son état et ses atouts…" className="w-full p-3 rounded-xl border border-slate-300 resize-none" /></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Prix</span><input type="number" min="0" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" /></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Devise</span><select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white"><option>USD</option><option>CDF</option><option>EUR</option></select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Province</span><select value={provinceId} onChange={(e)=>{setProvinceId(e.target.value); const first=cities.find(c=>c.provinceId===e.target.value); setCityId(first?.id || ''); setCommuneId(''); setNeighborhoodId('');}} className="w-full p-3 rounded-xl border border-slate-300 bg-white">{provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Ville</span><select value={cityId} onChange={(e)=>{setCityId(e.target.value); setCommuneId(''); setNeighborhoodId('');}} className="w-full p-3 rounded-xl border border-slate-300 bg-white"><option value="">Choisir</option>{visibleCities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Commune</span><select value={communeId} onChange={(e)=>{setCommuneId(e.target.value); setNeighborhoodId('');}} className="w-full p-3 rounded-xl border border-slate-300 bg-white"><option value="">Choisir</option>{visibleCommunes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Quartier</span><select value={neighborhoodId} onChange={(e)=>setNeighborhoodId(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white"><option value="">Choisir</option>{visibleNeighborhoods.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}</select></label>
        <label className="space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Adresse / repère</span><input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Avenue, numéro, repère…" className="w-full p-3 rounded-xl border border-slate-300" /></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Nombre de chambres</span><select value={bedrooms} onChange={(e)=>setBedrooms(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white">{bedroomOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Capacité de stationnement du parking</span><select value={parkingCapacity} onChange={(e)=>setParkingCapacity(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white">{parkingOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <div className="sm:col-span-2"><div className="text-xs font-bold text-slate-700 mb-2">Équipements et disponibilité</div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[[generator,setGenerator,'Groupe électrogène'],[solarPanels,setSolarPanels,'Installation solaire (Panneau)'],[waterTank,setWaterTank,"Citerne / Réservoir d'eau"],[furnished,setFurnished,'Bien meublé'],[swimmingPool,setSwimmingPool,'Piscine'],[shortStayAvailable,setShortStayAvailable,'Courte durée']].map(([value,setter,label]:any)=><label key={label} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"><input type="checkbox" checked={value} onChange={(e)=>setter(e.target.checked)} />{label}</label>)}</div></div>
        <label className="sm:col-span-2 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50"><UploadCloud className="w-7 h-7 text-[#1e3a8a]"/><div className="flex-1"><div className="font-bold text-sm">Photos du bien</div><div className="text-xs text-slate-500">Jusqu’à 8 images, 10 Mo maximum chacune.</div>{propertyFiles.length > 0 && <div className="text-xs text-emerald-600 font-bold mt-1">{propertyFiles.length} photo(s) sélectionnée(s)</div>}</div><input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>setPropertyFiles(Array.from(e.target.files || []).slice(0,8))} /></label>
      </div>
      <div className="p-5 border-t border-slate-100"><button disabled={busy} className="w-full py-3.5 rounded-2xl bg-[#16a34a] text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"><Send className="w-5 h-5" />{busy ? 'Publication en cours…' : 'Soumettre l’annonce'}</button><p className="text-[11px] text-slate-500 text-center mt-2">L’annonce sera vérifiée avant sa publication publique.</p></div>
    </form> : <form onSubmit={submitProduct} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><PackagePlus className="w-6 h-6" /></div><div><h2 className="font-black text-lg">Publier un produit I-SHOP</h2><p className="text-xs text-slate-500">Le produit sera associé automatiquement à votre magasin.</p></div></div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Nom du magasin</span><div className="relative"><Store className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/><input value={shopName} onChange={(e)=>setShopName(e.target.value)} placeholder="Nom public de votre boutique" className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300" /></div></label>
        <label className="space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Nom du produit</span><input value={productTitle} onChange={(e)=>setProductTitle(e.target.value)} placeholder="Ex. Canapé 5 places" className="w-full p-3 rounded-xl border border-slate-300" /></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Catégorie</span><select value={productCategory} onChange={(e)=>setProductCategory(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white">{SHOP_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Stock disponible</span><input type="number" min="0" value={stock} onChange={(e)=>setStock(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" /></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Prix</span><input type="number" min="0" value={productPrice} onChange={(e)=>setProductPrice(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" /></label>
        <label className="space-y-1"><span className="text-xs font-bold text-slate-700">Devise</span><select value={productCurrency} onChange={(e)=>setProductCurrency(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 bg-white"><option>USD</option><option>CDF</option><option>EUR</option></select></label>
        <label className="space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Description</span><textarea value={productDescription} onChange={(e)=>setProductDescription(e.target.value)} rows={4} placeholder="Caractéristiques, dimensions, marque, garantie…" className="w-full p-3 rounded-xl border border-slate-300 resize-none" /></label>
        <label className="sm:col-span-2 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50"><ImagePlus className="w-7 h-7 text-[#1e3a8a]"/><div className="flex-1"><div className="font-bold text-sm">Photos du produit</div><div className="text-xs text-slate-500">Jusqu’à 6 images, 10 Mo maximum chacune.</div>{productFiles.length > 0 && <div className="text-xs text-emerald-600 font-bold mt-1">{productFiles.length} photo(s) sélectionnée(s)</div>}</div><input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>setProductFiles(Array.from(e.target.files || []).slice(0,6))} /></label>
      </div>
      <div className="p-5 border-t border-slate-100"><button disabled={busy} className="w-full py-3.5 rounded-2xl bg-[#1e3a8a] text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 className="w-5 h-5" />{busy ? 'Publication en cours…' : 'Publier dans I-SHOP'}</button></div>
    </form>}
  </div>;
};

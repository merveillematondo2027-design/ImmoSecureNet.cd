import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowLeft, CalendarCheck, FileText, Heart, MapPin, MessageCircle, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

type WorkspaceKind = 'favorites' | 'appointments' | 'cart' | 'documents';

type VisitRequest = {
  id: string;
  listingId?: string;
  listingTitle?: string;
  propertyTitle?: string;
  preferredDate?: string;
  date?: string;
  time?: string;
  status?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  agentName?: string;
};

type ContractRequest = {
  id: string;
  contractType?: string;
  subject?: string;
  applicantName?: string;
  status?: string;
  verificationDelayDays?: number;
  identificationNumber?: string;
};

const titleFor = (kind: WorkspaceKind) => ({
  favorites: 'Mes favoris',
  appointments: 'Mes rendez-vous',
  cart: 'Mon panier',
  documents: 'Mes documents',
}[kind]);

export const AccountWorkspaceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { listings, favorites, cartItems, removeFromCart, setSelectedListing, setActiveNavTab, showToast } = useProperties();
  const kind = (sessionStorage.getItem('immosecure_account_workspace') || 'favorites') as WorkspaceKind;
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [contracts, setContracts] = useState<ContractRequest[]>([]);

  useEffect(() => {
    if (!currentUser || kind !== 'appointments') return;
    return onSnapshot(query(collection(db, 'visitRequests'), where('userId', '==', currentUser.id)), (snap) => {
      setVisits(snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<VisitRequest, 'id'>) })));
    }, (error) => console.warn('visitRequests:', error.code));
  }, [currentUser?.id, kind]);

  useEffect(() => {
    if (!currentUser || kind !== 'documents') return;
    return onSnapshot(query(collection(db, 'contractRequests'), where('userId', '==', currentUser.id)), (snap) => {
      setContracts(snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ContractRequest, 'id'>) })));
    }, (error) => console.warn('contractRequests:', error.code));
  }, [currentUser?.id, kind]);

  const favoriteListings = useMemo(() => listings.filter((listing) => favorites.includes(listing.id)), [listings, favorites]);

  const deleteFavorite = async (listingId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'favorites', `${currentUser.id}_${listingId}`));
      showToast('Annonce retirée des favoris.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Impossible de retirer ce favori.', 'error');
    }
  };

  if (!currentUser) return null;

  return <div className="max-w-4xl mx-auto pb-24 space-y-4">
    <button onClick={() => setActiveNavTab('accounts')} className="inline-flex items-center gap-2 text-sm font-black text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour au profil</button>

    <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <h1 className="text-2xl font-black text-slate-900">{titleFor(kind)}</h1>
      <p className="text-sm text-slate-500 mt-1">Espace personnel synchronisé avec votre compte ImmoSecureNet.</p>
    </section>

    {kind === 'favorites' && <section className="space-y-3">
      {favoriteListings.map((listing) => <article key={listing.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3 shadow-sm">
        <button onClick={() => setSelectedListing(listing)} className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0"><img src={listing.mainPhoto} alt={listing.title} className="w-full h-full object-cover"/></button>
        <div className="min-w-0 flex-1"><button onClick={() => setSelectedListing(listing)} className="font-black text-left line-clamp-2">{listing.title}</button><p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><MapPin className="w-3 h-3"/>{listing.location.neighborhood}, {listing.location.city}</p><p className="font-black text-[#1e3a8a] mt-2">{listing.price?.toLocaleString('fr-FR')} {listing.currency}</p></div>
        <button onClick={() => void deleteFavorite(listing.id)} className="self-start p-2 rounded-xl bg-rose-50 text-rose-600" aria-label="Retirer des favoris"><Trash2 className="w-4 h-4"/></button>
      </article>)}
      {!favoriteListings.length && <Empty icon={Heart} title="Aucun favori" text="Ajoutez des annonces à vos favoris pour les retrouver ici."/>}
    </section>}

    {kind === 'appointments' && <section className="space-y-3">
      {visits.map((visit) => <article key={visit.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{visit.listingTitle || visit.propertyTitle || 'Visite immobilière'}</h2><p className="text-xs text-slate-500 mt-2">{visit.preferredDate || visit.date || 'Date à confirmer'} {visit.time ? `· ${visit.time}` : ''}</p>{(visit.address || visit.neighborhood || visit.city) && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/>{[visit.address, visit.neighborhood, visit.city].filter(Boolean).join(', ')}</p>}</div><span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-[10px] font-black">{visit.status || 'En attente'}</span></div>{visit.agentName && <p className="text-xs mt-3 text-slate-600">Professionnel : {visit.agentName}</p>}</article>)}
      {!visits.length && <Empty icon={CalendarCheck} title="Aucun rendez-vous" text="Vos demandes de visite et rendez-vous apparaîtront ici."/>}
    </section>}

    {kind === 'cart' && <section className="space-y-3">
      {cartItems.map((item) => <article key={item.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3 shadow-sm"><div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">{item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-7 h-7"/></div>}</div><div className="flex-1 min-w-0"><h2 className="font-black line-clamp-2">{item.title}</h2><p className="font-black text-[#1e3a8a] mt-2">{Number(item.price || 0).toLocaleString('fr-FR')} {item.currency || 'USD'}</p><button onClick={() => setActiveNavTab(item.listingId?.startsWith('shopProduct:') ? 'furniture_marketplace' : 'marketplace')} className="text-xs text-[#16a34a] font-bold mt-3">Voir l’article</button></div><button onClick={() => void removeFromCart(item.listingId)} className="self-start p-2 rounded-xl bg-rose-50 text-rose-600" aria-label="Retirer du panier"><Trash2 className="w-4 h-4"/></button></article>)}
      {!cartItems.length && <Empty icon={ShoppingCart} title="Panier vide" text="Les biens et produits ajoutés apparaîtront ici."/>}
    </section>}

    {kind === 'documents' && <section className="space-y-3">
      <button onClick={() => { sessionStorage.setItem('immosecure_service_module','contracts'); setActiveNavTab('service_module'); }} className="w-full bg-[#1e3a8a] text-white rounded-2xl p-4 font-black flex items-center justify-center gap-2"><FileText className="w-5 h-5"/>Enregistrer ou vérifier un contrat</button>
      {contracts.map((contract) => <article key={contract.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{contract.subject || (contract.contractType === 'vente' ? 'Contrat de vente' : 'Contrat de bail')}</h2><p className="text-xs text-slate-500 mt-1">{contract.applicantName || currentUser.fullName}</p></div><span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black">{contract.status || 'Vérification en cours'}</span></div>{contract.identificationNumber && <p className="text-xs text-slate-600 mt-3">ID : {contract.identificationNumber}</p>}{contract.verificationDelayDays && <p className="text-xs text-slate-500 mt-1">Délai indicatif : {contract.verificationDelayDays} jour(s)</p>}</article>)}
      {!contracts.length && <Empty icon={FileText} title="Aucun document" text="Vos demandes de vérification de contrats apparaîtront ici."/>}
    </section>}

    <button onClick={() => setActiveNavTab('messages')} className="w-full border border-slate-200 bg-white rounded-2xl p-4 font-black flex items-center justify-center gap-2 text-[#1e3a8a]"><MessageCircle className="w-5 h-5"/>Contacter l’assistance</button>
  </div>;
};

const Empty: React.FC<{ icon: React.ComponentType<any>; title: string; text: string }> = ({ icon: Icon, title, text }) => <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center"><Icon className="w-10 h-10 text-slate-300 mx-auto"/><h2 className="font-black mt-3">{title}</h2><p className="text-sm text-slate-500 mt-1">{text}</p></div>;

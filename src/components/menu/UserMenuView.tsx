import React, { useMemo, useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Building2, CalendarCheck, ShoppingCart, Heart, Settings, LogOut, LogIn, ChevronRight, Briefcase, Home, Store, BadgeCheck, MessageCircle, FileText, BarChart3, MapPin, Camera, Package, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { UserRole } from '../../types';
interface Props { onOpenAuth?: (mode: 'LOGIN' | 'REGISTER') => void; }

const roleLabel = (role: UserRole) => {
  if (role === UserRole.AGENT) return 'Agent immobilier';
  if (role === UserRole.AGENCY) return 'Agence immobilière';
  if (role === UserRole.OWNER) return 'Bailleur / Propriétaire';
  if (role === UserRole.SELLER) return 'Vendeur / Magasin I-SHOP';
  if (role === UserRole.ADMIN) return 'Administrateur';
  return 'Utilisateur standard';
};

export const UserMenuView: React.FC<Props> = ({ onOpenAuth }) => {
  const { currentUser, logout, isAuthenticated, requestProfessionalRole } = useAuth();
  const { listings, setActiveNavTab, showToast } = useProperties();
  const [showProfessional, setShowProfessional] = useState(false);
  const request = async (role: UserRole) => { const r = await requestProfessionalRole(role); if (r.success) { setShowProfessional(false); showToast('Votre demande de compte professionnel a été envoyée pour validation.', 'success'); } else showToast(r.error || 'Demande impossible.', 'error'); };
  if (!isAuthenticated || !currentUser) return <div className="pb-24 max-w-xl mx-auto"><section className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm"><div className="w-20 h-20 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center mx-auto"><User className="w-9 h-9"/></div><h1 className="text-2xl font-black mt-4">Mon compte</h1><p className="text-sm text-slate-500 mt-2">Connectez-vous ou créez un compte pour accéder aux fonctions personnelles.</p><div className="grid grid-cols-2 gap-3 mt-5"><button onClick={() => onOpenAuth?.('LOGIN')} className="py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2"><LogIn className="w-4 h-4"/>Se connecter</button><button onClick={() => onOpenAuth?.('REGISTER')} className="py-3 rounded-xl border border-[#1e3a8a] text-[#1e3a8a] font-bold text-sm">Créer un compte</button></div></section></div>;

  const standard = currentUser.role === UserRole.USER;
  const myListings = useMemo(() => listings.filter((item) => item.publishedBy?.id === currentUser.id), [listings, currentUser.id]);
  const professional = [UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER, UserRole.SELLER].includes(currentUser.role);
  const profileRows = [
    { label:'Mes publications', subtitle:'Biens, produits et annonces publiés', icon:Building2, action:()=>setActiveNavTab(currentUser.role === UserRole.SELLER ? 'furniture_marketplace' : 'owner_properties') },
    { label:'Favoris', subtitle:'Vos annonces enregistrées', icon:Heart, action:()=>showToast('Vos favoris seront chargés depuis votre compte.', 'info') },
    { label:'Mes rendez-vous', subtitle:'Visites et rendez-vous programmés', icon:CalendarCheck, action:()=>showToast('Vos rendez-vous seront chargés depuis votre compte.', 'info') },
    { label:'Messages', subtitle:'Discussions liées à vos annonces et demandes', icon:MessageCircle, action:()=>setActiveNavTab('messages') },
    { label:'Mon panier', subtitle:'Articles et biens ajoutés pour achat', icon:ShoppingCart, action:()=>showToast('Votre panier sera chargé depuis votre compte.', 'info') },
    { label:'Documents', subtitle:'Pièces, contrats et vérifications', icon:FileText, action:()=>showToast('Vos documents seront regroupés dans cet espace.', 'info') },
    { label:'Paramètres', subtitle:'Sécurité, confidentialité et préférences', icon:Settings, action:()=>setActiveNavTab('settings') },
  ];

  const professionalBlocks = currentUser.role === UserRole.SELLER ? [
    { title:'Mon magasin I-SHOP', text:'Logo, couverture, présentation et coordonnées du magasin.', icon:Store, action:()=>setActiveNavTab('furniture_marketplace') },
    { title:'Catalogue produits', text:'Gérer les produits, photos, prix, stock et catégories.', icon:Package, action:()=>setActiveNavTab('furniture_marketplace') },
    { title:'Demandes clients', text:'Voir les discussions liées aux produits publiés.', icon:MessageCircle, action:()=>setActiveNavTab('messages') },
  ] : currentUser.role === UserRole.OWNER ? [
    { title:'Mes biens', text:'Enregistrer, mettre à jour et suivre vos propriétés.', icon:Home, action:()=>setActiveNavTab('owner_properties') },
    { title:'Documents des biens', text:'Suivre les pièces, contrats et vérifications.', icon:FileText, action:()=>showToast('Espace documentaire du propriétaire.', 'info') },
    { title:'Demandes de services', text:'Accéder aux services professionnels ImmoSecureNet.', icon:Briefcase, action:()=>setActiveNavTab('services') },
  ] : [
    { title:'Mes offres', text:'Gérer les biens et offres représentés par votre profil.', icon:Building2, action:()=>setActiveNavTab('agent_dashboard') },
    { title:'Accréditation & vérification', text:'Suivre votre identité professionnelle et vos justificatifs.', icon:BadgeCheck, action:()=>showToast('Statut de vérification professionnelle.', 'info') },
    { title:'Clients & messages', text:'Centraliser les demandes reçues depuis vos annonces.', icon:Users, action:()=>setActiveNavTab('messages') },
  ];

  return <div className="pb-24 max-w-3xl mx-auto space-y-4">
    <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"><div className="h-32 bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-[#16a34a] relative"><button onClick={()=>showToast('La modification de la couverture sera disponible depuis Modifier le profil.', 'info')} className="absolute right-4 top-4 rounded-full bg-black/20 text-white p-2"><Camera className="w-4 h-4"/></button></div><div className="px-5 pb-5 -mt-11 relative"><div className="w-22 h-22 rounded-full bg-white p-1 shadow-lg"><div className="w-20 h-20 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-black overflow-hidden">{currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover"/> : currentUser.fullName?.charAt(0)?.toUpperCase()}</div></div><div className="mt-3 flex items-center gap-2 flex-wrap"><h1 className="text-xl font-black">{currentUser.companyName || currentUser.fullName}</h1><ShieldCheck className="w-5 h-5 text-emerald-600"/><span className="px-2 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-[10px] font-black">{roleLabel(currentUser.role)}</span></div>{currentUser.companyName && <p className="text-sm text-slate-600 mt-1">{currentUser.fullName}</p>}<div className="mt-4 grid gap-2 text-sm text-slate-600"><div className="flex gap-2"><Mail className="w-4 h-4"/>{currentUser.email}</div>{currentUser.phone && <div className="flex gap-2"><Phone className="w-4 h-4"/>{currentUser.phone}</div>}<div className="flex gap-2"><MapPin className="w-4 h-4"/>RDC · Profil ImmoSecureNet</div></div><div className="grid grid-cols-3 gap-2 mt-5"><div className="rounded-xl bg-slate-50 p-3 text-center"><div className="font-black text-lg">{myListings.length}</div><div className="text-[10px] text-slate-500">Publications</div></div><div className="rounded-xl bg-slate-50 p-3 text-center"><div className="font-black text-lg">{professional ? 'PRO' : 'STD'}</div><div className="text-[10px] text-slate-500">Profil</div></div><div className="rounded-xl bg-slate-50 p-3 text-center"><BadgeCheck className="w-5 h-5 mx-auto text-emerald-600"/><div className="text-[10px] text-slate-500 mt-1">Statut</div></div></div></div></section>

    {professional && <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">{professionalBlocks.map((block)=>{const Icon=block.icon;return <button key={block.title} onClick={block.action} className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm hover:border-blue-300"><div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Icon className="w-5 h-5"/></div><h2 className="font-black text-sm mt-3">{block.title}</h2><p className="text-[11px] text-slate-500 mt-1 leading-5">{block.text}</p></button>})}</section>}

    {standard && <section className="bg-white border border-blue-200 rounded-3xl p-5 shadow-sm"><div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Briefcase className="w-5 h-5"/></div><div className="flex-1"><h2 className="font-black text-slate-900">Créer un compte Business ou Professionnel</h2><p className="text-xs text-slate-500 mt-1">Passez d’un compte standard à un profil professionnel après validation.</p></div></div><button onClick={()=>setShowProfessional(!showProfessional)} className="mt-4 w-full py-3 rounded-xl bg-[#1e3a8a] text-white text-sm font-bold">Choisir mon profil professionnel</button>{showProfessional && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3"><button onClick={()=>request(UserRole.AGENT)} className="p-4 rounded-2xl border border-slate-200 text-left hover:border-[#1e3a8a]"><Briefcase className="w-5 h-5 text-[#1e3a8a] mb-2"/><div className="font-black text-sm">Agent / Agence</div><div className="text-[11px] text-slate-500 mt-1">Offres, clients, vérification et messagerie.</div></button><button onClick={()=>request(UserRole.OWNER)} className="p-4 rounded-2xl border border-slate-200 text-left hover:border-[#16a34a]"><Home className="w-5 h-5 text-[#16a34a] mb-2"/><div className="font-black text-sm">Bailleur / Propriétaire</div><div className="text-[11px] text-slate-500 mt-1">Biens, documents et services immobiliers.</div></button><button onClick={()=>request(UserRole.SELLER)} className="p-4 rounded-2xl border border-slate-200 text-left hover:border-amber-500"><Store className="w-5 h-5 text-amber-600 mb-2"/><div className="font-black text-sm">Vendeur / Magasin</div><div className="text-[11px] text-slate-500 mt-1">Boutique I-SHOP, catalogue et demandes clients.</div></button></div>}</section>}

    <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">{profileRows.map(r=>{const Icon=r.icon;return <button key={r.label} onClick={r.action} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50"><div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Icon className="w-5 h-5"/></div><div className="flex-1"><div className="font-bold text-sm">{r.label}</div><div className="text-[11px] text-slate-500">{r.subtitle}</div></div><ChevronRight className="w-4 h-4 text-slate-300"/></button>})}</section>
    <section className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3"><BarChart3 className="w-5 h-5 text-[#1e3a8a]"/><div><div className="font-black text-sm">Activité du compte</div><div className="text-xs text-slate-500">Publications, messages, rendez-vous et demandes seront centralisés ici.</div></div></section>
    <button onClick={logout} className="w-full py-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 font-bold text-sm flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/>Se déconnecter</button>
  </div>;
};

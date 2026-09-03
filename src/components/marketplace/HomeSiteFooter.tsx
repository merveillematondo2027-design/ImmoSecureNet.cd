import React from 'react';
import { Building2, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';

export const HomeSiteFooter: React.FC = () => {
  const { setActiveNavTab } = useProperties();
  return <footer className="mt-8 -mx-3 sm:-mx-6 lg:-mx-8 bg-[#0f172a] text-white">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div><div className="flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-emerald-400"/><div><div className="font-black text-lg">ImmoSecureNet</div><div className="text-[10px] tracking-[0.2em] text-slate-400 font-bold">MULTIMODAL</div></div></div><p className="text-xs text-slate-400 leading-5 mt-4">Le marché de l’habitat en ligne en toute sécurité. Immobilier, I-SHOP, expériences, services et partenaires dans une même plateforme.</p></div>
      <div><h3 className="font-black text-sm mb-4">ImmoSecureNet</h3><div className="grid gap-2 text-xs text-slate-300"><button onClick={()=>setActiveNavTab('about')} className="text-left hover:text-white">À propos de nous</button><button onClick={()=>setActiveNavTab('services')} className="text-left hover:text-white">Nos services</button><button onClick={()=>setActiveNavTab('contact')} className="text-left hover:text-white">Contactez-nous</button><button onClick={()=>setActiveNavTab('settings')} className="text-left hover:text-white">Paramètres & confidentialité</button></div></div>
      <div><h3 className="font-black text-sm mb-4">Accès rapide</h3><div className="grid gap-2 text-xs text-slate-300"><button onClick={()=>setActiveNavTab('marketplace')} className="text-left hover:text-white">Rechercher un bien</button><button onClick={()=>setActiveNavTab('furniture_marketplace')} className="text-left hover:text-white">I-SHOP</button><button onClick={()=>setActiveNavTab('hotel_partners')} className="text-left hover:text-white">Hôtels & expériences</button><button onClick={()=>setActiveNavTab('accounts')} className="text-left hover:text-white">Mon compte</button></div></div>
      <div><h3 className="font-black text-sm mb-4">Informations</h3><div className="space-y-3 text-xs text-slate-400"><p className="flex gap-2"><MapPin className="w-4 h-4 shrink-0 text-emerald-400"/>République démocratique du Congo</p><p className="flex gap-2"><Mail className="w-4 h-4 shrink-0 text-emerald-400"/>Contact officiel administrable depuis la plateforme</p><p className="flex gap-2"><Phone className="w-4 h-4 shrink-0 text-emerald-400"/>Assistance ImmoSecureNet</p><p className="flex gap-2"><Building2 className="w-4 h-4 shrink-0 text-emerald-400"/>Professionnels, propriétaires, vendeurs et partenaires</p></div></div>
    </div>
    <div className="border-t border-white/10 px-5 py-4 text-center text-[11px] text-slate-500">© 2026 ImmoSecureNet Multimodal — Tous droits réservés.</div>
  </footer>;
};

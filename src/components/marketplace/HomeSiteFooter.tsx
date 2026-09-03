import React from 'react';
import { Building2, Mail, MapPin, Phone, Search, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';

export const HomeSiteFooter: React.FC = () => {
  const { setActiveNavTab } = useProperties();
  const go = (tab: string) => setActiveNavTab(tab);

  return <footer className="mt-8 -mx-3 sm:-mx-6 lg:-mx-8 bg-[#0f172a] text-white">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-8 h-8 text-emerald-400"/><div><div className="font-black text-lg">ImmoSecureNet</div><div className="text-[10px] tracking-[0.2em] text-slate-400 font-bold">MULTIMODAL</div></div></div>
          <p className="text-xs text-slate-400 leading-5 mt-4">Le marché de l’habitat en ligne en toute sécurité. Immobilier, I-SHOP, expériences, services et partenaires réunis dans une même plateforme.</p>
          <button onClick={() => go('global_search')} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><Search className="w-4 h-4"/>Recherche générale</button>
        </div>

        <div>
          <h3 className="font-black text-sm mb-4 text-white">Explorer</h3>
          <div className="grid gap-2.5 text-xs text-slate-300">
            <button onClick={()=>go('marketplace')} className="text-left hover:text-white">Accueil immobilier</button>
            <button onClick={()=>go('furniture_marketplace')} className="text-left hover:text-white">I-SHOP</button>
            <button onClick={()=>go('hotel_partners')} className="text-left hover:text-white">Hôtels & expériences</button>
            <button onClick={()=>go('journal')} className="text-left hover:text-white">Journal immobilier & économique</button>
            <button onClick={()=>go('global_search')} className="text-left hover:text-white">Rechercher sur la plateforme</button>
          </div>
        </div>

        <div>
          <h3 className="font-black text-sm mb-4 text-white">Comptes & services</h3>
          <div className="grid gap-2.5 text-xs text-slate-300">
            <button onClick={()=>go('accounts')} className="text-left hover:text-white flex items-center gap-2"><Users className="w-3.5 h-3.5"/>Mon compte</button>
            <button onClick={()=>go('services')} className="text-left hover:text-white flex items-center gap-2"><Building2 className="w-3.5 h-3.5"/>Nos services</button>
            <button onClick={()=>go('furniture_marketplace')} className="text-left hover:text-white flex items-center gap-2"><ShoppingBag className="w-3.5 h-3.5"/>Boutiques I-SHOP</button>
            <button onClick={()=>go('about')} className="text-left hover:text-white">À propos de nous</button>
            <button onClick={()=>go('contact')} className="text-left hover:text-white">Contactez-nous</button>
          </div>
        </div>

        <div>
          <h3 className="font-black text-sm mb-4 text-white">Informations</h3>
          <div className="space-y-3 text-xs text-slate-400">
            <p className="flex gap-2"><MapPin className="w-4 h-4 shrink-0 text-emerald-400"/>République démocratique du Congo</p>
            <p className="flex gap-2"><Mail className="w-4 h-4 shrink-0 text-emerald-400"/>Contact officiel administrable depuis la plateforme</p>
            <p className="flex gap-2"><Phone className="w-4 h-4 shrink-0 text-emerald-400"/>Assistance ImmoSecureNet</p>
          </div>
          <div className="mt-5 grid gap-2 text-xs text-slate-300">
            <button onClick={()=>go('settings')} className="text-left hover:text-white">Paramètres & confidentialité</button>
            <button onClick={()=>go('contact')} className="text-left hover:text-white">Aide & support</button>
          </div>
        </div>
      </div>

      <div className="mt-9 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-slate-500">
        <span>© 2026 ImmoSecureNet Multimodal — Tous droits réservés.</span>
        <div className="flex flex-wrap gap-x-4 gap-y-2"><button onClick={()=>go('settings')} className="hover:text-slate-300">Confidentialité</button><button onClick={()=>go('settings')} className="hover:text-slate-300">Conditions d’utilisation</button><button onClick={()=>go('contact')} className="hover:text-slate-300">Support</button></div>
      </div>
    </div>
  </footer>;
};

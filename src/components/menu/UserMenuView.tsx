import React from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  CalendarCheck,
  ShoppingCart,
  Heart,
  Settings,
  LogOut,
  LogIn,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

interface UserMenuViewProps {
  onOpenAuth?: (mode: 'LOGIN' | 'REGISTER') => void;
}

export const UserMenuView: React.FC<UserMenuViewProps> = ({ onOpenAuth }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { setActiveNavTab, showToast } = useProperties();

  const openSoon = (label: string) => showToast(`${label} sera relié à votre compte personnel.`, 'info');

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="pb-24 max-w-xl mx-auto space-y-4">
        <section className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-4">Mon compte</h1>
          <p className="text-sm text-slate-500 mt-2">Connectez-vous pour retrouver votre profil, vos favoris, vos rendez-vous, votre panier et vos publications.</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button onClick={() => onOpenAuth?.('LOGIN')} className="py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> Se connecter</button>
            <button onClick={() => onOpenAuth?.('REGISTER')} className="py-3 rounded-xl border border-[#1e3a8a] text-[#1e3a8a] font-bold text-sm">Créer un compte</button>
          </div>
        </section>
      </div>
    );
  }

  const initial = currentUser.fullName?.charAt(0)?.toUpperCase() || 'U';

  const rows = [
    { label: 'Mes publications', subtitle: 'Biens et annonces que vous avez publiés', icon: Building2, action: () => setActiveNavTab('owner_properties') },
    { label: 'Favoris', subtitle: 'Vos annonces enregistrées', icon: Heart, action: () => openSoon('Favoris') },
    { label: 'Mes rendez-vous', subtitle: 'Visites et rendez-vous programmés', icon: CalendarCheck, action: () => openSoon('Mes rendez-vous') },
    { label: 'Mon panier', subtitle: 'Tous les articles et biens ajoutés pour achat', icon: ShoppingCart, action: () => openSoon('Mon panier') },
    { label: 'Paramètres', subtitle: 'Sécurité, confidentialité et préférences', icon: Settings, action: () => openSoon('Paramètres') },
  ];

  return (
    <div className="pb-24 max-w-xl mx-auto space-y-4">
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-28 bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-[#16a34a]" />
        <div className="px-5 pb-5 -mt-10">
          <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-black overflow-hidden">
              {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" /> : initial}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{currentUser.fullName}</h1>
              {String(currentUser.verificationStatus) === 'VERIFIED' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">{currentUser.role}</p>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span className="truncate">{currentUser.email}</span></div>
            {currentUser.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{currentUser.phone}</span></div>}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <button key={row.label} type="button" onClick={row.action} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0"><div className="font-bold text-sm text-slate-900">{row.label}</div><div className="text-[11px] text-slate-500 mt-0.5">{row.subtitle}</div></div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          );
        })}
      </section>

      <button onClick={logout} className="w-full py-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 font-bold text-sm flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Se déconnecter</button>
    </div>
  );
};

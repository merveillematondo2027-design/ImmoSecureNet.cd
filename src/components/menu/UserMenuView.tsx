import React, { useState } from 'react';
import {
  User,
  Search,
  BriefcaseBusiness,
  Info,
  Phone,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  LogIn,
  Building2,
  Home,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Landmark,
  Handshake,
  Scale,
  HardHat,
  BadgeDollarSign,
  Eye,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

interface UserMenuViewProps {
  onOpenAuth?: (mode: 'LOGIN' | 'REGISTER') => void;
}

type MenuSection = 'accounts' | 'search' | 'services' | 'about' | 'contact' | null;

export const UserMenuView: React.FC<UserMenuViewProps> = ({ onOpenAuth }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { setActiveNavTab, setFilters, resetFilters, showToast } = useProperties();
  const [openSection, setOpenSection] = useState<MenuSection>(null);

  const toggle = (section: MenuSection) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const goToMarketplace = (listingType?: 'SALE' | 'RENT') => {
    resetFilters();
    if (listingType) {
      setFilters((prev) => ({ ...prev, listingType }));
    }
    setActiveNavTab('marketplace');
  };

  const unavailable = (label: string) => {
    showToast(`${label} sera disponible dans cette rubrique.`, 'info');
  };

  const sectionButton = (
    section: Exclude<MenuSection, null>,
    icon: React.ReactNode,
    title: string,
    subtitle: string,
  ) => (
    <button
      type="button"
      onClick={() => toggle(section)}
      className="w-full flex items-center gap-3 p-4 text-left bg-white hover:bg-slate-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-slate-900">{title}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
      </div>
      {openSection === section ? (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );

  const subItem = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white transition-colors border-t border-slate-100"
    >
      <div className="text-slate-500">{icon}</div>
      <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );

  return (
    <div className="pb-24 max-w-3xl mx-auto space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-black text-[#1e3a8a]">Menu</h1>
        <p className="text-xs text-slate-500 mt-1">Accédez simplement aux principales rubriques ImmoSecureNet.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
        <div>
          {sectionButton('accounts', <User className="w-5 h-5" />, 'Mes comptes', 'Compte utilisateur, professionnel ou partenaire')}
          {openSection === 'accounts' && (
            <div className="bg-slate-50">
              {isAuthenticated ? (
                <>
                  {subItem('Voir mon profil', <User className="w-4 h-4" />, () => unavailable('Profil'))}
                  {subItem('Mes biens et publications', <Building2 className="w-4 h-4" />, () => setActiveNavTab('owner_properties'))}
                  {subItem('Mes réservations', <ShoppingBag className="w-4 h-4" />, () => unavailable('Mes réservations'))}
                </>
              ) : (
                <>
                  {subItem('Se connecter', <LogIn className="w-4 h-4" />, () => onOpenAuth?.('LOGIN'))}
                  {subItem('Créer un compte', <User className="w-4 h-4" />, () => onOpenAuth?.('REGISTER'))}
                </>
              )}
            </div>
          )}
        </div>

        <div>
          {sectionButton('search', <Search className="w-5 h-5" />, 'Rechercher', 'Biens, marché de l’habitat et expériences')}
          {openSection === 'search' && (
            <div className="bg-slate-50">
              {subItem('Biens à vendre', <Home className="w-4 h-4" />, () => goToMarketplace('SALE'))}
              {subItem('Biens à louer', <MapPin className="w-4 h-4" />, () => goToMarketplace('RENT'))}
              {subItem("Articles du marché de l’habitat", <ShoppingBag className="w-4 h-4" />, () => unavailable("Marché de l’habitat"))}
              {subItem('Expériences', <HeartHandshake className="w-4 h-4" />, () => unavailable('Expériences'))}
            </div>
          )}
        </div>

        <div>
          {sectionButton('services', <BriefcaseBusiness className="w-5 h-5" />, 'Nos Services', 'Sécurité, immobilier, conseil et financement')}
          {openSection === 'services' && (
            <div className="bg-slate-50">
              {subItem('Publicité', <BadgeDollarSign className="w-4 h-4" />, () => unavailable('Publicité'))}
              {subItem('Vérification et authentification des agents ou agences immobilières', <ShieldCheck className="w-4 h-4" />, () => unavailable('Vérification des professionnels'))}
              {subItem('Vérification et traçabilité des biens et des transactions', <ShieldCheck className="w-4 h-4" />, () => unavailable('Traçabilité'))}
              {subItem('Mise en relation : vente, achat ou location', <Handshake className="w-4 h-4" />, () => unavailable('Mise en relation'))}
              {subItem('Gestion immobilière et gestion locative', <Building2 className="w-4 h-4" />, () => unavailable('Gestion immobilière'))}
              {subItem('Audits, conseil juridique ou accompagnement administratif', <Scale className="w-4 h-4" />, () => unavailable('Audits et conseil'))}
              {subItem('Études immobilières, architecture, ingénierie et construction', <HardHat className="w-4 h-4" />, () => unavailable('Études et construction'))}
              {subItem('Financement immobilier', <Landmark className="w-4 h-4" />, () => unavailable('Financement immobilier'))}
            </div>
          )}
        </div>

        <div>
          {sectionButton('about', <Info className="w-5 h-5" />, 'À propos de nous', 'Découvrez ImmoSecureNet')}
          {openSection === 'about' && (
            <div className="bg-slate-50">
              {subItem('Notre philosophie', <Eye className="w-4 h-4" />, () => unavailable('Notre philosophie'))}
              {subItem('Notre vision', <Eye className="w-4 h-4" />, () => unavailable('Notre vision'))}
              {subItem('Nos valeurs', <HeartHandshake className="w-4 h-4" />, () => unavailable('Nos valeurs'))}
            </div>
          )}
        </div>

        <div>
          {sectionButton('contact', <Phone className="w-5 h-5" />, 'Contactez-nous', 'Coordonnées et assistance')}
          {openSection === 'contact' && (
            <div className="bg-slate-50">
              {subItem('Coordonnées', <Phone className="w-4 h-4" />, () => unavailable('Coordonnées'))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => unavailable('Paramètres')}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 border-b border-slate-100"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm text-slate-900">Paramètres</div>
            <div className="text-[11px] text-slate-500">Préférences de l’application</div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {isAuthenticated && currentUser ? (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-lg">
                {currentUser.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 truncate">{currentUser.fullName}</div>
                <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                <button type="button" onClick={() => unavailable('Profil')} className="text-xs font-bold text-[#1e3a8a] mt-1">Voir le profil</button>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full py-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 border border-rose-100"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="font-bold text-sm text-slate-900">Profil</div>
            <p className="text-xs text-slate-500 mt-1 mb-3">Connectez-vous pour publier, gérer vos réservations, vos messages et vos informations.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.('LOGIN')}
                className="py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('REGISTER')}
                className="py-3 rounded-xl bg-white text-[#1e3a8a] border border-[#1e3a8a] font-bold text-sm"
              >
                S’inscrire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

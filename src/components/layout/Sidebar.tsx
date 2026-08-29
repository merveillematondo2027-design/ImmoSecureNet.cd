import React from 'react';
import { Home, Search, Store, BedDouble, Plane, Heart, CalendarCheck, ShoppingCart, User, Settings } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';

export const Sidebar: React.FC = () => {
  const { activeNavTab, setActiveNavTab, showToast } = useProperties();
  const isMobileMenuOpen = activeNavTab === 'navigation';
  const goHome = () => setActiveNavTab('marketplace');
  const goSearch = () => { setActiveNavTab('marketplace'); window.setTimeout(() => document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); };
  const openComingSection = (label: string) => { setActiveNavTab('menu'); showToast(`${label} : cet espace personnel sera relié à vos données.`, 'info'); };
  const navItems = [
    { id: 'home', label: 'ACCUEIL', icon: Home, action: goHome },
    { id: 'search', label: 'CHERCHER', icon: Search, action: goSearch },
    { id: 'furniture', label: 'MOBILIERS', icon: Store, action: () => setActiveNavTab('furniture_marketplace') },
    { id: 'hotels', label: 'HÔTELS', icon: BedDouble, action: () => setActiveNavTab('hotel_partners') },
    { id: 'connectivity', label: 'COMPAGNIES AÉRIENNES & CONNECTIVITÉ', icon: Plane, action: () => setActiveNavTab('connectivity_partners') },
    { id: 'favorites', label: 'FAVORIS', icon: Heart, action: () => openComingSection('Favoris') },
    { id: 'appointments', label: 'MES RENDEZ-VOUS', icon: CalendarCheck, action: () => openComingSection('Mes rendez-vous') },
    { id: 'cart', label: 'MON PANIER', icon: ShoppingCart, action: () => openComingSection('Mon panier') },
    { id: 'account', label: 'MON COMPTE', icon: User, action: () => setActiveNavTab('menu') },
    { id: 'settings', label: 'PARAMÈTRES', icon: Settings, action: () => openComingSection('Paramètres') },
  ];
  return <aside className={`fixed inset-0 z-50 md:relative md:flex flex-col w-[86vw] max-w-sm md:w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] text-slate-800 shadow-xl md:shadow-xs transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
    <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-slate-200"><span className="font-black text-xl text-[#1e3a8a]">MENU</span><button onClick={goHome} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl font-bold" aria-label="Fermer le menu">×</button></div>
    <nav className="flex-1 overflow-y-auto py-2">{navItems.map((item) => { const Icon = item.icon; const isActive = (item.id === 'home' && activeNavTab === 'marketplace') || (item.id === 'furniture' && activeNavTab === 'furniture_marketplace') || (item.id === 'hotels' && activeNavTab === 'hotel_partners') || (item.id === 'connectivity' && activeNavTab === 'connectivity_partners') || (item.id === 'account' && activeNavTab === 'menu'); return <button key={item.id} type="button" onClick={item.action} className={`w-full flex items-center gap-4 px-5 py-4 text-left border-b border-slate-100 transition-colors ${isActive ? 'bg-blue-50 text-[#1e3a8a]' : 'text-slate-700 hover:bg-slate-50'}`}><Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1e3a8a]' : 'text-slate-400'}`} /><span className="text-sm font-bold tracking-wide">{item.label}</span></button>; })}</nav>
  </aside>;
};

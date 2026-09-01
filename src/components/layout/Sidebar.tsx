import React from 'react';
import { Search, Users, BriefcaseBusiness, Info, Phone, Settings } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';

export const Sidebar: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useProperties();
  const isMobileMenuOpen = activeNavTab === 'navigation';

  const goSearch = () => {
    setActiveNavTab('marketplace');
    window.setTimeout(() => {
      document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const navItems = [
    { id: 'search', label: 'RECHERCHER', icon: Search, action: goSearch },
    { id: 'accounts', label: 'MES COMPTES', icon: Users, action: () => setActiveNavTab('accounts') },
    { id: 'services', label: 'NOS SERVICES', icon: BriefcaseBusiness, action: () => setActiveNavTab('services') },
    { id: 'about', label: 'À PROPOS DE NOUS', icon: Info, action: () => setActiveNavTab('about') },
    { id: 'contact', label: 'CONTACTEZ-NOUS', icon: Phone, action: () => setActiveNavTab('contact') },
    { id: 'settings', label: 'PARAMÈTRES', icon: Settings, action: () => setActiveNavTab('settings') },
  ];

  return (
    <aside className={`fixed inset-0 z-50 md:relative md:flex flex-col w-[86vw] max-w-sm md:w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] text-slate-800 shadow-xl md:shadow-xs transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <span className="font-black text-xl text-[#1e3a8a]">MENU</span>
        <button onClick={() => setActiveNavTab('marketplace')} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl font-bold" aria-label="Fermer le menu">×</button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;
          return (
            <button key={item.id} type="button" onClick={item.action} className={`w-full flex items-center gap-4 px-5 py-4 text-left border-b border-slate-100 transition-colors ${isActive ? 'bg-blue-50 text-[#1e3a8a]' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1e3a8a]' : 'text-slate-400'}`} />
              <span className="text-sm font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

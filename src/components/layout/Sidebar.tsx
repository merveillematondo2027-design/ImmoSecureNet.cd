import React, { useState } from 'react';
import { Home, Search, ChevronDown, User, Heart, MessageSquare, Plus, CheckCircle2, Building2, HardHat, Sofa, Lightbulb, Shield, BookOpen, FileText, CalendarCheck, FileSignature } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { activeNavTab, setActiveNavTab } = useProperties();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // We show this only if activeNavTab === 'navigation' on mobile, or always on desktop
  const isMobileMenuOpen = activeNavTab === 'navigation';

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const navItems = [
    { id: 'marketplace', label: 'ACCUEIL', icon: Home },
    { id: 'search', label: 'RECHERCHER', icon: Search },
    { 
      id: 'trouver', label: 'TROUVER', icon: Search,
      subItems: ['Location', 'Vente', 'Achat', 'Maisons', 'Appartements', 'Terrains', 'Immeubles', 'Bureaux', 'Commerces']
    },
    {
      id: 'construire', label: 'CONSTRUIRE', icon: HardHat,
      subItems: ['Terrains', 'Constructeurs', 'Matériaux', 'Financement', 'Suivi de chantier']
    },
    {
      id: 'equiper', label: 'ÉQUIPER', icon: Sofa,
      subItems: ['Électroménager', 'Solaire', 'Groupes électrogènes', 'Batteries', 'Onduleurs']
    },
    {
      id: 'amenager', label: 'AMÉNAGER', icon: Lightbulb,
      subItems: ['Meubles', 'Décoration', 'Cuisine', 'Climatisation', 'Équipements']
    },
    {
      id: 'securiser', label: 'SÉCURISER', icon: Shield,
      subItems: ['Biens vérifiés', 'Professionnels vérifiés', 'Courtiers', 'Visites', 'Contrats numériques']
    },
    { id: 'favorites', label: 'MES FAVORIS', icon: Heart },
    { id: 'journal', label: 'JOURNAL', icon: BookOpen },
    { id: 'publish', label: 'PUBLIER', icon: Plus },
    { id: 'messages', label: 'MESSAGES', icon: MessageSquare },
    { id: 'menu', label: 'MON COMPTE', icon: User },
    { id: 'owner_properties', label: 'MES ANNONCES', icon: Building2 },
    { id: 'reservations', label: 'MES RÉSERVATIONS', icon: CalendarCheck },
    { id: 'contracts', label: 'MES CONTRATS', icon: FileSignature },
    { id: 'documents', label: 'MES DOCUMENTS', icon: FileText },
  ];

  return (
    <aside className={`fixed inset-0 z-50 md:relative md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] text-slate-800 shadow-xs transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* Mobile Close Button & Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200">
        <span className="font-bold text-[#1e3a8a]">MENU</span>
        <button onClick={() => setActiveNavTab('marketplace')} className="text-slate-500 hover:text-slate-900 font-bold text-xl">&times;</button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isActive = activeNavTab === item.id;

          return (
            <div key={item.id} className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleSection(item.id);
                  } else {
                    if (item.id === 'publish') {
                      setActiveNavTab(isAuthenticated ? 'owner_properties' : 'menu');
                    } else {
                      setActiveNavTab(item.id);
                    }
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  isActive ? 'text-[#1e3a8a] font-bold bg-blue-50/50' : 'text-slate-700 font-semibold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* <item.icon className={`w-5 h-5 ${isActive ? 'text-[#1e3a8a]' : 'text-slate-400'}`} /> */}
                  <span className="text-xs tracking-wide">{item.label}</span>
                </div>
                {hasSubItems && (
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSection === item.id ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {hasSubItems && openSection === item.id && (
                <div className="bg-slate-50 py-2 px-4 space-y-1 border-t border-slate-100">
                  {item.subItems.map((sub, idx) => (
                    <button key={idx} className="block w-full text-left py-2 px-2 text-[11px] font-medium text-slate-600 hover:text-[#1e3a8a] hover:bg-blue-50/50 rounded-md">
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

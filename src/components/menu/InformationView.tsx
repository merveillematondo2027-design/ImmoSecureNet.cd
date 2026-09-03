import React from 'react';
import { ArrowRight, BriefcaseBusiness, Info, Phone, Settings } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';

type Kind = 'services' | 'about' | 'contact' | 'settings';

const serviceItems = [
  { key: 'contracts', label: 'Enregistrement et vérification des contrats' },
  { key: 'verification', label: 'Vérification et authentification des agents/agences immobilières' },
  { key: 'relation', label: 'Mise en relation pour la vente, l’achat ou la location' },
  { key: 'studies', label: 'Études immobilières, architecture, ingénierie et construction' },
  { key: 'finance', label: 'Financement immobilier' },
  { key: 'insurance', label: 'Assurance immobilière et autres' },
  { key: 'ads', label: 'Publicité' },
  { key: 'audit', label: 'Audits, conseil juridique et accompagnement administratif' },
];

export const InformationView: React.FC<{ kind: Kind }> = ({ kind }) => {
  const { setActiveNavTab } = useProperties();
  const openService = (key: string) => {
    sessionStorage.setItem('immosecure_service_module', key);
    setActiveNavTab('service_module');
  };

  if (kind === 'services') {
    return <div className="max-w-3xl mx-auto pb-24 space-y-4"><div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><BriefcaseBusiness className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Nos services</h1><p className="text-sm text-slate-500 mt-1">Chaque service dispose maintenant de son propre parcours. Sélectionnez un service pour ouvrir son module.</p></div><div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">{serviceItems.map((item, index)=><button key={item.key} onClick={() => openService(item.key)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50"><div className="w-9 h-9 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-black shrink-0">{index+1}</div><p className="text-sm font-semibold text-slate-800 leading-6 flex-1">{item.label}</p><ArrowRight className="w-4 h-4 text-slate-400"/></button>)}</div></div>;
  }

  if (kind === 'about') {
    return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Info className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">À propos de nous</h1><div className="mt-5 space-y-5 text-sm text-slate-600 leading-6"><div><h2 className="font-black text-slate-900">Notre philosophie</h2><p>Faciliter l’accès à l’habitat et aux services immobiliers dans un environnement plus clair, organisé et sécurisé.</p></div><div><h2 className="font-black text-slate-900">Notre vision</h2><p>Construire une plateforme immobilière multimodale de référence reliant utilisateurs, propriétaires, professionnels, vendeurs et partenaires.</p></div><div><h2 className="font-black text-slate-900">Nos valeurs</h2><p>Sécurité, traçabilité, transparence, professionnalisme et accessibilité.</p></div><div><h2 className="font-black text-slate-900">Notre écosystème</h2><p>Immobilier, I-SHOP, expériences, partenaires, services professionnels et messagerie dans une seule plateforme.</p></div></div></section></div>;
  }

  if (kind === 'contact') {
    return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Phone className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Contactez-nous</h1><p className="text-sm text-slate-500 mt-2">Retrouvez ici les coordonnées officielles, l’assistance et les moyens de contacter ImmoSecureNet. Ces informations restent administrables depuis l’espace de gestion.</p></section></div>;
  }

  return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Settings className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Paramètres</h1><p className="text-sm text-slate-500 mt-2">Sécurité, confidentialité, notifications et préférences de l’application.</p></section></div>;
};

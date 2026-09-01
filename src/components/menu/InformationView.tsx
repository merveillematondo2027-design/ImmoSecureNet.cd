import React from 'react';
import { BriefcaseBusiness, Info, Phone, Settings } from 'lucide-react';

type Kind = 'services' | 'about' | 'contact' | 'settings';

const serviceItems = [
  'Enregistrement des contrats de vente et des contrats de bail',
  'Vérification et authentification des agents et agences immobilières',
  'Mise en relation pour la vente, l’achat ou la location',
  'Études immobilières, architecture, ingénierie et construction',
  'Financement immobilier',
  'Assurance immobilière et autres',
  'Publicité immobilière',
  'Audits, conseil juridique et accompagnement administratif',
];

export const InformationView: React.FC<{ kind: Kind }> = ({ kind }) => {
  if (kind === 'services') {
    return <div className="max-w-2xl mx-auto pb-24 space-y-4"><div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><BriefcaseBusiness className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Nos services</h1><p className="text-sm text-slate-500 mt-1">Les services proposés par ImmoSecureNet.</p></div><div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">{serviceItems.map((item, index)=><div key={item} className="p-4 flex gap-3"><div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-black shrink-0">{index+1}</div><p className="text-sm font-semibold text-slate-800 leading-6">{item}</p></div>)}</div></div>;
  }

  if (kind === 'about') {
    return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Info className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">À propos de nous</h1><div className="mt-5 space-y-5 text-sm text-slate-600 leading-6"><div><h2 className="font-black text-slate-900">Notre philosophie</h2><p>Faciliter l’accès à l’habitat et aux services immobiliers dans un environnement plus clair, organisé et sécurisé.</p></div><div><h2 className="font-black text-slate-900">Notre vision</h2><p>Construire une plateforme immobilière multimodale de référence reliant utilisateurs, propriétaires, professionnels et partenaires.</p></div><div><h2 className="font-black text-slate-900">Nos valeurs</h2><p>Sécurité, traçabilité, transparence, professionnalisme et accessibilité.</p></div></div></section></div>;
  }

  if (kind === 'contact') {
    return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Phone className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Contactez-nous</h1><p className="text-sm text-slate-500 mt-2">Les coordonnées officielles seront administrables depuis l’espace de gestion ImmoSecureNet.</p></section></div>;
  }

  return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Settings className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Paramètres</h1><p className="text-sm text-slate-500 mt-2">Sécurité, confidentialité, notifications et préférences de l’application.</p></section></div>;
};

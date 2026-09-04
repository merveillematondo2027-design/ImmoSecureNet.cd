import React, { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowRight, BriefcaseBusiness, Info, Phone, Settings, Bell, ShieldCheck, Globe2, UserCog, Save } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { UserRole } from '../../types';

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

const roleName = (role?: UserRole) => {
  if (role === UserRole.AGENT) return 'Agent immobilier';
  if (role === UserRole.AGENCY) return 'Agence immobilière';
  if (role === UserRole.OWNER) return 'Bailleur / Propriétaire';
  if (role === UserRole.SELLER) return 'Vendeur / Magasin I-SHOP';
  if (role === UserRole.ADMIN) return 'Administrateur';
  return 'Utilisateur standard';
};

export const InformationView: React.FC<{ kind: Kind }> = ({ kind }) => {
  const { setActiveNavTab, showToast } = useProperties();
  const { currentUser } = useAuth();
  const openService = (key: string) => {
    sessionStorage.setItem('immosecure_service_module', key);
    setActiveNavTab('service_module');
  };

  if (kind === 'services') {
    return <div className="max-w-3xl mx-auto pb-24 space-y-4"><div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><BriefcaseBusiness className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Nos services</h1><p className="text-sm text-slate-500 mt-1">Chaque service dispose de son propre parcours. Sélectionnez un service pour ouvrir son module.</p></div><div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">{serviceItems.map((item, index)=><button key={item.key} onClick={() => openService(item.key)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50"><div className="w-9 h-9 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-black shrink-0">{index+1}</div><p className="text-sm font-semibold text-slate-800 leading-6 flex-1">{item.label}</p><ArrowRight className="w-4 h-4 text-slate-400"/></button>)}</div></div>;
  }

  if (kind === 'about') {
    return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Info className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">À propos de nous</h1><div className="mt-5 space-y-5 text-sm text-slate-600 leading-6"><div><h2 className="font-black text-slate-900">Notre philosophie</h2><p>Faciliter l’accès à l’habitat et aux services immobiliers dans un environnement plus clair, organisé et sécurisé.</p></div><div><h2 className="font-black text-slate-900">Notre vision</h2><p>Construire une plateforme immobilière multimodale de référence reliant utilisateurs, propriétaires, professionnels, vendeurs et partenaires.</p></div><div><h2 className="font-black text-slate-900">Nos valeurs</h2><p>Sécurité, traçabilité, transparence, professionnalisme et accessibilité.</p></div><div><h2 className="font-black text-slate-900">Notre écosystème</h2><p>Immobilier, I-SHOP, expériences, partenaires, services professionnels et messagerie dans une seule plateforme.</p></div></div></section></div>;
  }

  if (kind === 'contact') {
    return <div className="max-w-2xl mx-auto pb-24"><section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Phone className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Contactez-nous</h1><p className="text-sm text-slate-500 mt-2">Retrouvez ici les coordonnées officielles, l’assistance et les moyens de contacter ImmoSecureNet. Ces informations restent administrables depuis l’espace de gestion.</p><button onClick={() => setActiveNavTab('messages')} className="mt-5 w-full py-3 rounded-xl bg-[#1e3a8a] text-white font-black">Ouvrir la messagerie</button></section></div>;
  }

  return <SettingsPanel currentUser={currentUser as any} onBack={() => setActiveNavTab('accounts')} showToast={showToast} />;
};

const SettingsPanel: React.FC<{ currentUser: any; onBack: () => void; showToast: (message: string, type?: 'success'|'error'|'info') => void }> = ({ currentUser, onBack, showToast }) => {
  const initial = currentUser?.preferences || {};
  const [notifications, setNotifications] = useState(initial.notifications !== false);
  const [marketing, setMarketing] = useState(initial.marketing === true);
  const [profileVisible, setProfileVisible] = useState(initial.profileVisible !== false);
  const [language, setLanguage] = useState(initial.language || 'fr');
  const [saving, setSaving] = useState(false);
  const professional = useMemo(() => currentUser && [UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER, UserRole.SELLER].includes(currentUser.role), [currentUser?.role]);

  const save = async () => {
    if (!currentUser?.id) { showToast('Connectez-vous pour enregistrer vos préférences.', 'info'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { preferences: { notifications, marketing, profileVisible, language } });
      showToast('Paramètres enregistrés.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Impossible d’enregistrer les paramètres.', 'error');
    } finally { setSaving(false); }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (value:boolean)=>void }) => <button type="button" onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full p-1 transition ${value ? 'bg-[#16a34a]' : 'bg-slate-300'}`}><span className={`block w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`}/></button>;

  return <div className="max-w-3xl mx-auto pb-24 space-y-4">
    <button onClick={onBack} className="text-sm font-black text-[#1e3a8a]">← Retour au profil</button>
    <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Settings className="w-6 h-6"/></div><h1 className="text-2xl font-black mt-4">Paramètres</h1><p className="text-sm text-slate-500 mt-2">Réglages adaptés à votre type de compte : <strong>{roleName(currentUser?.role)}</strong>.</p></section>

    <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
      <div className="p-4 flex items-center gap-3"><Bell className="w-5 h-5 text-[#1e3a8a]"/><div className="flex-1"><div className="font-black text-sm">Notifications</div><div className="text-xs text-slate-500">Messages, rendez-vous, contrats et nouvelles importantes.</div></div><Toggle value={notifications} onChange={setNotifications}/></div>
      <div className="p-4 flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#1e3a8a]"/><div className="flex-1"><div className="font-black text-sm">Visibilité du profil</div><div className="text-xs text-slate-500">Autoriser l’affichage public de votre profil lorsque cela est utile.</div></div><Toggle value={profileVisible} onChange={setProfileVisible}/></div>
      <div className="p-4 flex items-center gap-3"><Globe2 className="w-5 h-5 text-[#1e3a8a]"/><div className="flex-1"><div className="font-black text-sm">Langue</div><div className="text-xs text-slate-500">Langue principale de l’interface.</div></div><select value={language} onChange={(e)=>setLanguage(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm"><option value="fr">Français</option><option value="en">English</option></select></div>
      <div className="p-4 flex items-center gap-3"><UserCog className="w-5 h-5 text-[#1e3a8a]"/><div className="flex-1"><div className="font-black text-sm">Communications commerciales</div><div className="text-xs text-slate-500">Recevoir des offres et nouveautés I-SHOP/partenaires.</div></div><Toggle value={marketing} onChange={setMarketing}/></div>
    </section>

    {professional && <section className="bg-blue-50 border border-blue-100 rounded-3xl p-5"><h2 className="font-black text-[#1e3a8a]">Réglages professionnels</h2><p className="text-xs text-slate-600 mt-2">Les informations publiques de votre activité, vos publications, votre messagerie et vos documents sont gérés depuis votre profil professionnel.</p></section>}

    <button disabled={saving} onClick={() => void save()} className="w-full py-3.5 rounded-2xl bg-[#1e3a8a] text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"><Save className="w-4 h-4"/>{saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}</button>
  </div>;
};

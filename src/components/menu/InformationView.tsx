import React, { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowRight, BriefcaseBusiness, Info, Phone, Settings, Bell, ShieldCheck, Globe2, UserCog, Save, Building2, Headphones, Mail, MessageCircle, MapPin, Sparkles, LockKeyhole, BadgeCheck, FileCheck2, Handshake, Wrench, Banknote, Megaphone, Scale } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { UserRole } from '../../types';

type Kind = 'services' | 'about' | 'contact' | 'settings';

const serviceItems = [
  { key: 'contracts', label: 'Enregistrement et vérification des contrats', desc: 'Contrats de bail et de vente, contrôle et traçabilité.', icon: FileCheck2 },
  { key: 'verification', label: 'Vérification des agents et agences', desc: 'Consultez les professionnels enregistrés sur la plateforme.', icon: BadgeCheck },
  { key: 'relation', label: 'Mise en relation', desc: 'Vente, achat et location avec les bons interlocuteurs.', icon: Handshake },
  { key: 'studies', label: 'Études, architecture et construction', desc: 'Études techniques, conception, ingénierie et travaux.', icon: Wrench },
  { key: 'finance', label: 'Financement immobilier', desc: 'Orientation vers des solutions adaptées à votre projet.', icon: Banknote },
  { key: 'insurance', label: 'Assurance immobilière', desc: 'Protection des biens, projets et opérations immobilières.', icon: ShieldCheck },
  { key: 'ads', label: 'Publicité', desc: 'Mettez en avant un bien, une entreprise, un service ou une activité.', icon: Megaphone },
  { key: 'audit', label: 'Audit, juridique et administratif', desc: 'Analyse, conseil juridique et accompagnement administratif.', icon: Scale },
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
    return <div className="max-w-5xl mx-auto pb-24 space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#173b8f] via-[#0d68b4] to-[#00a66c] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-14 w-48 h-48 rounded-full bg-white/10"/>
        <div className="relative max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center"><BriefcaseBusiness className="w-6 h-6"/></div>
          <h1 className="text-2xl sm:text-3xl font-black mt-4">Nos services</h1>
          <p className="text-sm sm:text-base text-white/80 mt-2 leading-6">Des parcours professionnels pour sécuriser, accompagner et accélérer vos projets immobiliers.</p>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {serviceItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.key} onClick={() => openService(item.key)} className="group bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0 group-hover:bg-[#1e3a8a] group-hover:text-white transition"><Icon className="w-5 h-5"/></div>
              <div className="min-w-0 flex-1"><h2 className="font-black text-slate-900 leading-5">{item.label}</h2><p className="text-xs text-slate-500 mt-2 leading-5">{item.desc}</p></div>
              <ArrowRight className="w-4 h-4 text-slate-400 mt-1 shrink-0"/>
            </div>
          </button>;
        })}
      </section>
    </div>;
  }

  if (kind === 'about') {
    return <div className="max-w-5xl mx-auto pb-24 space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Info className="w-7 h-7"/></div><div><p className="text-xs font-black uppercase tracking-widest text-[#00a66c]">ImmoSecureNet Multimodal</p><h1 className="text-2xl sm:text-3xl font-black mt-1">À propos de nous</h1></div></div>
        <p className="text-sm text-slate-600 mt-5 leading-7 max-w-3xl">ImmoSecureNet réunit l’immobilier, les services professionnels, les partenaires, I-SHOP, les expériences et la messagerie dans une seule plateforme pensée pour rendre le marché de l’habitat plus accessible, organisé et sécurisé.</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {[
          ['Notre mission','Faciliter l’accès à l’habitat et connecter chaque utilisateur au bon bien, au bon professionnel ou au bon service.', Building2],
          ['Notre vision','Construire une plateforme immobilière multimodale de référence reliant utilisateurs, propriétaires, professionnels, vendeurs et partenaires.', Sparkles],
          ['Nos valeurs','Sécurité, traçabilité, transparence, professionnalisme et accessibilité.', ShieldCheck],
          ['Notre engagement','Créer un environnement où les informations, les échanges et les démarches restent plus clairs et mieux structurés.', LockKeyhole],
        ].map(([title, text, Icon]: any)=><article key={title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="w-10 h-10 rounded-xl bg-slate-50 text-[#1e3a8a] flex items-center justify-center"><Icon className="w-5 h-5"/></div><h2 className="font-black mt-4">{title}</h2><p className="text-sm text-slate-500 mt-2 leading-6">{text}</p></article>)}
      </section>
    </div>;
  }

  if (kind === 'contact') {
    return <div className="max-w-5xl mx-auto pb-24 space-y-5">
      <section className="rounded-[28px] bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Headphones className="w-7 h-7"/></div><div><p className="text-xs font-black uppercase tracking-widest text-[#00a66c]">Assistance ImmoSecureNet</p><h1 className="text-2xl sm:text-3xl font-black mt-1">Contactez-nous</h1></div></div>
        <p className="text-sm text-slate-500 mt-5 leading-6 max-w-2xl">Besoin d’aide sur un compte, un bien, un contrat, une publication ou un service ? Choisissez le canal qui vous convient.</p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <button onClick={() => setActiveNavTab('messages')} className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition"><MessageCircle className="w-6 h-6 text-[#1e3a8a]"/><h2 className="font-black mt-4">Messagerie</h2><p className="text-xs text-slate-500 mt-2 leading-5">Discutez directement avec l’équipe depuis votre compte.</p><span className="inline-flex items-center gap-1 text-xs font-black text-[#1e3a8a] mt-4">Ouvrir <ArrowRight className="w-3 h-3"/></span></button>
        <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><Mail className="w-6 h-6 text-[#1e3a8a]"/><h2 className="font-black mt-4">E-mail</h2><p className="text-xs text-slate-500 mt-2 leading-5">Adresse officielle administrable depuis l’espace de gestion.</p><span className="text-xs font-semibold text-slate-700 mt-4 block">Support ImmoSecureNet</span></article>
        <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><MapPin className="w-6 h-6 text-[#1e3a8a]"/><h2 className="font-black mt-4">Assistance locale</h2><p className="text-xs text-slate-500 mt-2 leading-5">Les coordonnées physiques peuvent être publiées par l’administration lorsque disponibles.</p><span className="text-xs font-semibold text-slate-700 mt-4 block">RDC</span></article>
      </section>
    </div>;
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

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (value:boolean)=>void }) => <button type="button" aria-pressed={value} onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full p-1 transition ${value ? 'bg-[#00a66c]' : 'bg-slate-300'}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`}/></button>;

  return <div className="max-w-4xl mx-auto pb-24 space-y-5">
    <button onClick={onBack} className="text-sm font-black text-[#1e3a8a]">← Retour au profil</button>
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#173b8f] to-[#0d68b4] p-6 sm:p-8 text-white shadow-lg"><div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center"><Settings className="w-6 h-6"/></div><h1 className="text-2xl sm:text-3xl font-black mt-4">Paramètres</h1><p className="text-sm text-white/75 mt-2">Préférences de votre compte <strong className="text-white">{roleName(currentUser?.role)}</strong>.</p></section>

    <section className="grid gap-4">
      {[
        { icon: Bell, title:'Notifications', desc:'Messages, rendez-vous, contrats et alertes importantes.', value:notifications, set:setNotifications },
        { icon: ShieldCheck, title:'Visibilité du profil', desc:'Contrôlez l’affichage public de votre profil.', value:profileVisible, set:setProfileVisible },
        { icon: UserCog, title:'Communications commerciales', desc:'Recevoir les nouveautés I-SHOP, partenaires et services.', value:marketing, set:setMarketing },
      ].map((item:any)=><div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"><div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><item.icon className="w-5 h-5"/></div><div className="flex-1"><div className="font-black text-sm">{item.title}</div><div className="text-xs text-slate-500 mt-1">{item.desc}</div></div><Toggle value={item.value} onChange={item.set}/></div>)}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"><div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Globe2 className="w-5 h-5"/></div><div className="flex-1"><div className="font-black text-sm">Langue</div><div className="text-xs text-slate-500 mt-1">Langue principale de l’interface.</div></div><select value={language} onChange={(e)=>setLanguage(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"><option value="fr">Français</option><option value="en">English</option></select></div>
    </section>

    {professional && <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-[#1e3a8a]"/><h2 className="font-black">Réglages professionnels</h2></div><p className="text-xs text-slate-500 mt-2 leading-5">La visibilité de votre activité, vos publications, votre messagerie et vos documents professionnels sont gérés depuis votre espace professionnel.</p></section>}

    <button disabled={saving} onClick={() => void save()} className="w-full py-3.5 rounded-2xl bg-[#1e3a8a] text-white font-black flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"><Save className="w-4 h-4"/>{saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}</button>
  </div>;
};

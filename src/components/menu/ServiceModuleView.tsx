import React from 'react';
import { ArrowLeft, BadgeCheck, Banknote, Building2, FileCheck2, Handshake, Megaphone, Scale, ShieldCheck, Wrench } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';

const services: Record<string, { title: string; description: string; icon: React.ComponentType<any>; steps: string[]; cta: string }> = {
  relation: { title: 'Mise en relation', description: 'Mise en relation pour la vente, l’achat ou la location d’un bien immobilier.', icon: Handshake, steps: ['Préciser votre besoin', 'Identifier les offres ou professionnels adaptés', 'Échanger via la messagerie sécurisée', 'Organiser une visite ou une prise de contact'], cta: 'Commencer une recherche' },
  contracts: { title: 'Contrats immobiliers', description: 'Enregistrement et vérification des contrats de vente et des contrats de bail.', icon: FileCheck2, steps: ['Soumettre le contrat', 'Joindre les pièces justificatives', 'Contrôle administratif', 'Suivi du statut dans votre compte'], cta: 'Déposer une demande' },
  finance: { title: 'Financement immobilier', description: 'Accompagnement pour les besoins de financement liés à l’immobilier.', icon: Banknote, steps: ['Décrire le projet', 'Indiquer le budget et l’apport', 'Constituer le dossier', 'Être orienté vers les partenaires adaptés'], cta: 'Demander un accompagnement' },
  insurance: { title: 'Assurance immobilière', description: 'Solutions d’assurance immobilière et services associés.', icon: ShieldCheck, steps: ['Identifier le bien ou le risque', 'Choisir le besoin de couverture', 'Transmettre les informations utiles', 'Recevoir les orientations disponibles'], cta: 'Demander une orientation' },
  studies: { title: 'Études, architecture & construction', description: 'Études immobilières, architecture, ingénierie et construction.', icon: Wrench, steps: ['Présenter le projet', 'Préciser la localisation et la superficie', 'Définir le besoin technique', 'Être mis en relation avec un professionnel'], cta: 'Présenter mon projet' },
  audit: { title: 'Audit & accompagnement', description: 'Audits, conseil juridique et accompagnement administratif.', icon: Scale, steps: ['Décrire la situation', 'Joindre les documents disponibles', 'Qualification de la demande', 'Orientation vers le service compétent'], cta: 'Soumettre une demande' },
  ads: { title: 'Publicité', description: 'Solutions de visibilité pour annonces, professionnels, magasins et partenaires.', icon: Megaphone, steps: ['Choisir le contenu à promouvoir', 'Définir l’objectif', 'Sélectionner la durée', 'Suivre la campagne'], cta: 'Créer une demande de publicité' },
  verification: { title: 'Vérification des agents/agences', description: 'Vérification et authentification des agents et agences immobilières.', icon: BadgeCheck, steps: ['Créer ou ouvrir un compte professionnel', 'Soumettre les informations professionnelles', 'Joindre les justificatifs', 'Recevoir le statut de vérification'], cta: 'Accéder à mon compte' },
};

export const ServiceModuleView: React.FC = () => {
  const { setActiveNavTab, showToast } = useProperties();
  const key = sessionStorage.getItem('immosecure_service_module') || 'relation';
  const service = services[key] || services.relation;
  const Icon = service.icon;
  const act = () => {
    if (key === 'relation') return setActiveNavTab('marketplace');
    if (key === 'verification') return setActiveNavTab('accounts');
    showToast('Votre demande sera enregistrée depuis ce module dès que vous êtes connecté.', 'info');
  };
  return <div className="max-w-3xl mx-auto pb-24 space-y-5">
    <button onClick={() => setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button>
    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Icon className="w-7 h-7"/></div>
      <h1 className="text-2xl sm:text-3xl font-black mt-5">{service.title}</h1><p className="text-sm text-slate-500 mt-2 leading-6">{service.description}</p>
      <div className="mt-6 grid gap-3">{service.steps.map((step, index) => <div key={step} className="flex gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"><div className="w-8 h-8 shrink-0 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-black">{index + 1}</div><div><p className="font-bold text-sm">{step}</p><p className="text-xs text-slate-500 mt-1">Étape intégrée au parcours ImmoSecureNet.</p></div></div>)}</div>
      <button onClick={act} className="mt-6 w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-black">{service.cta}</button>
    </section>
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="bg-white border border-slate-200 rounded-2xl p-5"><Building2 className="w-5 h-5 text-[#1e3a8a]"/><h2 className="font-black mt-3">Suivi centralisé</h2><p className="text-xs text-slate-500 mt-1">Les demandes sont rattachées au compte utilisateur et pourront être suivies depuis le profil.</p></div><div className="bg-white border border-slate-200 rounded-2xl p-5"><ShieldCheck className="w-5 h-5 text-emerald-600"/><h2 className="font-black mt-3">Parcours sécurisé</h2><p className="text-xs text-slate-500 mt-1">Les échanges sensibles sont réservés aux utilisateurs authentifiés et aux intervenants autorisés.</p></div></section>
  </div>;
};

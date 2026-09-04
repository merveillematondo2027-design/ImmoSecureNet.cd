import React, { useMemo, useState } from 'react';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { ArrowLeft, BadgeCheck, Banknote, Camera, FileCheck2, Handshake, Megaphone, QrCode, Scale, Search, ShieldCheck, Upload, Wrench } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

const serviceMeta: Record<string, { title: string; problem?: string; solution?: string; icon: React.ComponentType<any>; cta?: string }> = {
  contracts: { title: 'Enregistrement et vérification des contrats', icon: FileCheck2 },
  verification: { title: 'Vérification et authentification des agents/agences immobilières', icon: BadgeCheck },
  relation: { title: 'Mise en relation pour la vente, l’achat ou la location', icon: Handshake, problem: 'Vous souhaitez acheter, vendre ou louer un bien immobilier, mais vous ne savez pas toujours vers quel professionnel ou interlocuteur vous tourner ? La recherche d’un bien, d’un acquéreur, d’un vendeur ou d’un locataire peut également être longue et difficile lorsque les informations sont dispersées.', solution: 'ImmoSecureNet vous met en relation avec des professionnels et des acteurs immobiliers correspondant à votre besoin afin de faciliter vos démarches de vente, d’achat ou de location.', cta: 'Demander une mise en relation' },
  studies: { title: 'Études immobilières, architecture, ingénierie et construction', icon: Wrench, problem: 'Un projet immobilier nécessite souvent des études, une conception technique et un accompagnement professionnel avant et pendant sa réalisation. Une mauvaise évaluation ou une préparation insuffisante peut entraîner des erreurs, des retards et des coûts supplémentaires.', solution: 'ImmoSecureNet vous permet de demander l’accompagnement de professionnels compétents pour vos besoins en études immobilières, architecture, ingénierie et construction.', cta: 'Demander ce service' },
  finance: { title: 'Financement immobilier', icon: Banknote, problem: 'L’acquisition ou la réalisation d’un projet immobilier nécessite souvent un financement adapté. Il peut être difficile de déterminer la solution de financement correspondant à son projet et à sa situation.', solution: 'ImmoSecureNet facilite la mise en relation et l’orientation des utilisateurs à la recherche de solutions de financement adaptées à leurs projets immobiliers, auprès des professionnels ou organismes concernés.', cta: 'Demander un accompagnement' },
  insurance: { title: 'Assurance immobilière et autres', icon: ShieldCheck, problem: 'Un bien immobilier ou un projet immobilier peut être exposé à différents risques. Il est important d’identifier les risques concernés et de rechercher une couverture adaptée.', solution: 'ImmoSecureNet vous permet d’exprimer votre besoin et facilite votre mise en relation avec les professionnels ou organismes compétents en matière d’assurance et de protection des biens et projets immobiliers.', cta: 'Demander ce service' },
  ads: { title: 'Publicité', icon: Megaphone, problem: 'Vous souhaitez faire connaître un bien immobilier, un produit, un service, une entreprise, un commerce ou une activité, mais vous avez besoin d’une visibilité adaptée auprès d’un public ciblé.', solution: 'ImmoSecureNet vous permet de promouvoir vos biens, produits, services et activités auprès des utilisateurs de la plateforme grâce à ses espaces et solutions publicitaires.', cta: 'Demander une publicité' },
  audit: { title: 'Audits, conseil juridique et accompagnement administratif', icon: Scale, problem: 'Les opérations immobilières et les activités professionnelles peuvent présenter des difficultés juridiques, administratives ou documentaires. Une mauvaise compréhension des obligations ou des documents peut entraîner des risques et des complications.', solution: 'ImmoSecureNet permet aux utilisateurs de présenter leur besoin afin d’être orientés vers un professionnel compétent pour un audit, un conseil juridique ou un accompagnement administratif adapté à leur situation.', cta: 'Demander un accompagnement' },
};

const fieldsByService: Record<string, { label: string; name: string; type?: string; options?: string[]; required?: boolean }[]> = {
  relation: [
    { label: 'Type de demande', name: 'requestType', options: ['Acheter un bien','Vendre un bien','Louer un bien','Mettre un bien en location'], required: true },
    { label: 'Type de bien', name: 'propertyType', options: ['Terrain / Parcelle','Maison / Immeuble','Appartement','Bureau','Commerce','Entrepôt','Autre'], required: true },
    { label: 'Province', name: 'province' }, { label: 'Ville', name: 'city' }, { label: 'Commune', name: 'commune' }, { label: 'Quartier', name: 'neighborhood' },
    { label: 'Budget minimum', name: 'minBudget', type: 'number' }, { label: 'Budget maximum', name: 'maxBudget', type: 'number' }, { label: 'Nombre de chambres', name: 'bedrooms', type: 'number' }, { label: 'Description du besoin', name: 'description', type: 'textarea', required: true },
  ],
  studies: [
    { label: 'Type de service recherché', name: 'serviceType', options: ['Étude immobilière','Architecture','Ingénierie','Construction','Rénovation','Expertise technique','Autre'], required: true },
    { label: 'Type de projet', name: 'projectType', options: ['Maison','Immeuble','Appartement','Bureau','Commerce','Entrepôt','Autre'] }, { label: 'Province', name: 'province' }, { label: 'Ville', name: 'city' }, { label: 'Commune', name: 'commune' }, { label: 'Quartier', name: 'neighborhood' }, { label: 'Adresse', name: 'address' }, { label: 'Description du projet', name: 'description', type: 'textarea', required: true }, { label: 'Budget estimatif', name: 'budget', type: 'number' }, { label: 'Documents, plans ou pièces utiles', name: 'documents', type: 'file' },
  ],
  finance: [
    { label: 'Type de projet', name: 'projectType', options: ['Achat d’un terrain','Achat d’une maison','Achat d’un appartement','Construction','Rénovation','Acquisition d’un immeuble','Projet commercial','Autre'], required: true }, { label: 'Montant estimatif du projet', name: 'projectAmount', type: 'number' }, { label: 'Montant recherché', name: 'requestedAmount', type: 'number' }, { label: 'Description du projet', name: 'description', type: 'textarea', required: true }, { label: 'Situation du projet', name: 'projectStatus', options: ['Projet en préparation','Projet en cours','Bien déjà identifié','Autre'] }, { label: 'Documents utiles', name: 'documents', type: 'file' },
  ],
  insurance: [
    { label: 'Type de besoin', name: 'needType', options: ['Assurance d’un bien immobilier','Assurance liée à une location','Assurance liée à une construction','Protection contre certains risques liés au bien','Autre'], required: true }, { label: 'Type de bien', name: 'propertyType', options: ['Terrain / Parcelle','Maison','Appartement','Immeuble','Bureau','Commerce','Entrepôt','Autre'] }, { label: 'Province', name: 'province' }, { label: 'Ville', name: 'city' }, { label: 'Commune', name: 'commune' }, { label: 'Quartier', name: 'neighborhood' }, { label: 'Description du besoin', name: 'description', type: 'textarea', required: true }, { label: 'Documents utiles', name: 'documents', type: 'file' },
  ],
  ads: [
    { label: 'Type de publicité', name: 'adType', options: ['Bien immobilier','Produit','Service','Entreprise / Commerce','Événement','Restaurant','Parc et loisirs','Autre'], required: true }, { label: 'Nom de l’offre / activité', name: 'offerName', required: true }, { label: 'Description', name: 'description', type: 'textarea', required: true }, { label: 'Images / vidéos', name: 'media', type: 'file' }, { label: 'Province', name: 'province' }, { label: 'Ville', name: 'city' }, { label: 'Commune', name: 'commune' }, { label: 'Quartier', name: 'neighborhood' }, { label: 'Durée souhaitée (jours)', name: 'durationDays', type: 'number' }, { label: 'Budget publicitaire', name: 'budget', type: 'number' },
  ],
  audit: [
    { label: 'Type de service', name: 'serviceType', options: ['Audit','Conseil juridique','Accompagnement administratif','Vérification documentaire','Analyse d’un dossier','Autre'], required: true }, { label: 'Domaine concerné', name: 'domain', options: ['Immobilier','Contrat','Vente','Location','Construction','Gestion immobilière','Entreprise','Autre'] }, { label: 'Objet de la demande', name: 'subject', required: true }, { label: 'Description détaillée du problème', name: 'description', type: 'textarea', required: true }, { label: 'Documents à analyser', name: 'documents', type: 'file' },
  ],
};

const contactFields = [
  { label: 'Nom', name: 'lastName' }, { label: 'Prénom', name: 'firstName' }, { label: 'Numéro de téléphone', name: 'phone', type: 'tel' }, { label: 'Adresse e-mail', name: 'email', type: 'email' },
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]';

export const ServiceModuleView: React.FC = () => {
  const { setActiveNavTab, showToast } = useProperties();
  const { currentUser, isAuthenticated, allUsers } = useAuth();
  const key = sessionStorage.getItem('immosecure_service_module') || 'relation';
  const service = serviceMeta[key] || serviceMeta.relation;
  const Icon = service.icon;
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({ email: currentUser?.email || '', firstName: currentUser?.firstName || '', lastName: currentUser?.lastName || '' });
  const [sending, setSending] = useState(false);
  const [contractMode, setContractMode] = useState<'home'|'register'|'verify'>('home');
  const [contractType, setContractType] = useState<'bail'|'vente'>('bail');
  const [contractId, setContractId] = useState('');
  const [contractResult, setContractResult] = useState<any>(null);
  const [agentSearch, setAgentSearch] = useState('');

  const agents = useMemo(() => allUsers.filter((u:any) => ['AGENT','AGENCY','agent','agency'].includes(String(u.role))).filter((u:any) => {
    const term = agentSearch.trim().toLowerCase();
    return !term || `${u.firstName || ''} ${u.lastName || ''} ${u.companyName || ''} ${u.id || ''}`.toLowerCase().includes(term);
  }), [allUsers, agentSearch]);

  const requireAccount = () => {
    if (isAuthenticated) return true;
    showToast('Connectez-vous ou créez un compte pour envoyer cette demande.', 'info');
    setActiveNavTab('accounts');
    return false;
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAccount() || !currentUser) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'serviceRequests'), { serviceKey: key, serviceTitle: service.title, userId: currentUser.id, userEmail: currentUser.email, ...form, status: 'Demande reçue', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      showToast('Votre demande a bien été reçue. Un professionnel d’ImmoSecureNet vous contactera au numéro de téléphone ou à l’adresse e-mail indiquée afin d’obtenir les informations complémentaires et de convenir des prochaines étapes.', 'success');
      setOpenForm(false);
    } catch (err) { console.error(err); showToast('Impossible d’enregistrer la demande. Vérifiez votre connexion et réessayez.', 'error'); }
    finally { setSending(false); }
  };

  const submitContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAccount() || !currentUser) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'contractRequests'), { userId: currentUser.id, userEmail: currentUser.email, contractType, ...form, status: 'Vérification en cours', verificationDelayDays: 5, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      showToast('Contrat envoyé. Statut : Vérification en cours. La vérification manuelle est prévue sur 5 jours.', 'success');
      setContractMode('home');
    } catch (err) { console.error(err); showToast('Impossible d’envoyer le contrat.', 'error'); }
    finally { setSending(false); }
  };

  const verifyContract = async () => {
    if (!contractId.trim()) return;
    setContractResult(null);
    try {
      const snap = await getDocs(query(collection(db, 'registeredContracts'), where('identificationNumber', '==', contractId.trim())));
      setContractResult(snap.empty ? { notFound: true } : { id: snap.docs[0].id, ...snap.docs[0].data() });
    } catch (err) { console.error(err); showToast('Recherche du contrat impossible.', 'error'); }
  };

  const renderField = (f:any) => <label key={f.name} className="block text-xs font-bold text-slate-700">{f.label}{f.required && ' *'}
    {f.options ? <select required={f.required} value={form[f.name] || ''} onChange={e => setForm(v => ({...v,[f.name]:e.target.value}))} className={`${inputClass} mt-1.5`}><option value="">Choisir</option>{f.options.map((o:string)=><option key={o}>{o}</option>)}</select>
    : f.type === 'textarea' ? <textarea required={f.required} rows={4} value={form[f.name] || ''} onChange={e => setForm(v => ({...v,[f.name]:e.target.value}))} className={`${inputClass} mt-1.5`} />
    : f.type === 'file' ? <div className="mt-1.5 rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500"><Upload className="w-5 h-5 mx-auto mb-1"/>Joindre les fichiers utiles<input type="file" multiple className="block w-full mt-2 text-xs" /></div>
    : <input required={f.required} type={f.type || 'text'} value={form[f.name] || ''} onChange={e => setForm(v => ({...v,[f.name]:e.target.value}))} className={`${inputClass} mt-1.5`} />}
  </label>;

  if (key === 'verification') return <div className="max-w-3xl mx-auto pb-24 space-y-5">
    <button onClick={() => setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button>
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm"><div className="flex items-center gap-3"><BadgeCheck className="w-8 h-8 text-[#1e3a8a]"/><div><h1 className="text-xl sm:text-2xl font-black">{service.title}</h1><p className="text-xs text-slate-500">Annuaire des professionnels enregistrés sur ImmoSecureNet</p></div></div>
      <div className="relative mt-5"><Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/><input value={agentSearch} onChange={e=>setAgentSearch(e.target.value)} placeholder="Rechercher par nom ou numéro d’identification" className={`${inputClass} pl-10`}/></div>
      <div className="mt-5 space-y-3">{agents.length ? agents.map((u:any)=><article key={u.id} className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3"><div><p className="font-black">{u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Professionnel'}</p><p className="text-xs text-slate-500 mt-1">{String(u.role).toLowerCase().includes('agency') ? 'Agence immobilière' : 'Agent immobilier'} · ID {u.professionalId || u.id?.slice(0,10)}</p></div><span className={`text-[10px] font-black px-2.5 py-1.5 rounded-full ${String(u.verificationStatus).toLowerCase().includes('verified') || String(u.verificationStatus).toLowerCase().includes('approved') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{u.verificationStatus || 'Enregistré'}</span></article>) : <div className="py-10 text-center text-sm text-slate-500">Aucun agent ou agence enregistré ne correspond à cette recherche.</div>}</div>
    </section></div>;

  if (key === 'contracts') return <div className="max-w-3xl mx-auto pb-24 space-y-5"><button onClick={() => setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button>
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm"><div className="flex gap-3 items-center"><FileCheck2 className="w-8 h-8 text-[#1e3a8a]"/><h1 className="text-xl sm:text-2xl font-black">{service.title}</h1></div>
      {contractMode === 'home' && <div className="grid sm:grid-cols-2 gap-3 mt-6"><button onClick={()=>setContractMode('register')} className="p-5 rounded-2xl border text-left hover:border-blue-300"><FileCheck2 className="text-[#1e3a8a]"/><p className="font-black mt-3">Enregistrer un contrat</p><p className="text-xs text-slate-500 mt-1">Contrat de bail ou contrat de vente</p></button><button onClick={()=>setContractMode('verify')} className="p-5 rounded-2xl border text-left hover:border-blue-300"><QrCode className="text-emerald-600"/><p className="font-black mt-3">Vérifier un contrat</p><p className="text-xs text-slate-500 mt-1">QR code ou numéro d’identification</p></button></div>}
      {contractMode === 'register' && <form onSubmit={submitContract} className="mt-6 space-y-4"><button type="button" onClick={()=>setContractMode('home')} className="text-xs font-bold text-slate-500">← Retour</button><div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setContractType('bail')} className={`p-3 rounded-xl border font-bold text-sm ${contractType==='bail'?'bg-blue-50 border-blue-300 text-[#1e3a8a]':''}`}>Contrat de bail</button><button type="button" onClick={()=>setContractType('vente')} className={`p-3 rounded-xl border font-bold text-sm ${contractType==='vente'?'bg-blue-50 border-blue-300 text-[#1e3a8a]':''}`}>Contrat de vente</button></div>{renderField({label:'Nom et prénom du demandeur',name:'applicantName',required:true})}{renderField({label:'Adresse e-mail',name:'email',type:'email',required:true})}{renderField({label:'Numéro de téléphone',name:'phone',type:'tel',required:true})}{renderField({label:'Référence / objet du contrat',name:'subject',required:true})}{renderField({label:'Document du contrat et pièces justificatives',name:'contractFile',type:'file'})}<button disabled={sending} className="w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-black">{sending?'Envoi...':'Envoyer pour vérification'}</button></form>}
      {contractMode === 'verify' && <div className="mt-6 space-y-4"><button onClick={()=>setContractMode('home')} className="text-xs font-bold text-slate-500">← Retour</button><button onClick={()=>showToast('Autorisez l’accès à la caméra pour scanner le QR code du contrat.', 'info')} className="w-full rounded-xl border p-4 font-bold flex justify-center items-center gap-2"><Camera className="w-5 h-5"/>Scanner un code QR</button><div className="flex gap-2"><input value={contractId} onChange={e=>setContractId(e.target.value)} placeholder="Numéro d’identification du contrat" className={inputClass}/><button onClick={verifyContract} className="px-4 rounded-xl bg-[#1e3a8a] text-white"><Search/></button></div>{contractResult && <div className={`rounded-xl p-4 text-sm ${contractResult.notFound?'bg-red-50 text-red-700':'bg-emerald-50 text-emerald-800'}`}>{contractResult.notFound ? 'Aucun contrat enregistré avec ce numéro.' : <><p className="font-black">Contrat retrouvé</p><p className="mt-1">Statut : {contractResult.status || 'Enregistré'}</p><p>ID : {contractResult.identificationNumber}</p></>}</div>}</div>}
    </section></div>;

  return <div className="max-w-3xl mx-auto pb-24 space-y-5"><button onClick={() => setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button>
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm"><div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Icon className="w-7 h-7"/></div><h1 className="text-2xl sm:text-3xl font-black mt-5">{service.title}</h1>
      {service.problem && <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-500">Problème</p><p className="text-sm leading-6 mt-1">{service.problem}</p></div>}{service.solution && <div className="mt-3 rounded-2xl bg-blue-50 p-4"><p className="text-xs font-black uppercase text-[#1e3a8a]">Solution ImmoSecureNet</p><p className="text-sm leading-6 mt-1">{service.solution}</p></div>}
      {!openForm ? <button onClick={()=>{if(requireAccount()) setOpenForm(true)}} className="mt-6 w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-black">{service.cta}</button> : <form onSubmit={submitRequest} className="mt-6 space-y-5"><div className="grid sm:grid-cols-2 gap-4">{(fieldsByService[key] || []).map(renderField)}</div><div><h2 className="font-black text-sm mb-3">Mode d’accompagnement</h2><div className="grid grid-cols-2 gap-2">{['En présentiel','En ligne'].map(o=><button type="button" key={o} onClick={()=>setForm(v=>({...v,assistanceMode:o}))} className={`p-3 rounded-xl border text-sm font-bold ${form.assistanceMode===o?'bg-blue-50 border-blue-300 text-[#1e3a8a]':''}`}>{o}</button>)}</div></div><div><h2 className="font-black text-sm mb-3">Coordonnées</h2><div className="grid sm:grid-cols-2 gap-4">{contactFields.map(renderField)}</div></div><button disabled={sending} className="w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-black">{sending?'Envoi en cours...': key==='ads'?'Envoyer ma demande publicitaire':'Envoyer ma demande'}</button><button type="button" onClick={()=>setOpenForm(false)} className="w-full text-xs font-bold text-slate-500">Annuler</button></form>}
    </section><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="font-black text-sm">Suivi de la demande</p><p className="text-xs text-slate-500 mt-2">Statuts : Demande reçue → En cours de traitement → Professionnel assigné → Contact avec le client → Demande traitée → Demande clôturée.</p></section></div>;
};

import React, { useMemo, useRef, useState } from 'react';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { ArrowLeft, BadgeCheck, Banknote, Building2, Camera, CheckCircle2, FileCheck2, Handshake, Megaphone, QrCode, Scale, Search, ShieldCheck, Sparkles, Upload, Wrench, X } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

type Field = { label:string; name:string; type?:string; options?:string[]; required?:boolean };

type Service = {
  title:string; eyebrow:string; intro:string; icon:React.ComponentType<any>; cta?:string;
  highlights:string[];
};

const services: Record<string, Service> = {
  contracts:{ title:'Enregistrement et vérification des contrats', eyebrow:'Contrats sécurisés', intro:'Centralisez vos contrats de bail et de vente, transmettez les pièces nécessaires et vérifiez un contrat enregistré depuis son identifiant.', icon:FileCheck2, highlights:['Contrat de bail ou de vente','Vérification manuelle','Recherche par identifiant ou QR'] },
  verification:{ title:'Vérification des agents et agences', eyebrow:'Professionnels enregistrés', intro:'Consultez les agents et agences présents sur ImmoSecureNet et vérifiez leur statut avant une mise en relation.', icon:BadgeCheck, highlights:['Recherche rapide','Statut visible','Profil professionnel'] },
  relation:{ title:'Mise en relation pour la vente, l’achat ou la location', eyebrow:'Accompagnement immobilier', intro:'Décrivez votre besoin et laissez ImmoSecureNet vous orienter vers le professionnel ou l’interlocuteur adapté.', icon:Handshake, cta:'Commencer ma demande', highlights:['Achat, vente ou location','Critères immobiliers précis','Orientation personnalisée'] },
  studies:{ title:'Études immobilières, architecture, ingénierie et construction', eyebrow:'Projet & construction', intro:'Préparez votre projet avec les bonnes compétences techniques, de l’étude initiale jusqu’à la réalisation.', icon:Wrench, cta:'Présenter mon projet', highlights:['Architecture & études','Ingénierie & expertise','Construction & rénovation'] },
  finance:{ title:'Financement immobilier', eyebrow:'Financement de projet', intro:'Présentez votre projet, votre besoin de financement et les éléments utiles pour être orienté vers une solution adaptée.', icon:Banknote, cta:'Présenter mon besoin', highlights:['Achat ou construction','Montant recherché','Orientation vers partenaires'] },
  insurance:{ title:'Assurance immobilière et autres', eyebrow:'Protection du bien', intro:'Décrivez le bien ou le projet à protéger afin d’être orienté vers les solutions d’assurance adaptées.', icon:ShieldCheck, cta:'Demander une orientation', highlights:['Biens immobiliers','Construction & location','Couverture adaptée'] },
  ads:{ title:'Publicité', eyebrow:'Visibilité & promotion', intro:'Faites connaître un bien, une entreprise, une activité, un produit ou un service auprès des utilisateurs ImmoSecureNet.', icon:Megaphone, cta:'Créer ma demande publicitaire', highlights:['Biens & services','I-SHOP & expériences','Durée et budget'] },
  audit:{ title:'Audits, conseil juridique et accompagnement administratif', eyebrow:'Expertise & conformité', intro:'Présentez votre dossier pour être orienté vers une expertise juridique, documentaire ou administrative adaptée.', icon:Scale, cta:'Présenter mon dossier', highlights:['Audit documentaire','Conseil juridique','Accompagnement administratif'] },
};

const fields: Record<string, Field[]> = {
  relation:[
    {label:'Type de demande',name:'requestType',options:['Acheter un bien','Vendre un bien','Louer un bien','Mettre un bien en location'],required:true},
    {label:'Type de bien',name:'propertyType',options:['Terrain / Parcelle','Appartement','Maison','Villa','Immeuble','Bureau','Entrepôt','Autre'],required:true},
    {label:'Province',name:'province'},{label:'Ville',name:'city'},{label:'Commune',name:'commune'},{label:'Quartier',name:'neighborhood'},
    {label:'Budget minimum',name:'minBudget',type:'number'},{label:'Budget maximum',name:'maxBudget',type:'number'},
    {label:'Description du besoin',name:'description',type:'textarea',required:true},
  ],
  studies:[
    {label:'Service recherché',name:'serviceType',options:['Étude immobilière','Architecture','Ingénierie','Construction','Rénovation','Expertise technique','Autre'],required:true},
    {label:'Type de projet',name:'projectType',options:['Maison','Immeuble','Appartement','Bureau','Commerce','Entrepôt','Autre']},
    {label:'Province',name:'province'},{label:'Ville',name:'city'},{label:'Adresse',name:'address'},
    {label:'Budget estimatif',name:'budget',type:'number'},{label:'Description du projet',name:'description',type:'textarea',required:true},{label:'Documents / plans',name:'documents',type:'file'},
  ],
  finance:[
    {label:'Type de projet',name:'projectType',options:['Achat d’un terrain','Achat d’une maison','Achat d’un appartement','Construction','Rénovation','Acquisition d’un immeuble','Projet commercial','Autre'],required:true},
    {label:'Montant estimatif du projet',name:'projectAmount',type:'number'},{label:'Montant recherché',name:'requestedAmount',type:'number'},
    {label:'Situation du projet',name:'projectStatus',options:['Projet en préparation','Projet en cours','Bien déjà identifié','Autre']},
    {label:'Description du projet',name:'description',type:'textarea',required:true},{label:'Documents utiles',name:'documents',type:'file'},
  ],
  insurance:[
    {label:'Type de besoin',name:'needType',options:['Assurance d’un bien immobilier','Assurance liée à une location','Assurance liée à une construction','Protection contre certains risques liés au bien','Autre'],required:true},
    {label:'Type de bien',name:'propertyType',options:['Terrain / Parcelle','Maison','Appartement','Immeuble','Bureau','Commerce','Entrepôt','Autre']},
    {label:'Province',name:'province'},{label:'Ville',name:'city'},{label:'Commune',name:'commune'},{label:'Quartier',name:'neighborhood'},
    {label:'Description du besoin',name:'description',type:'textarea',required:true},{label:'Documents utiles',name:'documents',type:'file'},
  ],
  ads:[
    {label:'Type de publicité',name:'adType',options:['Bien immobilier','Produit','Service','Entreprise / Commerce','Événement','Restaurant','Parc et loisirs','Autre'],required:true},
    {label:'Nom de l’offre / activité',name:'offerName',required:true},{label:'Province',name:'province'},{label:'Ville',name:'city'},
    {label:'Durée souhaitée (jours)',name:'durationDays',type:'number'},{label:'Budget publicitaire',name:'budget',type:'number'},
    {label:'Description',name:'description',type:'textarea',required:true},{label:'Images / vidéos',name:'media',type:'file'},
  ],
  audit:[
    {label:'Type de service',name:'serviceType',options:['Audit','Conseil juridique','Accompagnement administratif','Vérification documentaire','Analyse d’un dossier','Autre'],required:true},
    {label:'Domaine concerné',name:'domain',options:['Immobilier','Contrat','Vente','Location','Construction','Gestion immobilière','Entreprise','Autre']},
    {label:'Objet de la demande',name:'subject',required:true},{label:'Description détaillée',name:'description',type:'textarea',required:true},{label:'Documents à analyser',name:'documents',type:'file'},
  ],
};

const inputClass='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-50';

export const ProfessionalServiceModuleView: React.FC = () => {
  const { setActiveNavTab, showToast } = useProperties();
  const { currentUser, isAuthenticated, allUsers } = useAuth();
  const key=sessionStorage.getItem('immosecure_service_module') || 'relation';
  const service=services[key] || services.relation;
  const Icon=service.icon;
  const [openForm,setOpenForm]=useState(false);
  const [form,setForm]=useState<Record<string,string>>({ email:currentUser?.email || '', firstName:(currentUser as any)?.firstName || '', lastName:(currentUser as any)?.lastName || '' });
  const [sending,setSending]=useState(false);
  const [agentSearch,setAgentSearch]=useState('');
  const [contractMode,setContractMode]=useState<'home'|'register'|'verify'>('home');
  const [contractType,setContractType]=useState<'bail'|'vente'>('bail');
  const [contractId,setContractId]=useState('');
  const [contractResult,setContractResult]=useState<any>(null);
  const [scannerOpen,setScannerOpen]=useState(false);
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const streamRef=useRef<MediaStream|null>(null);

  const agents=useMemo(()=>allUsers.filter((u:any)=>['AGENT','AGENCY','agent','agency'].includes(String(u.role))).filter((u:any)=>{
    const term=agentSearch.toLowerCase().trim();
    return !term || `${u.firstName||''} ${u.lastName||''} ${u.companyName||''} ${u.professionalId||''}`.toLowerCase().includes(term);
  }),[allUsers,agentSearch]);

  const requireAccount=()=>{
    if(isAuthenticated) return true;
    showToast('Connectez-vous ou créez un compte pour continuer.','info');
    setActiveNavTab('accounts');
    return false;
  };

  const submitRequest=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!requireAccount() || !currentUser) return;
    setSending(true);
    try{
      await addDoc(collection(db,'serviceRequests'),{serviceKey:key,serviceTitle:service.title,userId:currentUser.id,userEmail:currentUser.email,...form,status:'Demande reçue',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      showToast('Demande envoyée avec succès.','success');
      setOpenForm(false);
    }catch(err){console.error(err);showToast('Impossible d’envoyer la demande.','error');}
    finally{setSending(false);}
  };

  const submitContract=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!requireAccount() || !currentUser) return;
    setSending(true);
    try{
      await addDoc(collection(db,'contractRequests'),{userId:currentUser.id,userEmail:currentUser.email,contractType,...form,status:'Vérification en cours',verificationDelayDays:5,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      showToast('Contrat envoyé pour vérification.','success');setContractMode('home');
    }catch(err){console.error(err);showToast('Impossible d’envoyer le contrat.','error');}
    finally{setSending(false);}
  };

  const verifyContract=async(value?:string)=>{
    const id=(value || contractId).trim(); if(!id) return;
    setContractResult(null);
    try{const snap=await getDocs(query(collection(db,'registeredContracts'),where('identificationNumber','==',id)));setContractResult(snap.empty?{notFound:true}:{id:snap.docs[0].id,...snap.docs[0].data()});}
    catch(err){console.error(err);showToast('Recherche du contrat impossible.','error');}
  };

  const stopScanner=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setScannerOpen(false);};
  const startScanner=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});streamRef.current=stream;setScannerOpen(true);
      setTimeout(async()=>{
        if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
        const Detector=(window as any).BarcodeDetector;
        if(!Detector){showToast('Le scan QR automatique n’est pas disponible sur ce navigateur. Utilisez le numéro du contrat.','info');return;}
        const detector=new Detector({formats:['qr_code']});
        const tick=async()=>{if(!streamRef.current||!videoRef.current)return;try{const codes=await detector.detect(videoRef.current);if(codes?.[0]?.rawValue){const value=codes[0].rawValue;setContractId(value);stopScanner();void verifyContract(value);return;}}catch{}requestAnimationFrame(tick);};requestAnimationFrame(tick);
      },100);
    }catch{showToast('Impossible d’accéder à la caméra. Vérifiez les autorisations du navigateur.','error');}
  };

  const renderField=(f:Field)=><label key={f.name} className={`block ${f.type==='textarea'||f.type==='file'?'sm:col-span-2':''}`}><span className="text-xs font-black text-slate-700">{f.label}{f.required?' *':''}</span>{f.options?<select required={f.required} value={form[f.name]||''} onChange={e=>setForm(v=>({...v,[f.name]:e.target.value}))} className={`${inputClass} mt-2`}><option value="">Sélectionner</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>:f.type==='textarea'?<textarea required={f.required} rows={5} value={form[f.name]||''} onChange={e=>setForm(v=>({...v,[f.name]:e.target.value}))} className={`${inputClass} mt-2 resize-none`}/>:f.type==='file'?<div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><Upload className="w-6 h-6 mx-auto text-[#1e3a8a]"/><p className="text-xs text-slate-500 mt-2">Ajouter les pièces utiles</p><input type="file" multiple className="mt-3 text-xs max-w-full"/></div>:<input required={f.required} type={f.type||'text'} value={form[f.name]||''} onChange={e=>setForm(v=>({...v,[f.name]:e.target.value}))} className={`${inputClass} mt-2`}/>}</label>;

  const HeaderCard=()=> <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#173b8f] via-[#0c67b4] to-[#00a66c] p-6 sm:p-8 text-white shadow-lg"><div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"/><div className="relative"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center"><Icon className="w-7 h-7"/></div><div><p className="text-[11px] uppercase tracking-[.18em] font-black text-white/70">{service.eyebrow}</p><h1 className="text-2xl sm:text-3xl font-black mt-1 leading-tight">{service.title}</h1></div></div><p className="text-sm sm:text-base text-white/80 leading-6 mt-5 max-w-3xl">{service.intro}</p><div className="grid sm:grid-cols-3 gap-2 mt-6">{service.highlights.map(h=><div key={h} className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0"/>{h}</div>)}</div></div></section>;

  if(key==='verification') return <div className="max-w-5xl mx-auto pb-24 space-y-5"><button onClick={()=>setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-black text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button><HeaderCard/><section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm"><div className="relative"><Search className="absolute left-4 top-4 w-4 h-4 text-slate-400"/><input value={agentSearch} onChange={e=>setAgentSearch(e.target.value)} placeholder="Nom, agence ou identifiant professionnel" className={`${inputClass} pl-11`}/></div><div className="grid sm:grid-cols-2 gap-3 mt-5">{agents.length?agents.map((u:any)=><article key={u.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="w-11 h-11 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-black">{(u.companyName||u.firstName||'P').slice(0,1).toUpperCase()}</div><span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">{u.verificationStatus||'Enregistré'}</span></div><h2 className="font-black mt-3">{u.companyName||`${u.firstName||''} ${u.lastName||''}`.trim()||'Professionnel'}</h2><p className="text-xs text-slate-500 mt-1">{String(u.role).toLowerCase().includes('agency')?'Agence immobilière':'Agent immobilier'}</p><p className="text-[11px] text-slate-400 mt-2">ID : {u.professionalId||u.id?.slice(0,12)}</p></article>):<div className="sm:col-span-2 py-12 text-center text-sm text-slate-500">Aucun professionnel correspondant.</div>}</div></section></div>;

  if(key==='contracts') return <div className="max-w-5xl mx-auto pb-24 space-y-5"><button onClick={()=>setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-black text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button><HeaderCard/><section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">{contractMode==='home'&&<div className="grid sm:grid-cols-2 gap-4"><button onClick={()=>setContractMode('register')} className="rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition"><div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><FileCheck2/></div><h2 className="font-black mt-4">Enregistrer un contrat</h2><p className="text-xs text-slate-500 mt-2">Soumettre un contrat de bail ou de vente à la vérification.</p></button><button onClick={()=>setContractMode('verify')} className="rounded-2xl border border-slate-200 p-5 text-left hover:border-emerald-300 hover:shadow-sm transition"><div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><QrCode/></div><h2 className="font-black mt-4">Vérifier un contrat</h2><p className="text-xs text-slate-500 mt-2">Scanner le QR ou saisir le numéro d’identification.</p></button></div>}
    {contractMode==='register'&&<form onSubmit={submitContract} className="space-y-5"><button type="button" onClick={()=>setContractMode('home')} className="text-xs font-black text-slate-500">← Retour</button><div className="grid grid-cols-2 gap-2">{(['bail','vente'] as const).map(t=><button key={t} type="button" onClick={()=>setContractType(t)} className={`rounded-2xl border p-3 text-sm font-black ${contractType===t?'bg-blue-50 border-blue-300 text-[#1e3a8a]':'border-slate-200'}`}>{t==='bail'?'Contrat de bail':'Contrat de vente'}</button>)}</div><div className="grid sm:grid-cols-2 gap-4">{renderField({label:'Nom du demandeur',name:'applicantName',required:true})}{renderField({label:'Téléphone',name:'phone',type:'tel',required:true})}{renderField({label:'E-mail',name:'email',type:'email',required:true})}{renderField({label:'Objet / référence du contrat',name:'subject',required:true})}{renderField({label:'Contrat et pièces justificatives',name:'contractFile',type:'file'})}</div><button disabled={sending} className="w-full rounded-2xl bg-[#1e3a8a] py-3.5 text-white font-black">{sending?'Envoi...':'Envoyer pour vérification'}</button></form>}
    {contractMode==='verify'&&<div className="space-y-4"><button onClick={()=>setContractMode('home')} className="text-xs font-black text-slate-500">← Retour</button><div className="grid sm:grid-cols-[1fr_auto] gap-3"><button onClick={()=>void startScanner()} className="rounded-2xl border border-slate-200 py-3.5 font-black flex items-center justify-center gap-2"><Camera className="w-5 h-5"/>Scanner le QR code</button><div className="flex gap-2"><input value={contractId} onChange={e=>setContractId(e.target.value)} placeholder="Numéro du contrat" className={inputClass}/><button onClick={()=>void verifyContract()} className="w-14 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center"><Search className="w-5 h-5"/></button></div></div>{contractResult&&<div className={`rounded-2xl p-4 text-sm ${contractResult.notFound?'bg-rose-50 text-rose-700':'bg-emerald-50 text-emerald-800'}`}>{contractResult.notFound?'Aucun contrat enregistré avec cet identifiant.':<><p className="font-black">Contrat vérifié</p><p className="mt-1">Statut : {contractResult.status||'Enregistré'}</p><p className="text-xs mt-1">ID : {contractResult.identificationNumber}</p></>}</div>}</div>}</section>{scannerOpen&&<div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"><div className="w-full max-w-md bg-slate-950 rounded-3xl overflow-hidden relative"><button onClick={stopScanner} className="absolute right-3 top-3 z-10 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center"><X/></button><video ref={videoRef} className="w-full aspect-square object-cover" playsInline muted/><div className="p-4 text-center text-white text-sm">Placez le QR code du contrat au centre de l’image.</div></div></div>}</div>;

  return <div className="max-w-5xl mx-auto pb-24 space-y-5"><button onClick={()=>setActiveNavTab('services')} className="inline-flex items-center gap-2 text-sm font-black text-[#1e3a8a]"><ArrowLeft className="w-4 h-4"/>Retour aux services</button><HeaderCard/><section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">{!openForm?<div className="grid lg:grid-cols-[1fr_300px] gap-6 items-center"><div><p className="text-xs font-black uppercase tracking-widest text-slate-400">Votre demande</p><h2 className="text-xl font-black mt-2">Expliquez-nous votre besoin</h2><p className="text-sm text-slate-500 mt-2 leading-6">Quelques informations suffisent pour créer un dossier structuré et permettre à l’équipe de mieux vous orienter.</p></div><button onClick={()=>{if(requireAccount())setOpenForm(true)}} className="w-full rounded-2xl bg-[#1e3a8a] py-3.5 px-5 text-white font-black shadow-sm">{service.cta}</button></div>:<form onSubmit={submitRequest} className="space-y-6"><div><p className="text-xs font-black uppercase tracking-widest text-[#00a66c]">Formulaire sécurisé</p><h2 className="text-xl font-black mt-1">Informations de la demande</h2></div><div className="grid sm:grid-cols-2 gap-4">{(fields[key]||[]).map(renderField)}</div><div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100"><label><span className="text-xs font-black text-slate-700">Nom</span><input value={form.lastName||''} onChange={e=>setForm(v=>({...v,lastName:e.target.value}))} className={`${inputClass} mt-2`}/></label><label><span className="text-xs font-black text-slate-700">Prénom</span><input value={form.firstName||''} onChange={e=>setForm(v=>({...v,firstName:e.target.value}))} className={`${inputClass} mt-2`}/></label><label><span className="text-xs font-black text-slate-700">Téléphone</span><input value={form.phone||''} onChange={e=>setForm(v=>({...v,phone:e.target.value}))} className={`${inputClass} mt-2`}/></label><label><span className="text-xs font-black text-slate-700">E-mail</span><input type="email" value={form.email||''} onChange={e=>setForm(v=>({...v,email:e.target.value}))} className={`${inputClass} mt-2`}/></label></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setForm(v=>({...v,assistanceMode:'En ligne'}))} className={`rounded-2xl border p-3 text-sm font-black ${form.assistanceMode==='En ligne'?'bg-blue-50 border-blue-300 text-[#1e3a8a]':'border-slate-200'}`}>En ligne</button><button type="button" onClick={()=>setForm(v=>({...v,assistanceMode:'En présentiel'}))} className={`rounded-2xl border p-3 text-sm font-black ${form.assistanceMode==='En présentiel'?'bg-blue-50 border-blue-300 text-[#1e3a8a]':'border-slate-200'}`}>En présentiel</button></div><div className="flex flex-col sm:flex-row gap-3"><button disabled={sending} className="flex-1 rounded-2xl bg-[#1e3a8a] py-3.5 text-white font-black">{sending?'Envoi en cours...':'Envoyer ma demande'}</button><button type="button" onClick={()=>setOpenForm(false)} className="sm:w-36 rounded-2xl border border-slate-200 py-3.5 font-black text-slate-600">Annuler</button></div></form>}</section></div>;
};

import React, { useEffect, useState } from 'react';
import { ImagePlus, Save, RotateCcw, Shield } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useProperties } from '../../context/PropertyContext';

const BRANDING_DOC = doc(db, 'appSettings', 'branding');
const MAX_LOGO_BYTES = 700 * 1024;
const MAX_COVER_BYTES = 1400 * 1024;

export const BrandingSettings: React.FC = () => {
  const { showToast } = useProperties();
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [savedLogo, setSavedLogo] = useState('');
  const [homeCoverDataUrl, setHomeCoverDataUrl] = useState('');
  const [savedHomeCover, setSavedHomeCover] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const snap = await getDoc(BRANDING_DOC);
        const logo = snap.exists() ? String(snap.data()?.logoDataUrl || '') : '';
        const cover = snap.exists() ? String(snap.data()?.homeCoverDataUrl || '') : '';
        setLogoDataUrl(logo);
        setSavedLogo(logo);
        setHomeCoverDataUrl(cover);
        setSavedHomeCover(cover);
      } catch (error) {
        console.error('Erreur chargement identité visuelle:', error);
        showToast('Impossible de charger l’identité visuelle actuelle.', 'error');
      } finally {
        setLoading(false);
      }
    };
    void loadBranding();
  }, []);

  const readImage = (file: File | undefined, maxBytes: number, onLoad: (value: string) => void, label: string) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(`Choisissez une image pour ${label}.`, 'error');
      return;
    }
    if (file.size > maxBytes) {
      showToast(`${label} est trop lourde.`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onLoad(String(reader.result || ''));
    reader.onerror = () => showToast(`Impossible de lire l’image ${label}.`, 'error');
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(BRANDING_DOC, {
        logoDataUrl,
        homeCoverDataUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setSavedLogo(logoDataUrl);
      setSavedHomeCover(homeCoverDataUrl);
      showToast('Identité visuelle ImmoSecureNet mise à jour.', 'success');
    } catch (error) {
      console.error('Erreur sauvegarde identité visuelle:', error);
      showToast('Impossible d’enregistrer les changements.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetLogo = async () => {
    setSaving(true);
    try {
      await setDoc(BRANDING_DOC, { logoDataUrl: '', updatedAt: new Date().toISOString() }, { merge: true });
      setLogoDataUrl('');
      setSavedLogo('');
      showToast('Logo personnalisé retiré.', 'success');
    } catch {
      showToast('Impossible de réinitialiser le logo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetCover = async () => {
    setSaving(true);
    try {
      await setDoc(BRANDING_DOC, { homeCoverDataUrl: '', updatedAt: new Date().toISOString() }, { merge: true });
      setHomeCoverDataUrl('');
      setSavedHomeCover('');
      showToast('Photo de couverture par défaut rétablie.', 'success');
    } catch {
      showToast('Impossible de réinitialiser la couverture.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const dirty = logoDataUrl !== savedLogo || homeCoverDataUrl !== savedHomeCover;

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <h1 className="text-xl font-bold text-white">Identité visuelle</h1>
        <p className="text-xs text-slate-400 mt-1">Modifiez le logo et la photo de présentation de l’accueil sans toucher au code.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="w-28 h-28 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoDataUrl ? <img src={logoDataUrl} alt="Logo ImmoSecureNet" className="w-full h-full object-contain p-2" /> : <Shield className="w-14 h-14 text-[#1e3a8a]" strokeWidth={1.5} />}
          </div>
          <div className="flex-1 space-y-3">
            <div><h2 className="font-bold text-slate-900">Logo de l’application</h2><p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP ou SVG. Maximum 700 Ko.</p></div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold cursor-pointer hover:bg-blue-100"><ImagePlus className="w-4 h-4" />Choisir un logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => readImage(e.target.files?.[0], MAX_LOGO_BYTES, setLogoDataUrl, 'le logo')} /></label>
            <button onClick={resetLogo} disabled={saving || loading || (!logoDataUrl && !savedLogo)} className="ml-2 inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50"><RotateCcw className="w-4 h-4" />Logo par défaut</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm max-w-3xl">
        <div>
          <h2 className="font-bold text-slate-900">Photo de présentation — Accueil</h2>
          <p className="text-xs text-slate-500 mt-1">Cette image apparaît sous « Trouver le bien idéal ». Privilégiez une vraie photo immobilière en RDC, horizontale et nette.</p>
        </div>
        <div className="mt-4 aspect-[16/6] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
          {homeCoverDataUrl ? <img src={homeCoverDataUrl} alt="Couverture accueil" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">La photo de couverture par défaut sera utilisée.</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer hover:bg-emerald-100"><ImagePlus className="w-4 h-4" />Choisir la couverture<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => readImage(e.target.files?.[0], MAX_COVER_BYTES, setHomeCoverDataUrl, 'la couverture')} /></label>
          <button onClick={resetCover} disabled={saving || loading || (!homeCoverDataUrl && !savedHomeCover)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50"><RotateCcw className="w-4 h-4" />Couverture par défaut</button>
        </div>
      </div>

      <div className="max-w-3xl flex justify-end">
        <button onClick={save} disabled={saving || loading || !dirty} className="inline-flex items-center gap-2 px-5 py-3 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
      </div>
    </div>
  );
};

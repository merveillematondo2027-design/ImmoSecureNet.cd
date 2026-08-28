import React, { useEffect, useState } from 'react';
import { ImagePlus, Save, RotateCcw, Shield } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useProperties } from '../../context/PropertyContext';

const BRANDING_DOC = doc(db, 'appSettings', 'branding');
const MAX_LOGO_BYTES = 700 * 1024;

export const BrandingSettings: React.FC = () => {
  const { showToast } = useProperties();
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [savedLogo, setSavedLogo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const snap = await getDoc(BRANDING_DOC);
        const value = snap.exists() ? String(snap.data()?.logoDataUrl || '') : '';
        setLogoDataUrl(value);
        setSavedLogo(value);
      } catch (error) {
        console.error('Erreur chargement identité visuelle:', error);
        showToast('Impossible de charger le logo actuel.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void loadBranding();
  }, []);

  const handleFile = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Choisissez un fichier image.', 'error');
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      showToast('Le logo doit faire moins de 700 Ko.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ''));
    reader.onerror = () => showToast('Impossible de lire cette image.', 'error');
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(
        BRANDING_DOC,
        {
          logoDataUrl,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSavedLogo(logoDataUrl);
      showToast('Logo ImmoSecureNet mis à jour.', 'success');
    } catch (error) {
      console.error('Erreur sauvegarde identité visuelle:', error);
      showToast('Impossible d’enregistrer le logo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      await setDoc(
        BRANDING_DOC,
        {
          logoDataUrl: '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setLogoDataUrl('');
      setSavedLogo('');
      showToast('Logo personnalisé retiré. Le symbole par défaut est rétabli.', 'success');
    } catch (error) {
      console.error('Erreur réinitialisation logo:', error);
      showToast('Impossible de réinitialiser le logo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <h1 className="text-xl font-bold text-white">Identité visuelle</h1>
        <p className="text-xs text-slate-400 mt-1">
          Modifiez le logo affiché dans l’application sans toucher au code.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="w-28 h-28 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="Logo ImmoSecureNet" className="w-full h-full object-contain p-2" />
            ) : (
              <Shield className="w-14 h-14 text-[#1e3a8a]" strokeWidth={1.5} />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="font-bold text-slate-900">Logo de l’application</h2>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP ou SVG. Maximum 700 Ko.</p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold cursor-pointer hover:bg-blue-100">
              <ImagePlus className="w-4 h-4" />
              Choisir un logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={save}
            disabled={saving || loading || logoDataUrl === savedLogo}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          <button
            onClick={reset}
            disabled={saving || loading || (!logoDataUrl && !savedLogo)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Logo par défaut
          </button>
        </div>
      </div>
    </div>
  );
};

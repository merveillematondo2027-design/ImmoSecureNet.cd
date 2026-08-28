import React, { useState } from 'react';
import {
  Building,
  PlusCircle,
  ShieldCheck,
  FileText,
  Lock,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  X,
  MapPin,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Property, PropertyType, DocumentType, VerificationStatus } from '../../types';

export const OwnerPropertiesView: React.FC = () => {
  const { properties, createProperty, showToast, setActiveNavTab } = useProperties();
  const { currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Form State for Adding Property
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.VILLA);
  const [cadastralReference, setCadastralReference] = useState('');
  const [titleDeedNumber, setTitleDeedNumber] = useState('');
  const [surface, setSurface] = useState(350);
  const [city, setCity] = useState('Kinshasa');
  const [neighborhood, setNeighborhood] = useState('Ngaliema');
  const [address, setAddress] = useState('Avenue de la Paix');
  const [estimatedValue, setEstimatedValue] = useState(450000);
  const [docName, setDocName] = useState('Certificat_Enregistrement_Foncier.pdf');

  // Filter properties owned by current user or default list
  const ownerProperties = properties.filter(
    (p) => p.ownerId === currentUser?.id || currentUser?.role === 'OWNER' || true
  );

  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createProperty({
      ownerId: currentUser?.id || 'usr-owner-01',
      title,
      propertyType,
      cadastralReference: cadastralReference || `CAD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      titleDeedNumber: titleDeedNumber || `TF-VOL-${Math.floor(100 + Math.random() * 900)}`,
      surface: Number(surface),
      estimatedValue: Number(estimatedValue),
      location: {
        city,
        neighborhood,
        address,
        country: 'RD Congo',
      },
      documents: [
        {
          id: `doc-${Date.now()}`,
          propertyId: `prop-${Date.now()}`,
          fileUrl: '',
          title: 'Certificat d’Enregistrement Foncier',
          documentType: DocumentType.TITRE_FONCIER,
          fileName: docName,
          fileSize: '3.4 MB',
          verificationStatus: VerificationStatus.PENDING,
          uploadedAt: new Date().toISOString(),
          isConfidential: true,
        },
      ],
      isPublishedOnMarketplace: false,
      taxComplianceStatus: 'CONFORME',
      hasLitigationFlag: false,
      verificationStatus: VerificationStatus.PENDING,
    });

    setShowAddModal(false);
    showToast('Nouveau bien enregistré et transmis au Cadastre pour certification !', 'success');
  };

  const formatPrice = (p?: number) => {
    if (!p) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white">Espace Propriétaire / Bailleur</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
              Gestion de Patrimoine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consultez vos biens immobiliers, stockez vos titres certifiés et publiez vos annonces en toute sécurité.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un bien</span>
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ownerProperties.map((prop) => (
          <div
            key={prop.id}
            onClick={() => setSelectedProperty(prop)}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-5 shadow-lg space-y-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {prop.propertyType}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    prop.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {prop.verificationStatus === 'VERIFIED' ? 'Titre Vérifié' : 'En cours d’audit'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                  {prop.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{prop.location.neighborhood}, {prop.location.city}</span>
                </div>
              </div>

              {/* Cadastral Details Box */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Réf. Cadastrale :</span>
                  <span className="font-mono text-cyan-300 font-semibold">{prop.cadastralReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">N° Titre Foncier :</span>
                  <span className="font-mono text-slate-200">{prop.titleDeedNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Superficie :</span>
                  <span className="font-semibold text-white">{prop.surface} m²</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-white font-bold">{formatPrice(prop.estimatedValue)}</div>
              <button className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                <span>Consulter le coffre</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PROPERTY VAULT & DOCUMENTS MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-5 my-auto max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedProperty.title}</h3>
                  <p className="text-[10px] text-slate-400">Coffre-fort numérique de propriété</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-300 font-semibold">Titre Foncier Actif</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">{selectedProperty.titleDeedNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Valeur déclarée</div>
                <div className="text-sm font-bold text-emerald-400">{formatPrice(selectedProperty.estimatedValue)}</div>
              </div>
            </div>

            {/* Attached Deeds & Certifications */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Documents officiels rattachés</div>
              {selectedProperty.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">{doc.title}</div>
                      <div className="text-[10px] text-slate-400">{doc.fileName} • {doc.fileSize}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Certifié
                  </span>
                </div>
              ))}
            </div>

            {/* Marketplace Mandate Action */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Mise en vente ou en location</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Vous pouvez publier directement ce bien ou déléguer un mandat exclusif à une agence agréée.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    setActiveNavTab('marketplace');
                    showToast('Bien sélectionné pour diffusion sur la Marketplace !', 'info');
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Publier sur la Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROPERTY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Enregistrer un bien foncier</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Désignation du bien *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Villa familiale R+1 avec jardin et dépendance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type de bien</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={PropertyType.VILLA}>Villa</option>
                    <option value={PropertyType.APARTMENT}>Appartement</option>
                    <option value={PropertyType.LAND}>Terrain Foncier</option>
                    <option value={PropertyType.BUILDING}>Immeuble</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Superficie (m²) *</label>
                  <input
                    type="number"
                    required
                    value={surface}
                    onChange={(e) => setSurface(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Réf. Cadastrale</label>
                  <input
                    type="text"
                    placeholder="Ex: CAD-2026-NGA-884"
                    value={cadastralReference}
                    onChange={(e) => setCadastralReference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">N° Titre Foncier</label>
                  <input
                    type="text"
                    placeholder="Ex: TF-VOL-912-FOL-44"
                    value={titleDeedNumber}
                    onChange={(e) => setTitleDeedNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Commune / Ville</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valeur estimée (USD)</label>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Foncier (PDF)</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                Enregistrer dans mon coffre-fort
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

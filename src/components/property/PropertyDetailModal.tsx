import React, { useState } from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Heart,
  Share2,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Lock,
  ChevronLeft,
  ChevronRight,
  Send,
  Building,
  UserCheck,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Listing, PropertyType, ListingType, DocumentType } from '../../types';

interface PropertyDetailModalProps {
  listing: Listing;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ listing, onClose }) => {
  const { favorites, toggleFavorite, submitInquiry, properties, showToast, setActiveNavTab } = useProperties();
  const { currentUser, isAuthenticated } = useAuth();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'SIMULATOR' | 'INQUIRY'>('OVERVIEW');

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState(currentUser?.fullName || '');
  const [inquiryEmail, setInquiryEmail] = useState(currentUser?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(currentUser?.phone || '');
  const [inquiryType, setInquiryType] = useState<'VISIT_REQUEST' | 'PRICE_INFO' | 'LEGAL_DOCS' | 'FINANCING'>('VISIT_REQUEST');
  const [inquiryMessage, setInquiryMessage] = useState(
    'Bonjour, je souhaite obtenir de plus amples informations sur ce bien vérifié et programmer une visite.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mortgage Calculator State
  const [loanTermYears, setLoanTermYears] = useState(15);
  const [interestRate, setInterestRate] = useState(6.5);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  const isFav = favorites.includes(listing.id);

  // Associated property details from cadastre
  const linkedProperty = properties.find((p) => p.id === listing.propertyId) || {
    cadastralReference: 'CAD-2026-REF-0981',
    titleDeedNumber: 'TF-VOL-842-FOLIO-112',
    taxComplianceStatus: 'CONFORME',
    hasLitigationFlag: false,
    documents: [
      {
        id: 'doc-def-01',
        title: 'Certificat d’Enregistrement Foncier Officiel',
        documentType: DocumentType.TITRE_FONCIER,
        fileName: 'Certificat_Enregistrement_Foncier.pdf',
        fileSize: '3.1 MB',
        verificationStatus: 'VERIFIED',
        uploadedAt: '2026-01-10',
        isConfidential: false,
      },
      {
        id: 'doc-def-02',
        title: 'Plan Cadastral et Bornage Géomètre Expert',
        documentType: DocumentType.PLAN_CADASTRAL,
        fileName: 'Plan_Cadastral_Géoréférencé.pdf',
        fileSize: '4.8 MB',
        verificationStatus: 'VERIFIED',
        uploadedAt: '2026-01-10',
        isConfidential: false,
      },
    ],
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'XAF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate monthly mortgage payment
  const downPayment = (listing.price * downPaymentPercent) / 100;
  const loanAmount = listing.price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  const monthlyPayment =
    listing.listingType === ListingType.SALE
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : listing.price;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await submitInquiry({
      listingId: listing.id,
      listingTitle: listing.title,
      senderName: inquiryName,
      senderEmail: inquiryEmail,
      senderPhone: inquiryPhone,
      message: inquiryMessage,
      inquiryType,
    });

    setIsSubmitting(false);
    if (success) {
      setActiveTab('OVERVIEW');
    }
  };

  const handleStartDirectChat = () => {
    onClose();
    setActiveNavTab('messages');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Lien de l’annonce certifiée copié !', 'info');
    }
  };

  const gallery = listing.galleryPhotos?.length ? listing.galleryPhotos : [listing.mainPhoto];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Sticky Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 shadow-xs ${
                listing.listingType === ListingType.SALE
                  ? 'bg-blue-700 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {listing.listingType === ListingType.SALE ? 'Vente Certifiée' : 'Location Certifiée'}
            </span>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-xs sm:max-w-md">
              {listing.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShare}
              aria-label="Partager l'annonce"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite(listing.id)}
              aria-label="Ajouter aux favoris"
              className={`p-2 rounded-xl transition-colors ${
                isFav
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Gallery Carousel */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            <img
              src={gallery[activePhotoIdx]}
              alt={listing.title}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center justify-center hover:bg-white border border-slate-200 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center justify-center hover:bg-white border border-slate-200 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold">
                  {activePhotoIdx + 1} / {gallery.length} photos
                </div>
              </>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'OVERVIEW', label: 'Présentation & Cadastre', icon: Building },
              { id: 'DOCUMENTS', label: 'Dossier Légal & Titre', icon: FileText },
              { id: 'SIMULATOR', label: 'Simulateur Financement', icon: Calculator },
              { id: 'INQUIRY', label: 'Demande de Visite', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Price & Location Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-700">
                    {formatPrice(listing.price, listing.currency)}
                    {listing.listingType === ListingType.RENT && (
                      <span className="text-xs font-normal text-slate-500"> /mois charges comprises</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{listing.location.address}, {listing.location.neighborhood}, {listing.location.city}</span>
                  </div>
                </div>

                {/* Cadastre Verification Pill */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">Cadastre Vérifié & Authentifié</div>
                    <div className="text-[10px] text-emerald-700 font-mono">
                      Réf: {linkedProperty.cadastralReference}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Specs Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <Maximize2 className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{listing.surface} m²</div>
                  <div className="text-[10px] text-slate-500">Superficie habitable</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <Bed className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{listing.bedrooms}</div>
                  <div className="text-[10px] text-slate-500">Chambres</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <Bath className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{listing.bathrooms}</div>
                  <div className="text-[10px] text-slate-500">Salles de bain</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">Conforme</div>
                  <div className="text-[10px] text-slate-500">Non-litige foncier</div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900">Description détaillée</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {listing.fullDescription || listing.shortDescription}
                </p>
              </div>

              {/* Key Features */}
              {listing.features && listing.features.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-900">Équipements & Prestations sécurisées</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {listing.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publisher Contact Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  {listing.publishedBy.avatarUrl ? (
                    <img
                      src={listing.publishedBy.avatarUrl}
                      alt={listing.publishedBy.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {listing.publishedBy.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">{listing.publishedBy.name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium">
                      {listing.publishedBy.companyName || 'Professionnel Agréé ImmoSecureNet'}
                    </p>
                    <p className="text-[10px] text-slate-500">{listing.publishedBy.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleStartDirectChat}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-700" />
                    <span>Discuter</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('INQUIRY')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Prendre RDV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEGAL DOCUMENTS VAULT */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Traçabilité Foncière & Cadastrale de l’État</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Ce bien fait l'objet d'une vérification rigoureuse auprès du Conservateur des Titres Immobiliers et du Service Géographique National.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {linkedProperty.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Certifié Authentique
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Les actes notariés originaux et titres complets sont consultables par l'acheteur et l'Auditeur d'État après formalisation de l'offre d'achat.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: MORTGAGE SIMULATOR */}
          {activeTab === 'SIMULATOR' && (
            <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Simulateur de Crédit & Financement Immo</h3>
                  <p className="text-[11px] text-slate-500">Estimez vos mensualités avec nos banques partenaires</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Apport personnel (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Soit {formatPrice(downPayment, listing.currency)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Durée du crédit (Années)
                  </label>
                  <select
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 ans (120 mois)</option>
                    <option value={15}>15 ans (180 mois)</option>
                    <option value={20}>20 ans (240 mois)</option>
                    <option value={25}>25 ans (300 mois)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taux d’intérêt annuel (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="15"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Simulation Result */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                <div className="text-xs text-slate-600 font-medium">Mensualité estimée :</div>
                <div className="text-2xl sm:text-3xl font-black text-blue-700">
                  {formatPrice(monthlyPayment, listing.currency)}
                  <span className="text-xs font-normal text-slate-500"> /mois</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Montant emprunté : {formatPrice(loanAmount, listing.currency)} • Assurance et audit cadastral inclus.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: INQUIRY FORM */}
          {activeTab === 'INQUIRY' && (
            <form onSubmit={handleInquirySubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Calendar className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Programmer une visite ou poser une question</h3>
                  <p className="text-[11px] text-slate-500">Transmission directe à {listing.publishedBy.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objet de la demande</label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VISIT_REQUEST">Demande de visite sur place</option>
                  <option value="PRICE_INFO">Négociation de prix et conditions</option>
                  <option value="LEGAL_DOCS">Consultation des titres cadastraux</option>
                  <option value="FINANCING">Demande d'accompagnement bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Votre message</label>
                <textarea
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Envoi sécurisé...' : 'Transmettre ma demande au professionnel'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

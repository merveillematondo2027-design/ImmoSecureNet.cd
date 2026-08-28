import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Building,
  TrendingUp,
  Eye,
  MessageSquare,
  CheckCircle2,
  Clock,
  Archive,
  Edit,
  Trash2,
  ShieldCheck,
  Users,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  X,
  Send,
  Calendar,
  Check,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Listing, PropertyType, ListingType, ListingStatus, PropertyInquiry, UserRole } from '../../types';

export const AgentDashboardView: React.FC = () => {
  const { listings, createListing, updateListing, deleteListing, inquiries, showToast, setActiveNavTab } = useProperties();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'LISTINGS' | 'INQUIRIES' | 'STATS'>('LISTINGS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Form State for Create/Edit
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.APARTMENT);
  const [listingType, setListingType] = useState<ListingType>(ListingType.SALE);
  const [price, setPrice] = useState(250000);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'XAF'>('USD');
  const [city, setCity] = useState('Kinshasa');
  const [neighborhood, setNeighborhood] = useState('Gombe');
  const [address, setAddress] = useState('Avenue du Port');
  const [surface, setSurface] = useState(150);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [mainPhoto, setMainPhoto] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80');
  const [features, setFeatures] = useState('Sécurité 24/7, Climatisation, Parking sécurisé, Groupe électrogène');

  // Filter listings by current user/agent
  const agentListings = listings.filter(
    (l) => l.publishedBy.id === currentUser?.id || currentUser?.role === UserRole.ADMIN || true // display sample pro listings
  );

  const activeCount = agentListings.filter((l) => l.status === ListingStatus.ACTIVE).length;
  const pendingCount = agentListings.filter((l) => l.status === ListingStatus.PENDING_REVIEW).length;
  const soldCount = agentListings.filter((l) => l.status === ListingStatus.SOLD || l.status === ListingStatus.RENTED).length;
  const totalViews = agentListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const totalInquiries = inquiries.length;

  const handleOpenCreate = () => {
    setEditingListing(null);
    setTitle('');
    setShortDesc('');
    setFullDesc('');
    setPropertyType(PropertyType.APARTMENT);
    setListingType(ListingType.SALE);
    setPrice(250000);
    setSurface(150);
    setBedrooms(3);
    setBathrooms(2);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setTitle(listing.title);
    setShortDesc(listing.shortDescription);
    setFullDesc(listing.fullDescription);
    setPropertyType(listing.propertyType);
    setListingType(listing.listingType);
    setPrice(listing.price);
    setSurface(listing.surface);
    setBedrooms(listing.bedrooms);
    setBathrooms(listing.bathrooms);
    setCity(listing.location.city);
    setNeighborhood(listing.location.neighborhood);
    setAddress(listing.location.address);
    setMainPhoto(listing.mainPhoto);
    setFeatures(listing.features.join(', '));
    setShowCreateModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featureArray = features.split(',').map((f) => f.trim()).filter(Boolean);

    if (editingListing) {
      await updateListing(editingListing.id, {
        title,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        propertyType,
        listingType,
        price: Number(price),
        surface: Number(surface),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        location: {
          city,
          neighborhood,
          address,
          country: 'RD Congo',
        },
        mainPhoto,
        features: featureArray,
      });
    } else {
      await createListing({
        title,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        propertyType,
        listingType,
        price: Number(price),
        currency,
        surface: Number(surface),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        location: {
          city,
          neighborhood,
          address,
          country: 'RD Congo',
        },
        mainPhoto,
        galleryPhotos: [mainPhoto],
        features: featureArray,
        status: ListingStatus.ACTIVE,
        publishedBy: {
          id: currentUser?.id || 'usr-agent-02',
          name: currentUser?.fullName || 'Agent Immobilier Agréé',
          role: currentUser?.role || UserRole.AGENT,
          avatarUrl: currentUser?.avatarUrl,
          companyName: currentUser?.companyName || 'Immo Excellence Prestige',
          isVerified: true,
          phone: currentUser?.phone || '+243 89 765 4321',
          email: currentUser?.email || 'agent@immosecure.net',
        },
      });
    }

    setShowCreateModal(false);
  };

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    await updateListing(listingId, { status: newStatus });
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Tableau de bord {currentUser?.role === 'AGENCY' ? 'Agence' : 'Agent'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
              Agrément Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos annonces certifiées, suivez vos demandes clients et analysez votre visibilité.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Créer une annonce</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Annonces Actives</span>
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{activeCount}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Conformes au Cadastre
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>En attente validation</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</div>
          <div className="text-[10px] text-slate-400">Contrôle anti-fraude</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Demandes clients</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalInquiries}</div>
          <div className="text-[10px] text-cyan-400">Demandes de visite</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vues globales</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300">{totalViews}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% ce mois
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'LISTINGS', label: `Mes Annonces (${agentListings.length})`, icon: Building },
          { id: 'INQUIRIES', label: `Demandes reçues (${inquiries.length})`, icon: MessageSquare },
          { id: 'STATS', label: 'Performances & Taux', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT */}
      {activeTab === 'LISTINGS' && (
        <div className="space-y-3">
          {agentListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={listing.mainPhoto}
                  alt={listing.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        listing.status === ListingStatus.ACTIVE
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : listing.status === ListingStatus.PENDING_REVIEW
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {listing.status === ListingStatus.ACTIVE
                        ? 'En ligne'
                        : listing.status === ListingStatus.PENDING_REVIEW
                        ? 'En attente'
                        : listing.status}
                    </span>
                    <span className="text-xs font-bold text-white">{formatPrice(listing.price)}</span>
                    <span className="text-[10px] text-slate-400">
                      {listing.listingType === ListingType.SALE ? 'Vente' : 'Location'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-white truncate mt-1">{listing.title}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                    <span>{listing.location.neighborhood}, {listing.location.city}</span>
                    <span>•</span>
                    <span>{listing.viewsCount} vues</span>
                    <span>•</span>
                    <span>{listing.inquiriesCount} demandes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                {listing.status === ListingStatus.ACTIVE ? (
                  <button
                    onClick={() => handleStatusChange(listing.id, ListingStatus.SOLD)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Marquer Vendu/Loué
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(listing.id, ListingStatus.ACTIVE)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Activer
                  </button>
                )}

                <button
                  onClick={() => handleOpenEdit(listing)}
                  aria-label="Modifier l'annonce"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteListing(listing.id)}
                  aria-label="Supprimer l'annonce"
                  className="p-2 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: INQUIRIES */}
      {activeTab === 'INQUIRIES' && (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">{inq.senderName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {inq.inquiryType}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-400 mt-0.5 font-medium">{inq.listingTitle}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Email: {inq.senderEmail} • Tél: {inq.senderPhone}
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(inq.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                "{inq.message}"
              </p>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setActiveNavTab('messages');
                    showToast('Redirection vers la messagerie sécurisée...', 'info');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Répondre par Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === 'STATS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white">Statistiques de visibilité & conversion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-cyan-400">4.2%</div>
              <div className="text-xs text-slate-300 mt-1 font-semibold">Taux de conversion vues/demandes</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Moyenne nationale: 2.8%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-400">18 j</div>
              <div className="text-xs text-slate-300 mt-1 font-semibold">Délai moyen de contractualisation</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Biens avec titre certifié</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-purple-400">100%</div>
              <div className="text-xs text-slate-300 mt-1 font-semibold">Conformité Cadastrale</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zéro litige foncier enregistré</div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LISTING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {editingListing ? 'Modifier l’annonce' : 'Créer une annonce certifiée'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Titre de l’annonce *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Villa contemporaine avec piscine et sécurité 24/7"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type de bien</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={PropertyType.APARTMENT}>Appartement</option>
                    <option value={PropertyType.VILLA}>Villa</option>
                    <option value={PropertyType.COMMERCIAL}>Commercial</option>
                    <option value={PropertyType.LAND}>Terrain Foncier</option>
                    <option value={PropertyType.BUILDING}>Immeuble</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction</label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={ListingType.SALE}>Vente</option>
                    <option value={ListingType.RENT}>Location</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prix (USD) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Commune / Quartier *</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ville</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Surface (m²) *</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de chambres</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de salles de bain</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Photo principale (URL)</label>
                <input
                  type="text"
                  value={mainPhoto}
                  onChange={(e) => setMainPhoto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Équipements (séparés par virgules)</label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description courte</label>
                <textarea
                  rows={2}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Résumé accrocheur pour la carte de la Marketplace"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                {editingListing ? 'Enregistrer les modifications' : 'Publier sur la Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

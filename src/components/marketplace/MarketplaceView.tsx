import React, { useState, useMemo } from 'react';
import { 
  Search, CheckCircle2, ShieldCheck, MapPin, 
  Home, Building2, HardHat, Sofa, Lightbulb, Shield,
  ChevronDown, DollarSign
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { ListingType, PropertyType } from '../../types';

export const MarketplaceView: React.FC = () => {
  const { listings, setSelectedListing } = useProperties();
  const [activeTab, setActiveTab] = useState<'LOCATION' | 'VENTE' | 'ACHAT'>('LOCATION');

  // We only show a few recent listings
  const recentListings = useMemo(() => {
    return listings
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3);
  }, [listings]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'XAF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. HERO - TROUVER LE BIEN IDÉAL */}
      <div className="bg-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row relative mt-2">
        <div className="p-5 md:p-8 flex-1 z-10 bg-gradient-to-r from-slate-100 via-slate-100 to-transparent">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-1">
            TROUVER LE BIEN IDÉAL
          </h2>
          <p className="text-sm font-bold text-slate-800 mb-4">
            Vente, location et achat de biens immobiliers
          </p>
          
          <ul className="space-y-1.5 mb-6 md:mb-0">
            {['Maisons', 'Appartements', 'Terrains', 'Immeubles', 'Bureaux & Commerces'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="w-4 h-4 rounded-full bg-[#16a34a] flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Maison moderne" 
            className="w-full h-48 md:h-full object-cover rounded-b-2xl md:rounded-l-none md:rounded-r-2xl"
          />
        </div>
      </div>

      {/* 2. RECHERCHE PRINCIPALE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('LOCATION')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'LOCATION' ? 'bg-[#1e3a8a] text-white' : 'bg-slate-50 text-slate-600'}`}
          >
            <MapPin className="w-4 h-4" /> LOCATION
          </button>
          <button 
            onClick={() => setActiveTab('VENTE')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'VENTE' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-slate-600'}`}
          >
            <Search className="w-4 h-4" /> VENTE
          </button>
          <button 
            onClick={() => setActiveTab('ACHAT')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'ACHAT' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-slate-600'}`}
          >
            <Home className="w-4 h-4" /> ACHAT
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <MapPin className="w-4 h-4" />
            </div>
            <select className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
              <option>Province</option>
              <option>Kinshasa</option>
              <option>Kongo Central</option>
              <option>Haut-Katanga</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Building2 className="w-4 h-4" />
            </div>
            <select className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
              <option>Commune</option>
              <option>Gombe</option>
              <option>Limete</option>
              <option>Ngaliema</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <MapPin className="w-4 h-4" />
            </div>
            <select className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
              <option>Quartier</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Building2 className="w-4 h-4" />
            </div>
            <select className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
              <option>Type de bien</option>
              <option>Maison</option>
              <option>Appartement</option>
              <option>Terrain</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <select className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
              <option>Budget</option>
              <option>&lt; 50 000 $</option>
              <option>50 000 $ - 200 000 $</option>
              <option>&gt; 200 000 $</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button className="w-full py-3 mt-2 bg-[#1e3a8a] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1e40af] transition-colors">
            <Search className="w-4 h-4" /> RECHERCHER
          </button>
        </div>
      </div>

      {/* 3. LES 5 UNIVERS */}
      <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        {[
          { icon: Search, label: 'TROUVER', sub: 'Le bien idéal', color: 'text-[#16a34a]' },
          { icon: HardHat, label: 'CONSTRUIRE', sub: 'Vos projets', color: 'text-[#1e3a8a]' },
          { icon: Sofa, label: 'EQUIPER', sub: 'Votre maison', color: 'text-[#16a34a]' },
          { icon: Lightbulb, label: 'AMÉNAGER', sub: 'Votre espace', color: 'text-[#1e3a8a]' },
          { icon: Shield, label: 'SÉCURISER', sub: 'En toute confiance', color: 'text-[#16a34a]' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col items-center justify-start text-center gap-1 cursor-pointer hover:opacity-80">
              <Icon className={`w-6 h-6 md:w-8 md:h-8 ${item.color}`} />
              <div className={`text-[9px] md:text-xs font-bold mt-1 ${item.color}`}>{item.label}</div>
              <div className="text-[8px] md:text-[10px] text-slate-600 leading-tight">{item.sub}</div>
            </div>
          )
        })}
      </div>

      {/* 4. DEUX BLOCS PRINCIPAUX */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* BLOC 1: IMMOBILIER */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#1e3a8a] p-3 text-center text-white">
            <h3 className="font-bold text-sm">IMMOBILIER</h3>
            <p className="text-[10px]">Vente, location et achat</p>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4 flex-1">
            {[
              { icon: Home, label: 'Maisons' },
              { icon: Building2, label: 'Appartements' },
              { icon: MapPin, label: 'Terrains' },
              { icon: Building2, label: 'Immeubles' },
              { icon: Home, label: 'Bureaux' },
              { icon: Building2, label: 'Commerces' },
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                <cat.icon className="w-8 h-8 text-[#1e3a8a]" />
                <span className="text-[10px] font-semibold text-slate-700 text-center">{cat.label}</span>
              </div>
            ))}
          </div>
          <div className="p-3">
            <button className="w-full py-2.5 bg-[#1e3a8a] text-white rounded-lg font-bold text-xs hover:bg-[#1e40af] transition-colors">
              VOIR TOUS LES BIENS
            </button>
          </div>
        </div>

        {/* BLOC 2: MARCHÉ DE L'HABITAT */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#16a34a] p-3 text-center text-white">
            <h3 className="font-bold text-sm">LE MARCHÉ DE L'HABITAT</h3>
            <p className="text-[10px]">Tout pour construire, équiper et aménager</p>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4 flex-1">
            {[
              { icon: Sofa, label: 'Meubles & Décoration' },
              { icon: Lightbulb, label: 'Électroménager & Équipements' },
              { icon: Lightbulb, label: 'Énergie & Solaire' },
              { icon: HardHat, label: 'Matériaux de Construction' },
              { icon: Sofa, label: 'Équipements pour la Maison' },
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                <cat.icon className="w-8 h-8 text-[#16a34a]" />
                <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">{cat.label}</span>
              </div>
            ))}
          </div>
          <div className="p-3">
            <button className="w-full py-2.5 bg-[#16a34a] text-white rounded-lg font-bold text-xs hover:bg-green-700 transition-colors">
              VOIR LE MARCHÉ
            </button>
          </div>
        </div>
      </div>

      {/* 5. VÉRIFIÉ PAR IMMOSECURENET */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="shrink-0">
          <div className="w-16 h-16 relative flex items-center justify-center">
            <Shield className="w-16 h-16 text-[#1e3a8a]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full text-center md:text-left">
          <h3 className="font-bold text-sm text-[#1e3a8a] mb-2 uppercase">VÉRIFIÉ PAR IMMOSECURENET</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 text-[11px] font-semibold text-slate-700">
            <div className="flex items-center gap-1 justify-center md:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Biens vérifiés
            </div>
            <div className="flex items-center gap-1 justify-center md:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Professionnels identifiés
            </div>
            <div className="flex items-center gap-1 justify-center md:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Annonces authentifiées
            </div>
            <div className="flex items-center gap-1 justify-center md:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Fournisseurs partenaires
            </div>
          </div>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4 text-center md:text-left w-full md:w-auto">
          <p className="text-[11px] font-bold text-[#16a34a]">Votre sécurité,<br/>notre engagement.</p>
        </div>
      </div>

      {/* 6. BIENS RÉCEMMENT AJOUTÉS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#1e3a8a] text-sm uppercase">BIENS RÉCEMMENT AJOUTÉS</h3>
          <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center">
            Voir tout <ChevronDown className="w-4 h-4 -rotate-90 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recentListings.map((listing) => (
            <div 
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="relative h-44 shrink-0 bg-slate-100">
                <img 
                  src={listing.mainPhoto} 
                  alt={listing.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className={`px-2 py-1 text-[10px] font-bold text-white rounded shadow-sm ${
                    listing.listingType === ListingType.SALE ? 'bg-emerald-600' : 'bg-[#16a34a]'
                  }`}>
                    {listing.listingType === ListingType.SALE ? 'À VENDRE' : 'À LOUER'}
                  </span>
                </div>
                {listing.publishedBy.isVerified && (
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-blue-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="p-3.5 flex flex-col flex-1">
                <div className="mb-2">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{listing.title}</h4>
                  <p className="text-xs text-slate-500">{listing.location.neighborhood} / {listing.location.city}</p>
                </div>
                <div className="font-bold text-lg text-slate-900 mb-3">
                  {formatPrice(listing.price, listing.currency)}
                  {listing.listingType === ListingType.RENT && <span className="text-[10px] font-normal text-slate-500 ml-1">/ mois</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-auto border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5"><Sofa className="w-3.5 h-3.5" /> {listing.bedrooms}</div>
                  <div className="flex items-center gap-1.5"><Sofa className="w-3.5 h-3.5" /> {listing.bathrooms}</div>
                  <div className="flex items-center gap-1.5 ml-auto"><Building2 className="w-3.5 h-3.5" /> {listing.surface} m²</div>
                </div>
              </div>
            </div>
          ))}
          {recentListings.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Aucun bien récent.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

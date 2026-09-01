import React from 'react';
import { ExternalLink } from 'lucide-react';
import { brandLogos } from './brandLogos';

type PartnerLogo = {
  id: string;
  name: string;
  logo?: string;
  url: string;
};

const partners: PartnerLogo[] = [
  { id: 'orca', name: 'ORCA Kinshasa', logo: brandLogos.orca, url: 'https://www.facebook.com/OrcaKinshasa' },
  { id: 'fournitures-plus', name: 'Fournitures et Plus', logo: brandLogos['fournitures-plus'], url: 'https://www.facebook.com/FournituresEtPlusKIN' },
  { id: 'congo-electro', name: 'Congo Electro', logo: brandLogos['congo-electro'], url: 'https://www.facebook.com/CONGOELECTRO' },
  { id: 'cimenterie-lukala', name: 'Cimenterie de Lukala', url: 'https://www.facebook.com/CimenteriedeLUKALA' },
  { id: 'devhome-drc', name: 'DevHome DRC', url: 'https://www.facebook.com/devhomedrc' },
];

const TextLogo: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-full h-full flex items-center justify-center px-3 text-center">
    <span className="text-lg sm:text-xl font-black tracking-tight text-[#1e3a8a] leading-tight">{name}</span>
  </div>
);

export const FurnitureMarketplaceView: React.FC = () => {
  const openPartner = (partner: PartnerLogo) => {
    window.open(partner.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pb-24 max-w-3xl mx-auto space-y-4">
      <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h1 className="text-2xl font-black text-[#1e3a8a]">I-SHOP</h1>
        <p className="text-sm text-slate-500 mt-1">Touchez le logo d’un partenaire pour ouvrir directement sa page officielle.</p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {partners.map((partner) => (
          <button
            key={partner.id}
            type="button"
            onClick={() => openPartner(partner)}
            aria-label={`Ouvrir ${partner.name}`}
            className="relative aspect-square rounded-2xl bg-white border border-slate-200 shadow-sm p-3 flex items-center justify-center overflow-hidden hover:border-[#1e3a8a]/40 active:scale-[0.98] transition"
          >
            {partner.logo ? (
              <img src={partner.logo} alt={`Logo ${partner.name}`} className="max-w-full max-h-full object-contain" />
            ) : (
              <TextLogo name={partner.name} />
            )}
            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center text-[#1e3a8a]">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </button>
        ))}
      </section>
    </div>
  );
};

import React from 'react';
import { ExternalLink } from 'lucide-react';

type HotelPartner = {
  id: string;
  name: string;
  url: string;
  wordmark: string;
};

const hotels: HotelPartner[] = [
  { id: 'fch-blazon', name: 'FCH by Blazon Hotels', url: 'https://www.facebook.com/FCHbyBlazonHotels', wordmark: 'FCH' },
  { id: 'hilton-kinshasa', name: 'Hilton Kinshasa', url: 'https://www.facebook.com/HiltonKinshasa', wordmark: 'HILTON' },
  { id: 'partner-hotel', name: 'Partenaire hôtelier', url: 'https://www.facebook.com/profile.php?id=61575234555121', wordmark: 'HÔTEL' },
];

export const HotelPartnersView: React.FC = () => {
  return (
    <div className="pb-24 max-w-3xl mx-auto space-y-4">
      <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h1 className="text-2xl font-black text-[#1e3a8a]">Hôtels</h1>
        <p className="text-sm text-slate-500 mt-1">Touchez le logo d’un hôtel partenaire pour ouvrir directement sa page officielle.</p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {hotels.map((hotel) => (
          <button
            key={hotel.id}
            type="button"
            onClick={() => window.open(hotel.url, '_blank', 'noopener,noreferrer')}
            aria-label={`Ouvrir ${hotel.name}`}
            className="relative aspect-square rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-center overflow-hidden hover:border-[#1e3a8a]/40 active:scale-[0.98] transition"
          >
            <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center px-3 text-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1e3a8a]">{hotel.wordmark}</span>
            </div>
            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center text-[#1e3a8a]">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </button>
        ))}
      </section>
    </div>
  );
};

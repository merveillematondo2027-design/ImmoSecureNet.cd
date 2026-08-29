import React from 'react';
import { Plane, Wifi } from 'lucide-react';

type Partner = { name: string; url: string; kind: 'AIRLINE' | 'CONNECTIVITY'; initials: string };

const PARTNERS: Partner[] = [
  { name: 'Air Congo', url: 'https://www.air-congo.com/', kind: 'AIRLINE', initials: 'AC' },
  { name: 'Congo Airways', url: 'https://www.congoairways.com/', kind: 'AIRLINE', initials: 'CA' },
  { name: "Compagnie Africaine d'Aviation (CAA)", url: 'https://www.caacongo.com/index.php', kind: 'AIRLINE', initials: 'CAA' },
  { name: 'Vodacom RDC', url: 'https://www.vodacom.com/', kind: 'CONNECTIVITY', initials: 'V' },
];

const PartnerGrid: React.FC<{ title: string; kind: Partner['kind'] }> = ({ title, kind }) => {
  const items = PARTNERS.filter((partner) => partner.kind === kind);
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-slate-900">
        {kind === 'AIRLINE' ? <Plane className="w-5 h-5 text-[#1e3a8a]" /> : <Wifi className="w-5 h-5 text-[#16a34a]" />}
        <h2 className="font-black text-base uppercase">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((partner) => (
          <button key={partner.name} type="button" onClick={() => window.open(partner.url, '_blank', 'noopener,noreferrer')} className="bg-white border border-slate-200 rounded-2xl min-h-28 p-4 shadow-sm hover:shadow-md flex items-center justify-center" aria-label={`Ouvrir ${partner.name}`}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-[#1e3a8a] text-sm">{partner.initials}</div>
              <div className="mt-2 text-xs font-bold text-slate-700 line-clamp-2">{partner.name}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export const ConnectivityPartnersView: React.FC = () => (
  <div className="pb-24 max-w-3xl mx-auto space-y-6">
    <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <h1 className="text-xl sm:text-2xl font-black text-[#1e3a8a]">COMPAGNIES AÉRIENNES & CONNECTIVITÉ</h1>
      <p className="text-sm text-slate-500 mt-2">Accédez directement aux sources des compagnies aériennes et partenaires de connectivité.</p>
    </section>
    <PartnerGrid title="Compagnies aériennes" kind="AIRLINE" />
    <PartnerGrid title="Connectivité" kind="CONNECTIVITY" />
  </div>
);

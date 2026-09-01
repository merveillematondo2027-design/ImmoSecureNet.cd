import React, { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, Building2, FileCheck2, Handshake, Landmark, Megaphone, Scale, ShieldCheck } from 'lucide-react';

const services = [
  { title: "Mise en relation pour la vente, l'achat ou la location", icon: Handshake },
  { title: 'Enregistrement et vérification des contrats', icon: FileCheck2 },
  { title: 'Financement immobilier', icon: Landmark },
  { title: 'Assurance immobilière et autres', icon: ShieldCheck },
  { title: 'Études immobilières, Architecture, ingénierie et construction', icon: Building2 },
  { title: 'Audits, Conseil juridique et accompagnement administratif', icon: Scale },
  { title: 'Publicité', icon: Megaphone },
  { title: 'Vérification et authentification des agents/agences immobilières', icon: BadgeCheck },
];

export const HomeServicesStrip: React.FC<{ seconds: number; onSeeAll: () => void }> = ({ seconds, onSeeAll }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % services.length),
      Math.max(2500, seconds * 1000),
    );
    return () => window.clearInterval(timer);
  }, [seconds]);

  const service = services[index];
  const Icon = service.icon;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-base text-slate-900 uppercase">Nos services</h3>
        <button type="button" onClick={onSeeAll} className="text-xs font-black text-[#1e3a8a] flex items-center gap-1 shrink-0">
          VOIR TOUT <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onSeeAll}
        className="w-full min-h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-[#173f8f] via-[#2058ba] to-[#0b9f68] text-white text-left p-5 flex items-center gap-4"
      >
        <span className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
          <Icon className="w-7 h-7" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.18em] font-bold text-white/75 mb-1">Service ImmoSecureNet</span>
          <span className="block text-lg sm:text-xl font-black leading-snug">{service.title}</span>
        </span>
      </button>

      <div className="flex justify-center gap-1.5" aria-label="Progression des services">
        {services.map((_, dotIndex) => (
          <span key={dotIndex} className={`h-1.5 rounded-full transition-all ${dotIndex === index ? 'w-6 bg-[#1e3a8a]' : 'w-1.5 bg-slate-300'}`} />
        ))}
      </div>
    </section>
  );
};

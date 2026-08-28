import React, { TouchEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Pause, Play, X } from 'lucide-react';

type PageElement =
  | { type: 'title'; content: string }
  | { type: 'subtitle'; content: string }
  | { type: 'text'; content: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; poster?: string; caption?: string }
  | { type: 'ad'; image?: string; text: string; buttonLabel?: string; link?: string };

interface MagazinePage { id: string; elements: PageElement[]; }
interface MagazineEdition {
  id: string;
  title: string;
  edition: string;
  date: string;
  editor: string;
  description: string;
  coverImage: string;
  pages: MagazinePage[];
}

const EDITIONS: MagazineEdition[] = [
  {
    id: 'journal-01',
    title: "L'Observateur Immobilier",
    edition: 'Édition Kinshasa',
    date: 'Août 2026',
    editor: 'ImmoSecureNet Presse',
    description: "Marché immobilier, sécurité foncière, habitat et économie en RDC.",
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
    pages: [
      { id: 'p1', elements: [
        { type: 'title', content: 'Immobilier : les quartiers qui bougent' },
        { type: 'subtitle', content: 'Kinshasa, entre nouveaux projets et sécurisation des biens' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85', alt: 'Habitat urbain', caption: 'Dossier immobilier' },
        { type: 'text', content: "Les nouvelles offres se concentrent autour des zones résidentielles et des axes en développement. La traçabilité des biens devient un critère central pour les acquéreurs et locataires." }
      ]},
      { id: 'p2', elements: [
        { type: 'title', content: 'Sécuriser avant de signer' },
        { type: 'text', content: "Vérification du vendeur, contrôle documentaire et historique de transaction : ces étapes permettent de réduire fortement le risque avant une opération immobilière." },
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=85', caption: 'Vidéo explicative — toucher pour lire' }
      ]},
      { id: 'p3', elements: [
        { type: 'title', content: 'Habitat & économie' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85', alt: 'Mobilier', caption: 'Marché de l’habitat' },
        { type: 'text', content: "Matériaux, mobilier, énergie et équipements deviennent un marché complémentaire majeur autour de l'immobilier." },
        { type: 'ad', text: 'Découvrez les partenaires du Marché de l’habitat', buttonLabel: 'VOIR LE MARCHÉ' }
      ]}
    ]
  },
  {
    id: 'journal-02',
    title: 'Économie & Habitat',
    edition: 'Numéro spécial',
    date: 'Juillet 2026',
    editor: 'ImmoSecureNet Presse',
    description: "Investissement, construction, financement et consommation autour du logement.",
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85',
    pages: [
      { id: 'p1', elements: [
        { type: 'title', content: 'Construire et financer' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=85', alt: 'Construction', caption: 'Architecture & construction' },
        { type: 'text', content: "Le financement immobilier et la disponibilité des matériaux influencent directement le rythme des projets urbains." }
      ]}
    ]
  }
];

export const JournalView: React.FC = () => {
  const [selectedEdition, setSelectedEdition] = useState<MagazineEdition | null>(null);
  const [pageIndex, setPageIndex] = useState(-1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalPages = selectedEdition ? selectedEdition.pages.length + 1 : 0;
  const visiblePageNumber = pageIndex + 2;

  const stopAllVideos = () => {
    document.querySelectorAll<HTMLVideoElement>('[data-journal-video="true"]').forEach((video) => video.pause());
  };

  const next = () => {
    if (!selectedEdition || pageIndex >= selectedEdition.pages.length - 1) return;
    stopAllVideos();
    setDirection('next');
    setPageIndex((p) => p + 1);
  };

  const prev = () => {
    if (!selectedEdition || pageIndex <= -1) return;
    stopAllVideos();
    setDirection('prev');
    setPageIndex((p) => p - 1);
  };

  const closeEdition = () => {
    stopAllVideos();
    setSelectedEdition(null);
    setPageIndex(-1);
  };

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance > 55) next();
    if (distance < -55) prev();
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!selectedEdition || lightbox) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') closeEdition();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [selectedEdition, pageIndex, lightbox]);

  if (!selectedEdition) {
    return (
      <div className="pb-24 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-[11px] font-black tracking-[0.22em] text-[#16a34a] uppercase">Presse</div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1e3a8a]">Journal immobilier & économique</h1>
          <p className="text-sm text-slate-500 mt-1">Feuilletez les éditions comme un véritable journal papier.</p>
        </div>

        <div className="space-y-7">
          {EDITIONS.map((edition) => (
            <article key={edition.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button type="button" onClick={() => { setSelectedEdition(edition); setPageIndex(-1); }} className="w-full text-left">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-[42%] bg-stone-100 p-4 sm:p-5">
                    <div className="relative mx-auto max-w-[320px] aspect-[3/4] bg-[#fdfbf5] shadow-[12px_12px_0_rgba(15,23,42,0.08),0_20px_45px_rgba(15,23,42,0.18)] border border-stone-300 overflow-hidden rotate-[-0.5deg]">
                      <img src={edition.coverImage} alt={edition.title} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-0 left-0 right-0 bg-[#f7f2e8]/95 text-slate-950 px-4 py-3 border-b-4 border-slate-900">
                        <div className="text-[9px] uppercase tracking-[0.24em] font-black text-slate-500">Journal de presse</div>
                        <div className="font-black text-2xl leading-none mt-1 font-serif">{edition.title}</div>
                        <div className="text-[10px] mt-1 font-bold">{edition.edition} • {edition.date}</div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="border-t border-white/50 pt-2 text-xs font-serif leading-snug">{edition.description}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-black text-[#16a34a] uppercase tracking-wider">{edition.editor}</div>
                      <h2 className="text-xl font-black text-slate-900 mt-1">{edition.title}</h2>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{edition.description}</p>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 text-[#1e3a8a] font-black text-sm">OUVRIR ET FEUILLETER <ChevronRight className="w-4 h-4" /></div>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  const currentPage = pageIndex >= 0 ? selectedEdition.pages[pageIndex] : null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#e8e3d8] flex flex-col overflow-hidden">
      <style>{`
        @keyframes pageNext { 0%{transform:perspective(1800px) rotateY(0deg);opacity:1} 45%{transform:perspective(1800px) rotateY(-72deg);opacity:.72} 100%{transform:perspective(1800px) rotateY(0deg);opacity:1} }
        @keyframes pagePrev { 0%{transform:perspective(1800px) rotateY(0deg);opacity:1} 45%{transform:perspective(1800px) rotateY(72deg);opacity:.72} 100%{transform:perspective(1800px) rotateY(0deg);opacity:1} }
        .journal-page-next{animation:pageNext .5s cubic-bezier(.2,.7,.2,1);transform-origin:left center}
        .journal-page-prev{animation:pagePrev .5s cubic-bezier(.2,.7,.2,1);transform-origin:right center}
      `}</style>

      <div className="h-14 bg-white/95 border-b border-stone-300 flex items-center justify-between px-3 sm:px-5 shrink-0 shadow-sm">
        <button onClick={closeEdition} className="flex items-center gap-2 text-slate-700 font-bold text-xs"><ArrowLeft className="w-4 h-4" /> KIOSQUE</button>
        <div className="text-center min-w-0">
          <div className="text-xs font-black text-slate-900 truncate max-w-[180px] sm:max-w-md">{selectedEdition.title}</div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500">{pageIndex === -1 ? 'Couverture' : `Page ${visiblePageNumber} / ${totalPages}`}</div>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 sm:py-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="relative max-w-5xl mx-auto min-h-full flex items-center justify-center">
          <button onClick={prev} disabled={pageIndex === -1} className="hidden sm:flex absolute left-0 z-20 w-11 h-11 rounded-full bg-white border border-stone-300 shadow-md items-center justify-center disabled:opacity-25"><ChevronLeft className="w-6 h-6" /></button>

          <div className="relative w-full max-w-[720px]" style={{ perspective: '1800px' }}>
            <div className="absolute -left-2 top-2 bottom-2 w-2 bg-stone-300 rounded-l-md shadow-inner" />
            <div key={`${selectedEdition.id}-${pageIndex}`} className={`relative bg-[#fffdf6] border border-stone-300 min-h-[76vh] sm:min-h-[82vh] shadow-[0_28px_70px_rgba(15,23,42,.24)] overflow-hidden ${direction === 'next' ? 'journal-page-next' : 'journal-page-prev'}`}>
              <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />

              {pageIndex === -1 ? (
                <div className="relative min-h-[76vh] sm:min-h-[82vh]">
                  <img src={selectedEdition.coverImage} alt={selectedEdition.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/75" />
                  <div className="absolute top-0 left-0 right-0 bg-[#f7f2e8]/95 border-b-4 border-slate-950 p-5 sm:p-7">
                    <div className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-slate-500 font-black">Journal immobilier & économique</div>
                    <h2 className="font-serif text-4xl sm:text-6xl font-black leading-none text-slate-950 mt-2">{selectedEdition.title}</h2>
                    <div className="mt-2 text-sm font-bold text-slate-700">{selectedEdition.edition} • {selectedEdition.date}</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                    <p className="font-serif text-lg sm:text-2xl leading-snug border-t border-white/60 pt-4">{selectedEdition.description}</p>
                    <button onClick={next} className="mt-5 bg-white text-slate-950 px-5 py-3 font-black text-xs shadow-lg">TOUCHER POUR OUVRIR LE JOURNAL →</button>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-9 pb-16">
                  <div className="border-b-4 border-slate-950 pb-2 mb-6 flex items-end justify-between gap-4">
                    <div className="font-serif text-xl font-black text-slate-950">{selectedEdition.title}</div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-500">{selectedEdition.date}</div>
                  </div>
                  {currentPage?.elements.map((element, index) => <JournalElement key={`${currentPage.id}-${index}`} element={element} onImageClick={setLightbox} />)}
                  <div className="mt-8 pt-3 border-t border-stone-300 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider"><span>{selectedEdition.editor}</span><span>Page {visiblePageNumber}</span></div>
                </div>
              )}
            </div>

            <div className="sm:hidden flex items-center justify-between mt-4 px-2 gap-2">
              <button onClick={prev} disabled={pageIndex === -1} className="px-3 py-2.5 rounded-full bg-white shadow border border-stone-300 disabled:opacity-30 text-xs font-bold flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Préc.</button>
              <span className="text-[9px] text-slate-600 font-bold text-center">Glissez ↔ pour feuilleter</span>
              <button onClick={next} disabled={pageIndex >= selectedEdition.pages.length - 1} className="px-3 py-2.5 rounded-full bg-white shadow border border-stone-300 disabled:opacity-30 text-xs font-bold flex items-center gap-1">Suiv. <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <button onClick={next} disabled={pageIndex >= selectedEdition.pages.length - 1} className="hidden sm:flex absolute right-0 z-20 w-11 h-11 rounded-full bg-white border border-stone-300 shadow-md items-center justify-center disabled:opacity-25"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"><X className="w-6 h-6" /></button>
          <img src={lightbox} alt="Agrandissement" className="max-w-full max-h-[90vh] object-contain animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
};

const JournalElement: React.FC<{ element: PageElement; onImageClick: (src: string) => void }> = ({ element, onImageClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => videoRef.current?.pause(), []);

  if (element.type === 'title') return <h2 className="font-serif text-3xl sm:text-5xl leading-[.96] font-black text-slate-950 mb-4">{element.content}</h2>;
  if (element.type === 'subtitle') return <h3 className="font-serif text-lg sm:text-2xl font-bold text-slate-700 mb-5 border-b border-stone-300 pb-3">{element.content}</h3>;
  if (element.type === 'text') return <p className="font-serif text-[15px] sm:text-[17px] leading-7 text-slate-800 mb-6 columns-1 sm:columns-2 gap-7">{element.content}</p>;

  if (element.type === 'image') return (
    <figure className="mb-6 group">
      <button type="button" onClick={() => onImageClick(element.src)} className="relative w-full overflow-hidden border border-stone-300 bg-stone-100 shadow-sm">
        <img src={element.src} alt={element.alt} className="w-full max-h-[420px] object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        <span className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center"><Maximize2 className="w-4 h-4" /></span>
      </button>
      {element.caption && <figcaption className="font-serif italic text-xs text-slate-500 mt-1.5 border-b border-stone-300 pb-2">{element.caption}</figcaption>}
    </figure>
  );

  if (element.type === 'video') {
    const toggle = async () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) { await video.play(); setPlaying(true); }
      else { video.pause(); setPlaying(false); }
    };
    return (
      <figure className="mb-6">
        <div className="relative bg-black overflow-hidden border-4 border-slate-950 shadow-md">
          <video ref={videoRef} data-journal-video="true" src={element.src} poster={element.poster} playsInline className="w-full aspect-video object-cover" onEnded={() => setPlaying(false)} />
          <button type="button" onClick={toggle} className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/5 transition-colors">
            <span className="w-16 h-16 rounded-full bg-white/95 text-[#1e3a8a] flex items-center justify-center shadow-xl transition-transform hover:scale-105">{playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" fill="currentColor" />}</span>
          </button>
        </div>
        {element.caption && <figcaption className="font-serif italic text-xs text-slate-500 mt-1.5 border-b border-stone-300 pb-2">{element.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <div className="mb-6 border-y-4 border-slate-950 py-4 bg-amber-50 px-4">
      {element.image && <img src={element.image} alt="Publicité" className="w-full max-h-52 object-cover mb-3" />}
      <div className="font-serif text-xl font-black text-slate-950">{element.text}</div>
      {element.buttonLabel && <button className="mt-3 bg-[#1e3a8a] text-white px-4 py-2 text-xs font-black">{element.buttonLabel}</button>}
    </div>
  );
};

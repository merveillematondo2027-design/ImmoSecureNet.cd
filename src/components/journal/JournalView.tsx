import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause, ExternalLink, ArrowLeft } from 'lucide-react';

type PageElement = 
  | { type: 'title'; content: string; className?: string }
  | { type: 'subtitle'; content: string; className?: string }
  | { type: 'text'; content: string; className?: string }
  | { type: 'image'; src: string; alt: string; className?: string }
  | { type: 'video'; src: string; poster?: string; className?: string }
  | { type: 'button'; label: string; link?: string; action?: () => void; className?: string }
  | { type: 'ad'; image?: string; text?: string; buttonLabel?: string; link?: string; className?: string };

interface MagazinePage {
  id: string;
  elements: PageElement[];
}

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

const DUMMY_MAGAZINES: MagazineEdition[] = [
  {
    id: 'mag-01',
    title: 'L\'Observateur de l\'Habitat',
    edition: 'Édition Spéciale Kinshasa',
    date: 'Août 2026',
    editor: 'ImmoSecureNet Presse',
    description: 'Découvrez les dernières tendances de l\'immobilier à Kinshasa. Nouveaux quartiers résidentiels, astuces pour sécuriser votre titre foncier et bien plus.',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'p1',
        elements: [
          { type: 'title', content: 'Évolution du marché immobilier', className: 'text-2xl font-bold text-[#1e3a8a] mb-4' },
          { type: 'subtitle', content: 'Gombe et Ngaliema en tête de peloton', className: 'text-lg font-semibold text-slate-700 mb-4' },
          { type: 'image', src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80', alt: 'Quartier résidentiel', className: 'w-full h-48 object-cover rounded-lg mb-4 shadow-sm' },
          { type: 'text', content: 'Le marché immobilier dans la capitale congolaise connaît une croissance sans précédent. Les investisseurs se tournent massivement vers des quartiers comme la Gombe et Ngaliema.', className: 'text-sm text-slate-700 leading-relaxed mb-4' },
          { type: 'ad', text: 'Découvrez les appartements de luxe à la Gombe', buttonLabel: 'VOIR LES BIENS', link: '/marketplace', className: 'bg-blue-50 border border-blue-100 p-4 rounded-xl mt-6' }
        ]
      },
      {
        id: 'p2',
        elements: [
          { type: 'title', content: 'Sécuriser votre Titre Foncier', className: 'text-2xl font-bold text-[#1e3a8a] mb-4' },
          { type: 'text', content: 'La sécurisation des transactions immobilières est le cœur de métier d\'ImmoSecureNet. Voici comment notre technologie protège votre investissement.', className: 'text-sm text-slate-700 leading-relaxed mb-4' },
          { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.unsplash.com/photo-1555942129-653198eb537b?w=800&auto=format&fit=crop&q=80', className: 'w-full rounded-lg mb-4 shadow-sm' },
          { type: 'button', label: 'En savoir plus', className: 'w-full bg-[#1e3a8a] text-white py-3 rounded-lg font-bold' }
        ]
      },
      {
        id: 'p3',
        elements: [
          { type: 'title', content: 'Le mot de l\'éditeur', className: 'text-2xl font-bold text-[#16a34a] mb-4' },
          { type: 'image', src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80', alt: 'Editeur', className: 'w-full h-64 object-cover rounded-lg mb-4 shadow-sm' },
          { type: 'text', content: 'Notre mission est de rendre le marché de l\'habitat plus transparent et accessible à tous les Congolais, de la diaspora comme au pays.', className: 'text-sm text-slate-700 leading-relaxed italic border-l-4 border-[#16a34a] pl-4' }
        ]
      }
    ]
  },
  {
    id: 'mag-02',
    title: 'Tendances Déco & Aménagement',
    edition: 'Spécial Intérieurs',
    date: 'Juillet 2026',
    editor: 'Le Marché de l\'Habitat',
    description: 'Les meilleures idées pour aménager votre nouvel appartement. Couleurs de l\'année, mobilier intelligent et décoration responsable.',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'p1',
        elements: [
          { type: 'title', content: 'Le Minimalisme Tropical', className: 'text-2xl font-bold text-amber-600 mb-4' },
          { type: 'image', src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', alt: 'Salon minimaliste', className: 'w-full h-56 object-cover rounded-lg mb-4 shadow-sm' },
          { type: 'text', content: 'Intégrer des éléments de la nature tout en gardant des espaces épurés. C\'est la nouvelle tendance qui envahit les villas de Kinshasa.', className: 'text-sm text-slate-700 leading-relaxed' }
        ]
      }
    ]
  }
];

export const JournalView: React.FC = () => {
  const [selectedEdition, setSelectedEdition] = useState<MagazineEdition | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Touch handlers for swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextPage();
    } else if (isRightSwipe) {
      goToPrevPage();
    }
  };

  const goToNextPage = () => {
    if (selectedEdition && currentPageIndex < selectedEdition.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const closeEdition = () => {
    setSelectedEdition(null);
    setCurrentPageIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEdition || lightboxImage) return;
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') closeEdition();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdition, currentPageIndex, lightboxImage]);

  // If no edition is selected, show the feed
  if (!selectedEdition) {
    return (
      <div className="bg-slate-50 min-h-screen pb-24">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight uppercase">Kiosque Numérique</h1>
            <p className="text-sm text-slate-500 mt-1">L'actualité immobilière et le marché de l'habitat</p>
          </div>

          <div className="flex flex-col gap-8">
            {DUMMY_MAGAZINES.map((mag) => (
              <div 
                key={mag.id} 
                onClick={() => { setSelectedEdition(mag); setCurrentPageIndex(0); }}
                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02] border border-slate-100 flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-2/5 h-64 sm:h-auto relative shrink-0">
                  <img src={mag.coverImage} alt={mag.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-[#1e3a8a] text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">
                      {mag.edition}
                    </span>
                    <h2 className="text-white font-bold text-xl leading-tight">{mag.title}</h2>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-medium">
                      <span>{mag.date}</span>
                      <span>{mag.editor}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {mag.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-[#16a34a] font-bold text-sm group">
                    Lire l'édition 
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Reading Mode
  const currentPage = selectedEdition.pages[currentPageIndex];

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col overflow-hidden">
      {/* Reader Header */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white shadow-sm z-10">
        <button 
          onClick={closeEdition}
          className="flex items-center gap-1.5 text-slate-600 hover:text-[#1e3a8a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase">Retour au Kiosque</span>
        </button>
        <div className="text-[11px] font-bold text-slate-400">
          PAGE {currentPageIndex + 1} / {selectedEdition.pages.length}
        </div>
      </div>

      {/* Reader Content - Swipeable Area */}
      <div 
        className="flex-1 overflow-y-auto bg-slate-50 relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="max-w-md mx-auto min-h-full bg-white shadow-xl shadow-black/5 relative overflow-hidden">
          
          {/* Page Content */}
          <div className="p-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
            {currentPage.elements.map((el, idx) => (
              <ElementRenderer 
                key={`${currentPage.id}-${idx}`} 
                element={el} 
                onImageClick={(src) => setLightboxImage(src)}
              />
            ))}
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex absolute inset-y-0 left-0 items-center justify-start pointer-events-none">
            <button 
              onClick={goToPrevPage} 
              disabled={currentPageIndex === 0}
              className="pointer-events-auto w-10 h-10 ml-4 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="hidden sm:flex absolute inset-y-0 right-0 items-center justify-end pointer-events-none">
            <button 
              onClick={goToNextPage} 
              disabled={currentPageIndex === selectedEdition.pages.length - 1}
              className="pointer-events-auto w-10 h-10 mr-4 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain" />
        </div>
      )}
    </div>
  );
};

// Separate component to handle individual elements, especially video for lifecycle management
const ElementRenderer: React.FC<{ element: PageElement; onImageClick: (src: string) => void }> = ({ element, onImageClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-pause video when component unmounts (page change or journal close)
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  switch (element.type) {
    case 'title':
      return <h2 className={element.className}>{element.content}</h2>;
    case 'subtitle':
      return <h3 className={element.className}>{element.content}</h3>;
    case 'text':
      return <p className={element.className}>{element.content}</p>;
    case 'image':
      return (
        <img 
          src={element.src} 
          alt={element.alt} 
          className={`${element.className} cursor-pointer hover:opacity-95 transition-opacity`} 
          onClick={() => onImageClick(element.src)}
        />
      );
    case 'video':
      return (
        <div className={`relative group ${element.className} overflow-hidden`}>
          <video 
            ref={videoRef}
            src={element.src} 
            poster={element.poster}
            className="w-full h-full object-cover"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            playsInline
          />
          <div 
            onClick={toggleVideo}
            className={`absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#1e3a8a] shadow-lg">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </div>
          </div>
        </div>
      );
    case 'button':
      return (
        <button 
          onClick={element.action}
          className={`flex items-center justify-center gap-2 ${element.className}`}
        >
          {element.label}
        </button>
      );
    case 'ad':
      return (
        <div className={`flex flex-col gap-3 ${element.className}`}>
          {element.image && <img src={element.image} alt="Publicité" className="w-full rounded-lg" />}
          {element.text && <p className="text-sm font-semibold text-slate-800">{element.text}</p>}
          {element.buttonLabel && (
            <button className="text-[#1e3a8a] font-bold text-xs flex items-center gap-1 uppercase tracking-wide">
              {element.buttonLabel} <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    default:
      return null;
  }
};

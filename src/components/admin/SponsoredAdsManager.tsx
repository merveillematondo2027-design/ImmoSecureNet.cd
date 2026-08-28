import React, { useState } from 'react';
import {
  Megaphone,
  PlusCircle,
  TrendingUp,
  MousePointerClick,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { SponsoredAd } from '../../types';

export const SponsoredAdsManager: React.FC = () => {
  const { sponsoredAds, createSponsoredAd, toggleSponsoredAd, deleteSponsoredAd, showToast } = useProperties();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80');
  const [targetUrl, setTargetUrl] = useState('https://example.com/promo');
  const [position, setPosition] = useState<'TOP_BANNER' | 'MARKETPLACE_CARD' | 'SIDEBAR'>('TOP_BANNER');
  const [sponsorBadge, setSponsorBadge] = useState('Partenaire Officiel');

  const totalImpressions = sponsoredAds.reduce((acc, ad) => acc + ad.impressionsCount, 0);
  const totalClicks = sponsoredAds.reduce((acc, ad) => acc + ad.clicksCount, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();

    await createSponsoredAd({
      title,
      tagline,
      description: tagline,
      imageUrl,
      targetUrl,
      sponsorName,
      sponsorBadge,
      position,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setShowCreateModal(false);
    showToast('Campagne publicitaire créée et activée !', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Gestion des Publicités Sponsorisées</h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
              Régie Publicitaire
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pilotez les bannières sponsorisées, analysez le taux de clics (CTR) et paramétrez les partenaires.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvelle campagne sponsor</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Impressions Totales</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalImpressions.toLocaleString('fr-FR')}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +22% vs mois dernier
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Clics Générés</span>
            <MousePointerClick className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300">{totalClicks.toLocaleString('fr-FR')}</div>
          <div className="text-[10px] text-slate-400">Trafic sortant qualifié</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CTR Moyen</span>
            <Megaphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{avgCtr} %</div>
          <div className="text-[10px] text-emerald-400">Excellent engagement</div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {sponsoredAds.map((ad) => (
          <div
            key={ad.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-700"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      ad.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ad.isActive ? 'Active' : 'Désactivée'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold">
                    Position: {ad.position}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{ad.sponsorName}</span>
                </div>
                <h3 className="font-bold text-sm text-white truncate mt-1">{ad.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{ad.tagline}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                  <span>{ad.impressionsCount} impressions</span>
                  <span>•</span>
                  <span>{ad.clicksCount} clics</span>
                  <span>•</span>
                  <span className="font-semibold text-cyan-400">
                    CTR :{' '}
                    {ad.impressionsCount > 0
                      ? ((ad.clicksCount / ad.impressionsCount) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <button
                onClick={() => toggleSponsoredAd(ad.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  ad.isActive
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                {ad.isActive ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => deleteSponsoredAd(ad.id)}
                aria-label="Supprimer la publicité"
                className="p-2 bg-slate-800 hover:bg-rose-950/40 text-rose-400 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE SPONSORED AD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 my-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Nouvelle Campagne Publicitaire</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Titre de la publicité *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Taux crédit immobilier promotionnel à 4.9%"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du sponsor / Partenaire *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rawbank & Ecobank Partenariat"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Positionnement</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="TOP_BANNER">Bannière Haute (Marketplace)</option>
                    <option value="MARKETPLACE_CARD">Carte Native dans les résultats</option>
                    <option value="SIDEBAR">Barre latérale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge sponsor</label>
                  <input
                    type="text"
                    value={sponsorBadge}
                    onChange={(e) => setSponsorBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lien de destination (URL)</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Texte d'accroche / Tagline</label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Accroche publicitaire courte"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                Lancer la campagne
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

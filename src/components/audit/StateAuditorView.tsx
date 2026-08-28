import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  FileCheck2,
  AlertTriangle,
  FileText,
  Lock,
  Building,
  CheckCircle2,
  XCircle,
  Eye,
  History,
  Scale,
  Sparkles,
  Download,
  X,
  Filter,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Property, StateAuditLog } from '../../types';

export const StateAuditorView: React.FC = () => {
  const { properties, stateAuditLogs, logStateAuditAction, showToast } = useProperties();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'CADASTRE' | 'ANOMALIES' | 'AUDIT_LOGS'>('CADASTRE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Inspection modal state
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionReason, setInspectionReason] = useState('CONTRÔLE CADASTRE DE ROUTINE');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionVerdict, setInspectionVerdict] = useState<'CONFORME' | 'NON_CONFORME' | 'SOUS_ENQUETE'>('CONFORME');

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.cadastralReference.toLowerCase().includes(q) ||
      p.titleDeedNumber.toLowerCase().includes(q) ||
      p.location.neighborhood.toLowerCase().includes(q)
    );
  });

  const handleStartInspection = (prop: Property) => {
    setSelectedProperty(prop);
    setInspectionNotes(`Audit de conformité cadastrale pour le bien ${prop.cadastralReference}`);
    setShowInspectionModal(true);
  };

  const handleConfirmInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    await logStateAuditAction({
      targetPropertyId: selectedProperty.id,
      targetCadastralRef: selectedProperty.cadastralReference,
      auditorDepartment: currentUser?.department || 'Ministère des Affaires Foncières - Direction du Cadastre',
      action: 'INSPECTION_TITRE_FONCIER',
      reason: inspectionReason,
      notes: inspectionNotes,
      verdict: inspectionVerdict,
    });

    setShowInspectionModal(false);
    showToast(`Audit officiel validé et consigné dans le registre national de sécurité !`, 'success');
  };

  const formatPrice = (p?: number) => {
    if (!p) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Official Government Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">
                Portail de Contrôle & d’Audit de l’État
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold">
                Accréditation Officielle
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Direction Générale du Cadastre • Ministère des Affaires Foncières
            </p>
          </div>
        </div>

        <div className="text-right text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="text-slate-400">Auditeur assermenté :</div>
          <div className="font-bold text-amber-300">{currentUser?.fullName || 'Dr. Mukendi'}</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'CADASTRE', label: `Registre Cadastral (${properties.length})`, icon: Building },
          { id: 'ANOMALIES', label: 'Détecteur d’Anomalies Foncières', icon: AlertTriangle, badge: '2 Alertes' },
          { id: 'AUDIT_LOGS', label: `Journal des Missions (${stateAuditLogs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CADASTRE REGISTRY */}
      {activeTab === 'CADASTRE' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Recherche par référence cadastrale, n° de titre foncier, propriétaire ou commune..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Properties Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Bien & Localisation</th>
                    <th className="p-3.5">Réf. Cadastre</th>
                    <th className="p-3.5">Titre Foncier</th>
                    <th className="p-3.5">Superficie</th>
                    <th className="p-3.5">Statut Fiscal & Légal</th>
                    <th className="p-3.5 text-right">Action État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{prop.title}</div>
                        <div className="text-[11px] text-slate-400">{prop.location.neighborhood}, {prop.location.city}</div>
                      </td>
                      <td className="p-3.5 font-mono text-cyan-300 font-semibold">{prop.cadastralReference}</td>
                      <td className="p-3.5 font-mono text-slate-300">{prop.titleDeedNumber}</td>
                      <td className="p-3.5 font-semibold text-white">{prop.surface} m²</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> {prop.taxComplianceStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleStartInspection(prop)}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Auditer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANOMALIES SCANNER */}
      {activeTab === 'ANOMALIES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Alerte Fraude Fiscale
                </span>
                <span className="text-xs text-slate-400">Détection automatique</span>
              </div>
              <h4 className="font-bold text-sm text-white">Sous-évaluation suspecte de la valeur vénale</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le bien situé à Gombe présente un prix déclaré inférieur de 65% au prix médian cadastral de la zone. Risque de minoration des droits d'enregistrement.
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="font-mono text-cyan-300">CAD-2026-REF-0981</span>
                <button
                  onClick={() => showToast('Procédure d’expertise contradictoire notifiée !', 'info')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs"
                >
                  Ouvrir enquête
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Alerte Conformité
                </span>
                <span className="text-xs text-slate-400">Contrôle Carte Pro</span>
              </div>
              <h4 className="font-bold text-sm text-white">Agent non répertorié au registre des intermédiaires</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Une annonce soumise à Ngaliema provient d'un compte sans numéro de carte professionnelle valide ou en cours de renouvellement.
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Compte: BrokerIndependant</span>
                <button
                  onClick={() => showToast('Mise en demeure automatique transmise !', 'info')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Bloquer publication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-3">
          {stateAuditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.auditorName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                      {log.action}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        log.verdict === 'CONFORME'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Verdict: {log.verdict}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                    Bien audité : {log.targetCadastralRef}
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-slate-300">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Motif officiel : {log.reason}</div>
                <div className="mt-0.5">{log.notes}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MANDATORY INSPECTION JUSTIFICATION MODAL */}
      {showInspectionModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 my-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Procès-Verbal d’Audit Cadastral</h3>
              </div>
              <button
                onClick={() => setShowInspectionModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1">
              <div className="text-amber-300 font-semibold">Bien concerné : {selectedProperty.title}</div>
              <div className="font-mono text-cyan-300">Réf. Cadastrale : {selectedProperty.cadastralReference}</div>
              <div className="font-mono text-slate-400">N° Titre Foncier : {selectedProperty.titleDeedNumber}</div>
            </div>

            <form onSubmit={handleConfirmInspection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motif officiel de l’inspection *
                </label>
                <select
                  value={inspectionReason}
                  onChange={(e) => setInspectionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="CONTRÔLE CADASTRE DE ROUTINE">Contrôle Cadastre de Routine</option>
                  <option value="VÉRIFICATION TITRE SUITE À TRANSACTION">Vérification Titre suite à transaction</option>
                  <option value="ENQUÊTE LITIGE ET BORNAGE">Enquête Litige et Bornage</option>
                  <option value="CONTRÔLE FISCAL DROITS DE MUTATION">Contrôle fiscal droits de mutation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verdict de l’Auditeur de l’État *
                </label>
                <select
                  value={inspectionVerdict}
                  onChange={(e) => setInspectionVerdict(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="CONFORME">CONFORME (Titre authentique et exempt de litige)</option>
                  <option value="NON_CONFORME">NON CONFORME (Anomalie de bornage ou impayé)</option>
                  <option value="SOUS_ENQUETE">SOUS ENQUÊTE (Expertise géomètre requise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observations et conclusions officielles
                </label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                🔒 Conformément à la réglementation foncière, cette inspection sera enregistrée de manière immuable avec votre signature numérique ministérielle.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                Signer et clore l’audit officiel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

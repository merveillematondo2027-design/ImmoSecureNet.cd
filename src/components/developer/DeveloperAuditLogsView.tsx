import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  Cpu,
  Wifi,
  Trash2,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { DeveloperLog, LogLevel } from '../../types';

export const DeveloperAuditLogsView: React.FC = () => {
  const { developerLogs, addDeveloperLogEntry, clearDeveloperLogs, showToast } = useProperties();
  const { currentUser } = useAuth();

  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return developerLogs.filter((log) => {
      if (levelFilter !== 'ALL' && log.level !== levelFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q) ||
          log.ipAddress.includes(q) ||
          (log.userId && log.userId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [developerLogs, levelFilter, searchQuery]);

  const handleSimulateSecurityEvent = () => {
    setIsSimulating(true);
    const mockSecurityScenarios: { level: LogLevel; module: DeveloperLog['module']; message: string; details: any }[] = [
      {
        level: LogLevel.SECURITY,
        module: 'RBAC_SECURITY',
        message: 'Tentative de contournement de privilège bloquée (IDOR check: Document cadastral #CAD-991)',
        details: { ip: '197.242.10.99', origin: 'Untrusted Mobile API client', ruleViolated: 'RBAC_DOC_CONFIDENTIAL' },
      },
      {
        level: LogLevel.WARNING,
        module: 'AUTH_SERVICE',
        message: '3 échecs consécutifs d’authentification OTP par SMS',
        details: { phone: '+243 82 *** 4410', rateLimitedUntil: new Date(Date.now() + 600000).toISOString() },
      },
      {
        level: LogLevel.CRITICAL,
        module: 'CADASTRE_SYNC',
        message: 'Alerte discordance géospatiale : Superposition de parcelle détectée (Cadastre National)',
        details: { parcelA: 'CAD-2026-KIN-0894', parcelB: 'CAD-2026-KIN-0895', deltaMeters: 4.2 },
      },
    ];

    const chosen = mockSecurityScenarios[Math.floor(Math.random() * mockSecurityScenarios.length)];
    addDeveloperLogEntry(chosen.level, chosen.module, chosen.message, chosen.details);

    setTimeout(() => {
      setIsSimulating(false);
      showToast('Nouvel événement de télémétrie injecté avec succès !', 'success');
    }, 300);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `immosecurenet-dev-auditlogs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export JSON téléchargé !', 'info');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Level,Module,Message,IPAddress,StatusCode,DurationMs\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.level}","${l.module}","${l.message.replace(/"/g, '""')}","${l.ipAddress}",${l.statusCode || 200},${l.durationMs || 0}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `immosecurenet-dev-auditlogs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export CSV téléchargé !', 'info');
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case LogLevel.SECURITY:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case LogLevel.CRITICAL:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case LogLevel.ERROR:
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case LogLevel.WARNING:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case LogLevel.INFO:
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-cyan-500/30 p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">
                Console AuditLogs & Télémétrie DevSecOps
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                PROD-MONITOR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Surveillance temps réel des flux API, contrôles RBAC et événements de sécurité.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateSecurityEvent}
            disabled={isSimulating}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simuler événement</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={clearDeveloperLogs}
            title="Purger les logs"
            className="p-2 bg-slate-900 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-xl text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Latence Moyenne API</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white">28 ms</div>
          <div className="text-[10px] text-emerald-400">p99 &lt; 85ms</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Uptime Serveur</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-300">99.99 %</div>
          <div className="text-[10px] text-slate-400">Zero downtime</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Erreurs HTTP 5xx</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-200">0.00 %</div>
          <div className="text-[10px] text-emerald-400">Nominal</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Alertes Sécurité</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-mono font-bold text-purple-300">
            {developerLogs.filter((l) => l.level === LogLevel.SECURITY).length}
          </div>
          <div className="text-[10px] text-slate-400">Bloquées & mitigées</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer par module, message, IP ou userId..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', LogLevel.INFO, LogLevel.WARNING, LogLevel.SECURITY, LogLevel.CRITICAL].map(
            (lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                  levelFilter === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            )
          )}
        </div>
      </div>

      {/* Terminal-style Logs Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-900">
          <span>Stream Télémétrique Live ({filteredLogs.length} entrées)</span>
          <span>Buffer chiffré AES-256</span>
        </div>

        <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getLevelBadge(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="font-bold text-cyan-300">[{log.module}]</span>
                  <span className="font-semibold text-white">{log.message}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{log.ipAddress}</span>
                  <span>•</span>
                  <span>{log.durationMs ? `${log.durationMs}ms` : '12ms'}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>

              {log.details && (
                <div className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-900 truncate">
                  <span className="text-slate-500 font-bold">PAYLOAD: </span>
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FileClock, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  timestamp: string;
  modified_data: string;
}

export const AuditLogs: React.FC = () => {
  const { t } = useLanguage();
  const { authHeader, user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/audit', {
      headers: { ...authHeader() } as any
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load audit trail logs');
      return res.json();
    })
    .then(data => {
      setLogs(data);
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const toggleExpandLog = (id: number) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.username.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.modified_data && log.modified_data.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">{t('auditLogs')}</h2>
        <p className="text-xs text-police-slate font-medium">
          System-wide logging database. Records user operations, timestamps, and parameters for legal compliance.
        </p>
      </div>

      {/* Query Filter */}
      <div className="relative bg-[#081225]/60 p-4 rounded-lg border border-police-border/40">
        <Search className="absolute left-7.5 top-7.5 w-4 h-4 text-police-slate" style={{ left: '1.75rem', top: '1.75rem' }} />
        <input
          type="text"
          placeholder="Filter logs by operator username, action details, or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full pl-10"
        />
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-police-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="glass-panel rounded-lg overflow-hidden border border-police-border/40">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-police-hover/60 border-b border-police-border text-police-slate font-bold uppercase tracking-wider">
                <th className="p-4">{t('user')}</th>
                <th className="p-4">{t('action')}</th>
                <th className="p-4">{t('timestamp')}</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-police-border/40 font-medium">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-[#0f1d35]/30 transition-colors duration-150">
                      <td className="p-4">
                        <span className="bg-[#1e293b] text-police-light border border-police-border rounded px-2.5 py-0.5 font-bold">
                          {log.username}
                        </span>
                      </td>
                      <td className="p-4 text-white font-semibold">{log.action}</td>
                      <td className="p-4 text-police-slate">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        {log.modified_data && log.modified_data !== 'null' ? (
                          <button
                            onClick={() => toggleExpandLog(log.id)}
                            className="text-[10px] text-police-gold hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Payload' : 'Show Payload'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-police-slate italic">No Data</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && log.modified_data && (
                      <tr className="bg-[#0b1528]/50">
                        <td colSpan={4} className="p-4 border-t border-b border-police-border/30">
                          <pre className="text-[11px] text-police-slate font-mono bg-police-dark/70 p-4 rounded overflow-x-auto leading-relaxed border border-police-border/40">
                            {JSON.stringify(JSON.parse(log.modified_data), null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-lg border border-dashed border-police-border/60">
          <p className="text-police-slate text-xs font-semibold">No audit logs found matching the filter query.</p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, PlusCircle, Calendar, MapPin, Tag } from 'lucide-react';

interface CaseItem {
  id: number;
  case_number: string;
  fir_number: string;
  police_station: string;
  date_of_incident: string;
  crime_type: string;
  location: string;
  victim_name: string;
  accused_name: string;
  status: 'ACTIVE' | 'ARRESTED' | 'CLOSED';
  created_at: string;
}

export const CaseList: React.FC = () => {
  const { t } = useLanguage();
  const { authHeader } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCases = () => {
    setLoading(true);
    let url = `/api/cases?search=${encodeURIComponent(search)}`;
    if (statusFilter) {
      url += `&status=${statusFilter}`;
    }

    fetch(url, {
      headers: { ...authHeader() } as any
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load cases');
      return res.json();
    })
    .then(data => {
      setCases(data);
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  // Trigger search on hit Enter or click search button
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchCases();
    }
  };

  const getStatusBadge = (status: CaseItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge-active">{status}</span>;
      case 'ARRESTED':
        return <span className="badge-arrested">{status}</span>;
      case 'CLOSED':
        return <span className="badge-closed">{status}</span>;
      default:
        return <span className="badge-closed">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t('cases')}</h2>
          <p className="text-xs text-police-slate font-medium">Browse, query, and edit active criminal case records.</p>
        </div>
        <button
          onClick={() => navigate('/cases/new')}
          className="btn-primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('newCase')}</span>
        </button>
      </div>

      {/* Query Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#081225]/60 p-4 rounded-lg border border-police-border/40">
        {/* Search text input */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-police-slate" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="input-field w-full pl-10"
          />
        </div>
        
        {/* Status Dropdown */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field w-full"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ARRESTED">ARRESTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        {/* Filter Trigger Button */}
        <button
          onClick={fetchCases}
          className="btn-secondary font-bold w-full"
        >
          Query Database
        </button>
      </div>

      {/* Case Grid/List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-police-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : cases.length > 0 ? (
        <div className="glass-panel rounded-lg overflow-x-auto border border-police-border/40">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-police-hover/60 border-b border-police-border text-police-slate font-bold uppercase tracking-wider">
                <th className="p-4">{t('caseNumber')} / {t('firNumber')}</th>
                <th className="p-4">{t('crimeType')}</th>
                <th className="p-4">{t('victimName')}</th>
                <th className="p-4">{t('accusedName')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-police-border/40 font-medium">
              {cases.map((caseItem) => (
                <tr 
                  key={caseItem.id} 
                  className="hover:bg-[#0f1d35]/30 transition-colors duration-150"
                >
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{caseItem.case_number}</div>
                    <div className="text-[10px] text-police-slate mt-0.5">{caseItem.fir_number}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-[#1e293b] text-police-light border border-police-border rounded px-2 py-0.5 font-bold uppercase">
                      {caseItem.crime_type}
                    </span>
                  </td>
                  <td className="p-4 text-police-light">{caseItem.victim_name}</td>
                  <td className="p-4 text-police-light">{caseItem.accused_name}</td>
                  <td className="p-4">{getStatusBadge(caseItem.status)}</td>
                  <td className="p-4 text-police-slate">{new Date(caseItem.date_of_incident).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                      className="p-2 rounded bg-police-hover hover:bg-police-gold/10 text-police-slate hover:text-police-gold border border-police-border/80 hover:border-police-gold/30 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-lg border border-dashed border-police-border/60">
          <p className="text-police-slate text-sm font-semibold mb-4">No cases matching the query filter.</p>
          <button
            onClick={() => navigate('/cases/new')}
            className="btn-primary"
          >
            Create First Case File
          </button>
        </div>
      )}
    </div>
  );
};

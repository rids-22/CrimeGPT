import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  User, 
  Users, 
  Sparkles, 
  Clock, 
  Paperclip, 
  PlusCircle, 
  FileDown, 
  Printer, 
  Check, 
  Briefcase, 
  Camera, 
  ArrowLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface CaseDiaryEntry {
  id: number;
  timestamp: string;
  entry_type: string;
  description: string;
  officer_name: string;
}

interface EvidenceItem {
  id: number;
  type: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

interface CaseDetails {
  id: number;
  case_number: string;
  fir_number: string;
  police_station: string;
  date_of_incident: string;
  crime_type: string;
  location: string;
  narrative_description: string;
  victim_name: string;
  victim_address: string;
  victim_contact: string;
  accused_name: string;
  accused_address: string;
  accused_photo_url: string;
  witness_name: string;
  witness_contact: string;
  status: 'ACTIVE' | 'ARRESTED' | 'CLOSED';
  diary: CaseDiaryEntry[];
  evidence: EvidenceItem[];
}

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user, authHeader } = useAuth();
  const isDemoUser = user?.username === 'io_sharma' || user?.username === 'sho_singh' || user?.username === 'legal_verma' || user?.username === 'admin_crimegpt';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'diary' | 'evidence' | 'documents' | 'ai'>('overview');
  const [caseItem, setCaseItem] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for adding timeline entry
  const [newDiaryType, setNewDiaryType] = useState('STATEMENT_RECORDED');
  const [newDiaryDesc, setNewDiaryDesc] = useState('');
  const [addingDiary, setAddingDiary] = useState(false);

  // Form states for adding evidence
  const [newEvidenceType, setNewEvidenceType] = useState('Weapons');
  const [newEvidenceName, setNewEvidenceName] = useState('');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [addingEvidence, setAddingEvidence] = useState(false);

  // Document generator state
  const [docType, setDocType] = useState<'remand' | 'medical' | 'seizure' | 'custody'>('remand');
  const [docLang, setDocLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [docTitle, setDocTitle] = useState('');
  const [docBody, setDocBody] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [seizedItemsForMemo, setSeizedItemsForMemo] = useState('');

  // AI suggestion state
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load case details
  const fetchCaseDetails = () => {
    setLoading(true);
    fetch(`/api/cases/${id}`, {
      headers: { ...authHeader() } as any
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load case detail');
      return res.json();
    })
    .then(data => {
      setCaseItem(data);
      setError('');
    })
    .catch(err => {
      setError(err.message || 'Error fetching case information');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  // Load documents preview when templates are selected
  useEffect(() => {
    if (!caseItem) return;
    setDocLoading(true);

    let url = `/api/documents/preview?caseId=${id}&type=${docType}&lang=${docLang}`;
    if (docType === 'seizure' && seizedItemsForMemo) {
      url += `&seizedItems=${encodeURIComponent(seizedItemsForMemo)}`;
    }

    fetch(url, {
      headers: { ...authHeader() } as any
    })
    .then(res => res.json())
    .then(data => {
      setDocTitle(data.title || '');
      setDocBody(data.body || '');
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      setDocLoading(false);
    });
  }, [docType, docLang, caseItem, seizedItemsForMemo]);

  // Fetch AI Recommendations
  const fetchAiSuggestions = () => {
    if (!caseItem) return;
    setAiLoading(true);
    fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      } as any,
      body: JSON.stringify({ narrative: caseItem.narrative_description })
    })
    .then(res => res.json())
    .then(data => {
      setAiSuggestions(data);
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      setAiLoading(false);
    });
  };

  useEffect(() => {
    if (activeTab === 'ai' && !aiSuggestions) {
      fetchAiSuggestions();
    }
  }, [activeTab]);

  // Add Diary Timeline Entry
  const handleAddDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryDesc) return;
    setAddingDiary(true);

    try {
      const response = await fetch(`/api/cases/${id}/diary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        } as any,
        body: JSON.stringify({
          entry_type: newDiaryType,
          description: newDiaryDesc
        })
      });

      if (!response.ok) throw new Error('Failed to add diary entry');

      setNewDiaryDesc('');
      fetchCaseDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingDiary(false);
    }
  };

  // Add Evidence File record
  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceName || !newEvidenceUrl) return;
    setAddingEvidence(true);

    try {
      const response = await fetch(`/api/cases/${id}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        } as any,
        body: JSON.stringify({
          type: newEvidenceType,
          file_name: newEvidenceName,
          file_url: newEvidenceUrl
        })
      });

      if (!response.ok) throw new Error('Failed to append evidence');

      setNewEvidenceName('');
      setNewEvidenceUrl('');
      fetchCaseDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingEvidence(false);
    }
  };

  // Update Case Status (e.g. Arrest accused or close case file)
  const handleUpdateStatus = async (status: 'ARRESTED' | 'CLOSED', description?: string) => {
    if (!window.confirm(`Are you sure you want to update status to ${status}?`)) return;
    
    try {
      const response = await fetch(`/api/cases/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        } as any,
        body: JSON.stringify({ status, description })
      });

      if (!response.ok) throw new Error('Failed to update status');
      fetchCaseDetails();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Document Export
  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      const response = await fetch('/api/documents/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        } as any,
        body: JSON.stringify({ title: docTitle, body: docBody, format })
      });

      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      if (format === 'pdf') {
        window.open(fileUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${docTitle.replace(/\s+/g, '_')}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Standard Print Trigger
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.6; }
            h2 { text-align: center; text-decoration: underline; margin-bottom: 30px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>OFFICE OF THE STATION HOUSE OFFICER</h3>
            <h4>CRIMEGPT STATE LEGAL PORTAL</h4>
          </div>
          <h2>${docTitle}</h2>
          <pre>${docBody}</pre>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-police-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="glass-panel p-8 rounded-lg max-w-lg mx-auto text-center border-police-crimson/30">
        <p className="text-rose-400 font-bold mb-4">{error || 'Case file not found'}</p>
        <button onClick={() => navigate('/cases')} className="btn-secondary">Return to Case Directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner case number & status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#081225]/60 p-6 rounded-lg border border-police-border/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2.5 rounded bg-police-hover border border-police-border text-police-slate hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-wide">{caseItem.case_number}</h2>
              <span className="text-xs text-police-slate">({caseItem.fir_number})</span>
            </div>
            <p className="text-xs text-police-slate mt-1 font-semibold uppercase">{caseItem.police_station}</p>
          </div>
        </div>

        {/* Action controls based on status */}
        <div className="flex items-center gap-3">
          {caseItem.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => isDemoUser ? undefined : handleUpdateStatus('ARRESTED', 'Accused caught and booked in police station lockup')}
                disabled={isDemoUser}
                className={`btn-secondary text-police-gold border-police-gold/20 ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Book Arrest
              </button>
              <button
                onClick={() => isDemoUser ? undefined : handleUpdateStatus('CLOSED', 'Case file closed. Charge sheet generated and submitted to magistrate.')}
                disabled={isDemoUser}
                className={`btn-primary ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Close Case
              </button>
            </>
          )}
          {caseItem.status === 'ARRESTED' && (
            <button
              onClick={() => isDemoUser ? undefined : handleUpdateStatus('CLOSED', 'Accused produced in court. Forwarded to judicial custody.')}
              disabled={isDemoUser}
              className={`btn-primary ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Forward Case to Court
            </button>
          )}
          {caseItem.status === 'CLOSED' && (
            <span className="badge-closed text-xs font-bold py-1 px-3">CASE CLOSED / FILED</span>
          )}
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-police-border/60">
        {[
          { id: 'overview', label: 'Overview', icon: Briefcase },
          { id: 'diary', label: 'Investigation Diary', icon: Clock },
          { id: 'evidence', label: 'Evidence Collection', icon: Paperclip },
          { id: 'documents', label: 'Auto Documents', icon: FileText },
          { id: 'ai', label: 'AI Legal Advisor', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                active 
                  ? 'border-police-gold text-police-gold' 
                  : 'border-transparent text-police-slate hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel contents */}
      <div className="glass-panel p-8 rounded-lg">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Split layout: Incident details & Crime stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Incident Details Block */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider mb-2">Crime Scene Profile</h4>
                  <div className="grid grid-cols-2 gap-4 bg-police-dark/40 p-4 rounded border border-police-border/20 text-xs">
                    <div>
                      <span className="text-police-slate">Crime Type:</span>
                      <p className="text-white font-bold uppercase mt-0.5">{caseItem.crime_type}</p>
                    </div>
                    <div>
                      <span className="text-police-slate">Incident Date:</span>
                      <p className="text-white font-semibold mt-0.5">{new Date(caseItem.date_of_incident).toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-police-slate">Occurrence Location:</span>
                      <p className="text-white font-semibold mt-0.5">{caseItem.location}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider mb-2">{t('narrative')}</h4>
                  <p className="text-xs text-police-light bg-police-dark/40 p-4 rounded border border-police-border/20 leading-relaxed font-normal whitespace-pre-wrap">
                    {caseItem.narrative_description}
                  </p>
                </div>
              </div>

              {/* Accused Photo & Profile Block */}
              <div className="bg-police-dark/30 border border-police-border/40 p-6 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider text-center border-b border-police-border/30 pb-2">
                  Accused Mugshot Profile
                </h4>
                
                {caseItem.accused_photo_url ? (
                  <img
                    src={caseItem.accused_photo_url}
                    alt="Accused Mugshot"
                    className="w-32 h-32 object-cover rounded-full border-2 border-police-gold/40 mx-auto shadow-neon-gold"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-police-card border border-dashed border-police-border flex items-center justify-center text-police-slate text-sm mx-auto">
                    No Photo
                  </div>
                )}
                
                <div className="text-center text-xs space-y-1">
                  <h5 className="font-bold text-white uppercase text-sm">{caseItem.accused_name}</h5>
                  <p className="text-police-slate">{caseItem.accused_address || 'Address not listed'}</p>
                </div>
              </div>
            </div>

            {/* Split layout: Victim & Witness details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-police-border/40 pt-6">
              {/* Victim block */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {t('victimDetails')}
                </h4>
                <div className="bg-police-dark/30 p-4 rounded border border-police-border/20 text-xs space-y-2">
                  <div>
                    <span className="text-police-slate">Victim Name:</span>
                    <p className="text-white font-bold mt-0.5">{caseItem.victim_name}</p>
                  </div>
                  <div>
                    <span className="text-police-slate">Contact Information:</span>
                    <p className="text-white font-semibold mt-0.5">{caseItem.victim_contact || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-police-slate">Address Details:</span>
                    <p className="text-white font-semibold mt-0.5">{caseItem.victim_address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Witness block */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Witness Bio-details
                </h4>
                <div className="bg-police-dark/30 p-4 rounded border border-police-border/20 text-xs space-y-2">
                  <div>
                    <span className="text-police-slate">Witness Name:</span>
                    <p className="text-white font-bold mt-0.5">{caseItem.witness_name || 'No witnesses recorded'}</p>
                  </div>
                  <div>
                    <span className="text-police-slate">Contact Information:</span>
                    <p className="text-white font-semibold mt-0.5">{caseItem.witness_contact || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVESTIGATION DIARY (TIMELINE) */}
        {activeTab === 'diary' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Add diary timeline entry form */}
            <form onSubmit={handleAddDiary} className="bg-police-dark/40 border border-police-border/40 p-5 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Log Investigation Milestone</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-police-slate font-bold uppercase">Milestone Type</label>
                  <select
                    value={newDiaryType}
                    onChange={(e) => setNewDiaryType(e.target.value)}
                    className="select-field text-xs py-2"
                  >
                    <option value="STATEMENT_RECORDED">Statement Recorded</option>
                    <option value="EVIDENCE_SEIZED">Evidence Seized</option>
                    <option value="ARREST_MADE">Arrest Made</option>
                    <option value="MEDICAL_EXAM">Medical Examination</option>
                    <option value="COURT_PRODUCTION">Court Production</option>
                    <option value="REMAND">Remand Custody</option>
                    <option value="CUSTOM">Custom Log Entry</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] text-police-slate font-bold uppercase">Milestone Details / Summary</label>
                  <input
                    type="text"
                    placeholder="Enter what investigation activity was performed..."
                    value={newDiaryDesc}
                    onChange={(e) => setNewDiaryDesc(e.target.value)}
                    className="input-field text-xs py-2"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                {isDemoUser && (
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                    Write operations are disabled in demo mode
                  </p>
                )}
                <div className="flex-1 flex justify-end">
                  <button
                    type="submit"
                    disabled={addingDiary || isDemoUser}
                    className={`btn-primary py-2 text-xs font-bold ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {isDemoUser ? 'Append Disabled (Demo)' : (addingDiary ? 'Appending Entry...' : 'Append Entry')}
                  </button>
                </div>
              </div>
            </form>

            {/* Timeline display */}
            <div className="relative border-l-2 border-police-border/80 pl-6 ml-4 space-y-6">
              {caseItem.diary && caseItem.diary.length > 0 ? (
                caseItem.diary.map((entry) => (
                  <div key={entry.id} className="relative">
                    {/* Glowing circle bullet */}
                    <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-police-dark border-2 border-police-gold shadow-neon-gold flex items-center justify-center text-[8px] text-police-gold">
                      •
                    </span>
                    
                    <div className="bg-police-dark/30 border border-police-border/20 p-4 rounded text-xs space-y-1 hover:border-police-border/60 transition-colors">
                      <div className="flex items-center justify-between pb-1 border-b border-police-border/20">
                        <span className="font-bold text-police-gold uppercase tracking-wider">
                          {entry.entry_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-police-slate">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-police-light leading-relaxed font-normal pt-1.5">{entry.description}</p>
                      <div className="pt-2 text-[10px] text-police-slate flex items-center justify-end gap-1">
                        <span>Officer in Charge:</span>
                        <span className="text-white font-semibold">{entry.officer_name}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-police-slate pl-2">No diary milestones recorded.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EVIDENCE FILES */}
        {activeTab === 'evidence' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Add Evidence form */}
            <form onSubmit={handleAddEvidence} className="bg-police-dark/40 border border-police-border/40 p-5 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Evidence Item</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-police-slate font-bold uppercase">Evidence Type</label>
                  <select
                    value={newEvidenceType}
                    onChange={(e) => setNewEvidenceType(e.target.value)}
                    className="select-field text-xs py-2"
                  >
                    <option value="Weapon">Weapon / Firearms</option>
                    <option value="Electronics">Electronic (Phone, CCTV, HardDrive)</option>
                    <option value="Documentary">Documentary File (Bank, Registry)</option>
                    <option value="Narcotics">Narcotics / Substances</option>
                    <option value="Other">Other Recovered Property</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-police-slate font-bold uppercase">Item Name / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Broken Glass fragments / Iron Rod"
                    value={newEvidenceName}
                    onChange={(e) => setNewEvidenceName(e.target.value)}
                    className="input-field text-xs py-2"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-police-slate font-bold uppercase">Evidence Reference URL / File Mock</label>
                  <input
                    type="text"
                    placeholder="e.g. CCTV_Recording_01.mp4"
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    className="input-field text-xs py-2"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                {isDemoUser && (
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                    Upload operations are disabled in demo mode
                  </p>
                )}
                <div className="flex-1 flex justify-end">
                  <button
                    type="submit"
                    disabled={addingEvidence || isDemoUser}
                    className={`btn-primary py-2 text-xs font-bold ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {isDemoUser ? 'Save Disabled (Demo)' : (addingEvidence ? 'Saving Evidence...' : 'Save Evidence')}
                  </button>
                </div>
              </div>
            </form>

            {/* List Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {caseItem.evidence && caseItem.evidence.length > 0 ? (
                caseItem.evidence.map((ev) => (
                  <div 
                    key={ev.id} 
                    className="bg-police-dark/30 border border-police-border/30 p-4 rounded-lg flex flex-col justify-between hover:border-police-gold/30 transition-all text-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start pb-2 border-b border-police-border/20">
                        <span className="font-bold text-white uppercase">{ev.type}</span>
                        <span className="text-[9px] text-police-slate">
                          {new Date(ev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-police-light mt-2.5">{ev.file_name}</p>
                      <p className="text-[10px] text-police-slate mt-1 italic truncate">{ev.file_url}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="text-[9px] text-police-success border border-police-success/30 px-2 py-0.5 rounded uppercase tracking-wider bg-police-success/5 font-semibold">
                        Secured in Locker
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-police-slate col-span-3 py-4 text-center">No evidence files registered.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUTO DOCUMENT GENERATION */}
        {activeTab === 'documents' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Letter selection panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { id: 'remand', label: 'Remand Request', desc: 'Section 187 BNSS / 167 CrPC' },
                { id: 'medical', label: 'Medical Exam Requisition', desc: 'Section 51 BNSS / 53 CrPC' },
                { id: 'seizure', label: 'Seizure Memo Receipt', desc: 'Section 185 BNSS / 102 CrPC' },
                { id: 'custody', label: 'Jail Custody Letter', desc: 'Production and Remand' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDocType(t.id as any)}
                  className={`p-4 rounded-lg border text-left flex flex-col justify-between text-xs transition-all ${
                    docType === t.id 
                      ? 'bg-police-gold/10 border-police-gold text-police-gold shadow-neon-gold' 
                      : 'bg-police-dark/30 border-police-border/40 text-police-slate hover:text-white'
                  }`}
                >
                  <span className="font-bold text-sm text-white uppercase">{t.label}</span>
                  <span className="text-[10px] text-police-slate mt-2">{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Settings & Seizure memo options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              {/* Language selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-police-slate font-bold uppercase">Select Document Language</label>
                <select
                  value={docLang}
                  onChange={(e) => setDocLang(e.target.value as any)}
                  className="select-field text-xs py-2"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>

              {/* Seizure lists conditional input */}
              {docType === 'seizure' && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] text-police-slate font-bold uppercase">List of Seized Items (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1. One iron rod (3 feet long), 2. Red leather laptop bag"
                    value={seizedItemsForMemo}
                    onChange={(e) => setSeizedItemsForMemo(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
              )}
            </div>

            {/* Document preview & text area edit */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider">Editable Document Draft Preview</h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1 hover:border-police-gold text-police-gold"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Word (DOCX)</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {docLoading ? (
                <div className="h-64 flex items-center justify-center bg-police-dark/30 border border-police-border/30 rounded-lg">
                  <div className="w-6 h-6 border-2 border-police-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="input-field w-full font-bold text-center text-sm border-dashed"
                  />
                  <textarea
                    rows={15}
                    value={docBody}
                    onChange={(e) => setDocBody(e.target.value)}
                    className="input-field w-full font-sans text-xs leading-relaxed whitespace-pre-wrap resize-none border-dashed bg-police-dark/20"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AI LEGAL ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-3 border-b border-police-border/40 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-police-gold" />
                  AI Suggested Offenses & Landmark Cases
                </h3>
                <p className="text-[10px] text-police-slate font-medium">Mapped to modern codes (BNS/BNSS/BSA) and older statutes (IPC/CrPC/IEA).</p>
              </div>
              <button
                onClick={fetchAiSuggestions}
                disabled={aiLoading}
                className="btn-secondary py-1.5 text-xs text-police-gold hover:text-white"
              >
                {aiLoading ? 'Analyzing Case Narrative...' : 'Re-Run Analysis'}
              </button>
            </div>

            {aiLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-police-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : aiSuggestions ? (
              <div className="space-y-6">
                
                {/* Penal code mappings (BNS vs IPC) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-police-gold" />
                    Penal Mappings: BNS vs IPC Mappings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSuggestions.bns?.map((sec: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-police-dark/30 border border-police-border/40 p-4 rounded-lg text-xs space-y-2.5 hover:border-police-gold/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-police-gold/10 text-police-gold border border-police-gold/30 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              Modern: {sec.section_number}
                            </span>
                            <h5 className="font-bold text-white mt-1.5">{sec.section_title}</h5>
                          </div>
                          <span className="text-[10px] text-police-gold font-bold">Confidence: {sec.confidence_score}%</span>
                        </div>
                        <p className="text-police-slate leading-relaxed font-normal text-[11px]">{sec.explanation}</p>
                        
                        {/* Corresponding IPC */}
                        {aiSuggestions.ipc?.[idx] && (
                          <div className="bg-[#112240]/60 p-3 rounded border border-police-border/20 text-[11px] text-police-slate">
                            <span className="font-bold text-police-light">Equivalent IPC Charge: </span>
                            <span className="text-white font-semibold">{aiSuggestions.ipc[idx].section_number} ({aiSuggestions.ipc[idx].section_title})</span>
                            <p className="mt-1 font-normal leading-relaxed">{aiSuggestions.ipc[idx].explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Procedural law mappings (BNSS vs CrPC) */}
                <div className="space-y-4 pt-4 border-t border-police-border/30">
                  <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider">
                    Procedural Mappings: BNSS vs CrPC Mappings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSuggestions.bnss?.map((sec: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-police-dark/30 border border-police-border/40 p-4 rounded-lg text-xs space-y-2 hover:border-police-gold/30 transition-colors"
                      >
                        <div className="flex justify-between">
                          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            Modern BNSS: {sec.section_number}
                          </span>
                          <span className="text-[10px] text-police-gold font-bold">Confidence: {sec.confidence_score}%</span>
                        </div>
                        <h5 className="font-bold text-white">{sec.section_title}</h5>
                        <p className="text-police-slate leading-relaxed text-[11px] font-normal">{sec.explanation}</p>

                        {/* Corresponding CrPC */}
                        {aiSuggestions.crpc?.[idx] && (
                          <div className="bg-[#112240]/60 p-3 rounded border border-police-border/20 text-[11px] text-police-slate">
                            <span className="font-bold text-police-light">Equivalent CrPC section: </span>
                            <span className="text-white font-semibold">{aiSuggestions.crpc[idx].section_number}</span>
                            <p className="mt-1 font-normal leading-relaxed">{aiSuggestions.crpc[idx].explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Landmark Judgments */}
                {aiSuggestions.judgments && aiSuggestions.judgments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-police-border/30">
                    <h4 className="text-xs font-bold text-police-gold uppercase tracking-wider">
                      {t('landmarkJudgments')}
                    </h4>
                    <div className="space-y-3">
                      {aiSuggestions.judgments.map((jud: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="bg-police-dark/30 border border-police-border/40 p-4 rounded-lg text-xs hover:border-police-gold/30 transition-colors"
                        >
                          <div className="flex justify-between items-start border-b border-police-border/20 pb-2 mb-2">
                            <h5 className="font-bold text-white">{jud.title} ({jud.year})</h5>
                            <span className="text-[10px] text-police-gold font-bold">{jud.citation}</span>
                          </div>
                          <p className="text-police-slate leading-relaxed font-normal text-[11px]">
                            <span className="font-bold text-police-light">Relevance in Investigation: </span>
                            {jud.relevance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-police-slate text-xs font-semibold">
                No legal analysis suggestions loaded. Click 'Re-Run Analysis' to fetch sections.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

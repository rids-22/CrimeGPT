import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  User, 
  Users, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Camera,
  BookOpen
} from 'lucide-react';

interface AIResult {
  bns: Array<{ section_number: string; section_title: string; explanation: string; confidence_score: number }>;
  bnss: Array<{ section_number: string; section_title: string; explanation: string; confidence_score: number }>;
  bsa: Array<{ section_number: string; section_title: string; explanation: string; confidence_score: number }>;
  ipc: Array<{ section_number: string; section_title: string; explanation: string; confidence_score: number }>;
  crpc: Array<{ section_number: string; section_title: string; explanation: string; confidence_score: number }>;
  judgments: Array<{ title: string; year: string; citation: string; relevance: string }>;
}

export const NewCase: React.FC = () => {
  const { t } = useLanguage();
  const { user, authHeader } = useAuth();
  const navigate = useNavigate();
  const isDemoUser = user?.username === 'io_sharma' || user?.username === 'sho_singh' || user?.username === 'legal_verma' || user?.username === 'admin_crimegpt';

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccessAlert, setOcrSuccessAlert] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [caseNumber, setCaseNumber] = useState(`CASE/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000 + 10000)}`);
  const [firNumber, setFirNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('Chanakyapuri Police Station');
  const [dateOfIncident, setDateOfIncident] = useState(new Date().toISOString().split('T')[0]);
  const [crimeType, setCrimeType] = useState('Theft');
  const [location, setLocation] = useState('');
  const [narrativeDescription, setNarrativeDescription] = useState('');

  const [victimName, setVictimName] = useState('');
  const [victimAddress, setVictimAddress] = useState('');
  const [victimContact, setVictimContact] = useState('');

  const [accusedName, setAccusedName] = useState('');
  const [accusedAddress, setAccusedAddress] = useState('');
  const [accusedPhoto, setAccusedPhoto] = useState(''); // Base64

  const [witnessName, setWitnessName] = useState('');
  const [witnessContact, setWitnessContact] = useState('');

  // AI suggestions list
  const [aiSuggestions, setAiSuggestions] = useState<AIResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Handle OCR Document Scanner
  const handleOCRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setError('');
    setOcrSuccessAlert(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ocr/upload', {
        method: 'POST',
        headers: {
          ...authHeader()
        } as any,
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OCR parsing failed');

      // Autofill fields
      if (data.firNumber) setFirNumber(data.firNumber);
      if (data.policeStation) setPoliceStation(data.policeStation);
      if (data.dateOfIncident) setDateOfIncident(data.dateOfIncident);
      if (data.crimeType) setCrimeType(data.crimeType);
      if (data.location) setLocation(data.location);
      if (data.victimName) setVictimName(data.victimName);
      if (data.accusedName) setAccusedName(data.accusedName);
      if (data.narrative) {
        setNarrativeDescription(data.narrative);
        // Automatically fetch AI suggestions for parsed text
        triggerAISuggestions(data.narrative);
      }

      setOcrSuccessAlert(true);
      // Automatically jump to Step 5 to review the filled fields
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Error processing OCR scan');
    } finally {
      setOcrLoading(false);
    }
  };

  // Convert photograph to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAccusedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Call AI sections lookup
  const triggerAISuggestions = async (textToAnalyze: string) => {
    const queryText = textToAnalyze || narrativeDescription;
    if (!queryText) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        } as any,
        body: JSON.stringify({ narrative: queryText })
      });
      const data = await response.json();
      setAiSuggestions(data);
    } catch (err) {
      console.error('AI suggestion failure:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setError('');

    if (!isValidIndianPhone(victimContact)) {
      setError('Victim contact number is invalid. Enter a valid 10-digit mobile number.');
      return;
    }
    if (!isValidIndianPhone(witnessContact)) {
      setError('Witness contact number is invalid. Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    const payload = {
      case_number: caseNumber,
      fir_number: firNumber,
      police_station: policeStation,
      date_of_incident: dateOfIncident,
      crime_type: crimeType,
      location,
      narrative_description: narrativeDescription,
      victim_name: victimName,
      victim_address: victimAddress,
      victim_contact: victimContact,
      accused_name: accusedName,
      accused_address: accusedAddress,
      accused_photo_url: accusedPhoto,
      witness_name: witnessName,
      witness_contact: witnessContact
    };

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        } as any,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Case registration failed');

      navigate(`/cases/${data.caseId}`);
    } catch (err: any) {
      setError(err.message || 'Internal server error while registering case');
    } finally {
      setLoading(false);
    }
  };

  // Rendering of steps
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Navigator */}
      <div className="flex items-center justify-between border-b border-police-border/40 pb-4">
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-xs text-police-slate hover:text-police-gold font-semibold transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToList')}</span>
        </button>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">{t('newCase')}</h2>
          <p className="text-[10px] text-police-slate font-medium text-right uppercase">Clearance Clearance &gt; FIR Entry Form</p>
        </div>
      </div>

      {/* Demo Warning Alert */}
      {isDemoUser && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-4 py-3 rounded-md font-semibold mb-4">
          DEMO PREVIEW: Case filing operations are disabled. Navigate through the steps to see the form structure and legal mappings.
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-4 py-3 rounded-md font-semibold">
          {error}
        </div>
      )}

      {/* OCR Success Alert */}
      {ocrSuccessAlert && (
        <div className="bg-emerald-500/10 border border-police-success/30 text-police-success text-xs px-4 py-3 rounded-md font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>OCR Scanning completed! Case fields have been populated. Review and confirm details below.</span>
        </div>
      )}

      {/* Steps Indicator Progress Bar */}
      <div className="flex justify-between items-center bg-police-card border border-police-border/50 rounded-lg p-4">
        {[
          { num: 1, label: 'FIR & Incident', icon: FileText },
          { num: 2, label: 'Victim Details', icon: User },
          { num: 3, label: 'Accused Details', icon: User },
          { num: 4, label: 'Witness Details', icon: Users },
          { num: 5, label: 'Narrative & AI', icon: Sparkles }
        ].map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isActive = step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2 group cursor-pointer" onClick={() => setStep(s.num)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-200 ${
                isDone 
                  ? 'bg-police-success/10 border-police-success text-police-success' 
                  : isActive 
                    ? 'bg-police-gold/10 border-police-gold text-police-gold shadow-neon-gold' 
                    : 'border-police-border text-police-slate hover:border-white'
              }`}>
                {isDone ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider hidden md:inline ${
                isActive ? 'text-police-gold' : 'text-police-slate'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Fields Container */}
      <div className="glass-panel p-8 rounded-lg space-y-6">

        {/* STEP 1: Case Details & Incident Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Scanned Document OCR Banner */}
            <div className="bg-police-hover/30 border border-police-border p-5 rounded-lg text-center space-y-3">
              <BookOpen className="w-8 h-8 text-police-gold mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast FIR Registration (OCR)</h4>
                <p className="text-[10px] text-police-slate mt-1 max-w-lg mx-auto leading-relaxed">
                  Upload an image of a scanned FIR. CrimeGPT will run OCR text recognition to automatically extract names, times, stations, and crime descriptions.
                </p>
              </div>
              <div className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={isDemoUser ? undefined : handleOCRFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={ocrLoading || isDemoUser}
                />
                <button
                  type="button"
                  disabled={ocrLoading || isDemoUser}
                  className={`btn-secondary font-bold text-xs ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {ocrLoading ? 'Running Tesseract OCR Engine...' : (isDemoUser ? 'OCR Scanner Disabled (Demo)' : 'Select FIR Scan Image')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('caseNumber')}</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('firNumber')}</label>
                <input
                  type="text"
                  placeholder="e.g. FIR/120/DEL/2026"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('policeStation')}</label>
                <input
                  type="text"
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('dateOfIncident')}</label>
                <input
                  type="date"
                  value={dateOfIncident}
                  onChange={(e) => setDateOfIncident(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('crimeType')}</label>
                <select
                  value={crimeType}
                  onChange={(e) => setCrimeType(e.target.value)}
                  className="select-field"
                >
                  <option value="Theft">Theft</option>
                  <option value="Murder">Murder</option>
                  <option value="Assault">Assault / Hurt</option>
                  <option value="Cheating">Cheating / Fraud</option>
                  <option value="Kidnapping">Kidnapping</option>
                  <option value="Rape">Rape</option>
                  <option value="Unlawful Assembly">Rioting</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('location')}</label>
                <input
                  type="text"
                  placeholder="Crime Scene Address / Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Victim Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-police-border/40">
              {t('victimDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('victimName')}</label>
                <input
                  type="text"
                  placeholder="Victim's Full Name"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('victimContact')}</label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g. 9876543210"
                  value={victimContact}
                  onChange={(e) => handlePhoneInput(e.target.value, setVictimContact)}
                  maxLength={13}
                  className="input-field"
                />
                {victimContact && !isValidIndianPhone(victimContact) && (
                  <p className="text-[10px] text-red-400 font-semibold">Enter a valid 10-digit mobile number (optionally prefixed with +91 or 0).</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('victimAddress')}</label>
                <textarea
                  rows={3}
                  placeholder="Residential Address"
                  value={victimAddress}
                  onChange={(e) => setVictimAddress(e.target.value)}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Accused Details */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-police-border/40">
              {t('accusedDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('accusedName')}</label>
                <input
                  type="text"
                  placeholder="Accused/Suspect Full Name"
                  value={accusedName}
                  onChange={(e) => setAccusedName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('uploadPhoto')}</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <button
                      type="button"
                      className="btn-secondary py-2.5 px-4 flex items-center gap-2 text-xs font-bold"
                    >
                      <Camera className="w-4 h-4" />
                      Browse Photo
                    </button>
                  </div>
                  {accusedPhoto && (
                    <img
                      src={accusedPhoto}
                      alt="Accused Preview"
                      className="w-12 h-12 object-cover rounded-md border border-police-border"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('accusedAddress')}</label>
                <textarea
                  rows={3}
                  placeholder="Accused last known address or details"
                  value={accusedAddress}
                  onChange={(e) => setAccusedAddress(e.target.value)}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Witness Details */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-police-border/40">
              {t('witnessDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('witnessName')}</label>
                <input
                  type="text"
                  placeholder="Witness Full Name"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('witnessContact')}</label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g. 9876543210"
                  value={witnessContact}
                  onChange={(e) => handlePhoneInput(e.target.value, setWitnessContact)}
                  maxLength={13}
                  className="input-field"
                />
                {witnessContact && !isValidIndianPhone(witnessContact) && (
                  <p className="text-[10px] text-red-400 font-semibold">Enter a valid 10-digit mobile number (optionally prefixed with +91 or 0).</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Narrative, AI Recommendations & Review */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-police-slate font-bold uppercase tracking-wider">{t('narrative')}</label>
              <textarea
                rows={5}
                placeholder="Enter complete investigation narrative detail..."
                value={narrativeDescription}
                onChange={(e) => setNarrativeDescription(e.target.value)}
                className="input-field resize-none text-sm font-normal"
                required
              />
            </div>

            {/* AI Assistant Button Trigger */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => triggerAISuggestions(narrativeDescription)}
                disabled={aiLoading || !narrativeDescription}
                className="btn-secondary py-2 text-xs font-bold flex items-center gap-2 hover:border-police-gold text-police-gold"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>{aiLoading ? 'AI MAPPING LAWS...' : t('suggestSections')}</span>
              </button>
            </div>

            {/* Render AI Suggestions inline in form */}
            {aiSuggestions && (
              <div className="bg-[#0b1528] rounded-lg border border-police-border p-5 space-y-4 max-h-[350px] overflow-y-auto">
                <h4 className="text-xs font-bold text-police-gold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Recommended Sections
                </h4>
                
                {/* BNS Mappings */}
                <div className="space-y-3">
                  <h5 className="text-[10px] text-white font-bold uppercase tracking-wider border-b border-police-border/40 pb-1">
                    Bharatiya Nyaya Sanhita (BNS) & IPC equivalents
                  </h5>
                  {aiSuggestions.bns.map((sec, i) => (
                    <div key={i} className="text-xs bg-police-dark/50 p-3 rounded border border-police-border/45">
                      <div className="flex justify-between">
                        <span className="font-bold text-white">{sec.section_number} - {sec.section_title}</span>
                        <span className="text-[10px] text-police-gold font-bold">{t('confidence')}: {sec.confidence_score}%</span>
                      </div>
                      <p className="text-police-slate text-[11px] mt-1.5 leading-relaxed">{sec.explanation}</p>
                      
                      {/* Show equivalent IPC if exists */}
                      {aiSuggestions.ipc?.[i] && (
                        <div className="mt-2 text-[10px] bg-[#1e293b]/40 border-t border-police-border/30 pt-1.5 text-police-slate">
                          <span className="font-bold text-police-light">Equivalent IPC Charge: </span>
                          {aiSuggestions.ipc[i].section_number} ({aiSuggestions.ipc[i].section_title}) - {aiSuggestions.ipc[i].explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Judgments */}
                {aiSuggestions.judgments && aiSuggestions.judgments.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h5 className="text-[10px] text-white font-bold uppercase tracking-wider border-b border-police-border/40 pb-1">
                      {t('landmarkJudgments')}
                    </h5>
                    {aiSuggestions.judgments.map((jud, i) => (
                      <div key={i} className="text-xs bg-police-dark/50 p-3 rounded border border-police-border/45">
                        <div className="font-bold text-white">{jud.title} ({jud.year})</div>
                        <div className="text-[10px] text-police-gold font-medium mt-0.5">{t('citation')}: {jud.citation}</div>
                        <p className="text-police-slate text-[11px] mt-1.5 leading-relaxed">{jud.relevance}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Wizard Control Buttons */}
        <div className="flex justify-between border-t border-police-border/40 pt-6">
          <button
            type="button"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className="btn-secondary"
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(prev => Math.min(5, prev + 1))}
              className="btn-primary"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={isDemoUser ? undefined : handleRegisterSubmit}
              disabled={loading || !firNumber || !caseNumber || isDemoUser}
              className={`btn-primary ${isDemoUser ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span>{isDemoUser ? 'Submission Disabled (Demo)' : (loading ? 'Filing FIR Case...' : 'Submit FIR Record')}</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// Restricts phone input to digits (and an optional leading +), capped at a sane length.
// This runs on every keystroke so users physically cannot type letters/symbols into a phone field.
function handlePhoneInput(val: string, setter: (s: string) => void) {
  let cleaned = val.replace(/[^\d+]/g, ''); // strip everything except digits and '+'
  cleaned = cleaned.replace(/(?!^)\+/g, ''); // only allow a leading '+', strip any others
  if (cleaned.length > 13) cleaned = cleaned.slice(0, 13); // '+91' + 10 digits max
  setter(cleaned);
}

// Validates Indian mobile numbers: optional +91/0 prefix, then 10 digits starting 6-9.
// Empty string is allowed since victim/witness contact are optional fields.
function isValidIndianPhone(phone: string): boolean {
  if (!phone) return true;
  return /^(?:\+91[-\s]?|0)?[6-9]\d{9}$/.test(phone);
}

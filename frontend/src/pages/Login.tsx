import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertOctagon, UserPlus, Info, Home } from 'lucide-react';

// Enforces a minimum password strength for new account registration:
// at least 8 characters, one uppercase, one lowercase, one digit, one special character.
function getPasswordChecks(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw)
  };
}

function isStrongPassword(pw: string): boolean {
  const checks = getPasswordChecks(pw);
  return Object.values(checks).every(Boolean);
}

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'IO' | 'SHO' | 'LEGAL_ADVISOR' | 'ADMIN'>('IO');
  const [policeStation, setPoliceStation] = useState('Chanakyapuri Police Station');
  const [roleCredential, setRoleCredential] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const getCredentialHelper = (selectedRole: typeof role) => {
    switch (selectedRole) {
      case 'IO':
        return {
          label: 'Officer Badge ID',
          placeholder: 'IO-XXXXX (e.g., IO-10293)',
          pattern: 'IO-\\d{5}',
          note: 'Requires "IO-" prefix followed by exactly 5 digits.'
        };
      case 'SHO':
        return {
          label: 'Police Station Code',
          placeholder: 'PS-XXXX (e.g., PS-4001)',
          pattern: 'PS-\\d{4}',
          note: 'Requires "PS-" prefix followed by exactly 4 digits.'
        };
      case 'LEGAL_ADVISOR':
        return {
          label: 'Bar Council Registration Number',
          placeholder: 'BC-XXXX/XX (e.g., BC-1234/56)',
          pattern: 'BC-\\d{4}/\\d{2}',
          note: 'Requires "BC-" prefix followed by 4 digits, slash, and 2-digit year.'
        };
      case 'ADMIN':
        return {
          label: 'System Admin Security Code',
          placeholder: 'ADM-XXXXX (e.g., ADM-99182)',
          pattern: 'ADM-\\d{5}',
          note: 'Requires "ADM-" prefix followed by exactly 5 digits.'
        };
    }
  };

  const credHelper = getCredentialHelper(role);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must acknowledge and consent to the system tracking warning.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password, 
          role, 
          role_credential: roleCredential 
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Server connection issue');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must acknowledge and consent to the system tracking warning.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Password does not meet the minimum security requirements shown below.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          name,
          role,
          police_station: policeStation,
          role_credential: roleCredential
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created successfully! Log in below with your security credential.');
      setIsSignUp(false);
      // Reset forms
      setPassword('');
      setRoleCredential('');
      setAgreed(false);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020c1b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Cyber Security SVG Background (HUD & Constellation Network) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="security-grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
            <path d="M 90 0 L 0 0 0 90" fill="none" stroke="rgba(6, 180, 212, 0.03)" strokeWidth="1.5" />
          </pattern>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#0891b2" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#020c1b" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Deep background color */}
        <rect width="100%" height="100%" fill="#020c1b" />
        
        {/* Glow center */}
        <circle cx="50%" cy="50%" r="45%" fill="url(#bg-glow)" />

        {/* Tech Grid */}
        <rect width="100%" height="100%" fill="url(#security-grid)" />

        {/* Constellation lines */}
        <g stroke="rgba(6, 180, 212, 0.15)" strokeWidth="0.75">
          <line x1="8%" y1="12%" x2="22%" y2="8%" />
          <line x1="22%" y1="8%" x2="32%" y2="24%" />
          <line x1="8%" y1="12%" x2="18%" y2="32%" />
          <line x1="18%" y1="32%" x2="32%" y2="24%" />
          
          <line x1="72%" y1="10%" x2="82%" y2="22%" />
          <line x1="82%" y1="22%" x2="65%" y2="28%" />
          <line x1="65%" y1="28%" x2="72%" y2="10%" />

          <line x1="12%" y1="72%" x2="28%" y2="82%" />
          <line x1="28%" y1="82%" x2="22%" y2="58%" />
          <line x1="22%" y1="58%" x2="12%" y2="72%" />

          <line x1="78%" y1="68%" x2="88%" y2="82%" />
          <line x1="68%" y1="78%" x2="78%" y2="68%" />
          <line x1="68%" y1="78%" x2="88%" y2="82%" />
        </g>

        {/* Constellation dots */}
        <g>
          <circle cx="8%" cy="12%" r="3" fill="#06b6d4" className="animate-pulse" />
          <circle cx="22%" cy="8%" r="1.5" fill="#10b981" />
          <circle cx="32%" cy="24%" r="3.5" fill="#06b6d4" />
          <circle cx="18%" cy="32%" r="2.5" fill="#10b981" />
          
          <circle cx="72%" cy="10%" r="2" fill="#10b981" />
          <circle cx="82%" cy="22%" r="4" fill="#06b6d4" className="animate-pulse" />
          <circle cx="65%" cy="28%" r="2.5" fill="#10b981" />

          <circle cx="12%" cy="72%" r="3.5" fill="#06b6d4" />
          <circle cx="28%" cy="82%" r="2.5" fill="#10b981" />
          <circle cx="22%" cy="58%" r="2" fill="#06b6d4" className="animate-pulse" />

          <circle cx="78%" cy="68%" r="3" fill="#10b981" />
          <circle cx="88%" cy="82%" r="3.5" fill="#06b6d4" />
          <circle cx="68%" cy="78%" r="2" fill="#06b6d4" />
        </g>

        {/* Rotating Circular HUD motifs */}
        <g stroke="rgba(6, 182, 212, 0.12)" fill="none" strokeWidth="1">
          <circle cx="50%" cy="50%" r="320" strokeDasharray="8,24" className="animate-[spin_90s_linear_infinite]" />
          <circle cx="50%" cy="50%" r="280" strokeDasharray="60,30" className="animate-[spin_60s_linear_infinite_reverse]" />
          <circle cx="50%" cy="50%" r="240" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="200" strokeDasharray="4,8" className="animate-[spin_40s_linear_infinite]" />
        </g>
      </svg>

      {/* Login Card */}
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-2xl border border-slate-800/80 bg-[#0b1329]/95 shadow-[0_20px_50px_rgba(0,0,0,0.65)] relative z-10 animate-fadeIn">
        
        {/* Logo Shield & Header matching mockup */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_25px_rgba(59,130,246,0.3)] mb-4 select-none">
            C
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide font-sans">CrimeGPT Portal</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.18em] mt-1.5 text-center">Indian Police Legal Intelligence Platform</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
          <AlertOctagon className="w-5 h-5 text-police-crimson shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider block mb-0.5">WARNING: SECURE SYSTEM AUDIT</span>
            <span className="text-[9px] text-police-slate font-semibold leading-relaxed uppercase block">
              Authorized access only. Every action, document export, and session is cryptographically tracked under national security protocols.
            </span>
          </div>
        </div>

        {/* Form Tabs */}
        <div className="flex p-1 bg-police-dark/60 border border-slate-800/80 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              !isSignUp ? 'bg-indigo-600 text-white font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isSignUp ? 'bg-indigo-600 text-white font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>Register Portal</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-4 py-2.5 rounded-lg mb-4 font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-police-success/30 text-police-success text-xs px-4 py-2.5 rounded-lg mb-4 font-semibold">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={isSignUp ? handleRegisterSubmit : handleLoginSubmit} className="space-y-5">
          
          {isSignUp && (
            /* Officer Full Name */
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Officer Full Name</label>
              <input
                type="text"
                placeholder="e.g. Inspector R. K. Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full py-3 bg-[#050b14] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-white rounded-lg px-4 text-sm outline-none transition-all duration-200"
                required
              />
            </div>
          )}

          {/* Officer Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Officer Username</label>
            <input
              type="text"
              placeholder={isSignUp ? "Create unique username" : "e.g. io_rajesh"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field w-full py-3 bg-[#050b14] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-white rounded-lg px-4 text-sm outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Security Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full py-3 bg-[#050b14] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-white rounded-lg px-4 text-sm outline-none transition-all duration-200"
              required
            />
            {isSignUp && (() => {
              const checks = getPasswordChecks(password);
              const rules: Array<[keyof typeof checks, string]> = [
                ['length', 'At least 8 characters'],
                ['upper', 'One uppercase letter'],
                ['lower', 'One lowercase letter'],
                ['digit', 'One number'],
                ['special', 'One special character']
              ];
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-1.5 px-0.5">
                  {rules.map(([key, label]) => (
                    <div key={key} className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide ${checks[key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${checks[key] ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Duty Role Assignment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Duty Role Assignment</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as any);
                setRoleCredential('');
              }}
              className="select-field w-full py-3 bg-[#050b14] border border-slate-800 focus:border-indigo-500 text-white rounded-lg px-4 text-sm outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="IO">Investigating Officer (IO)</option>
              <option value="SHO">Station House Officer (SHO)</option>
              <option value="LEGAL_ADVISOR">Court Legal Advisor</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          {isSignUp && (
            /* Police Station Unit */
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Police Station / Unit</label>
              <input
                type="text"
                placeholder="e.g. Chanakyapuri Police Station"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                className="input-field w-full py-3 bg-[#050b14] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-white rounded-lg px-4 text-sm outline-none transition-all duration-200"
                required
              />
            </div>
          )}

          {/* Dynamic Badge Key */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{credHelper.label}</label>
              <span className="text-[8px] text-police-gold font-extrabold bg-police-gold/10 border border-police-gold/25 px-1.5 py-0.5 rounded uppercase tracking-wider">Security Key</span>
            </div>
            <input
              type="text"
              placeholder={credHelper.placeholder}
              value={roleCredential}
              onChange={(e) => setRoleCredential(e.target.value)}
              className="input-field w-full py-3 bg-[#050b14] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-white rounded-lg px-4 text-sm outline-none transition-all duration-200"
              required
            />
            <p className="text-[9px] text-slate-400/80 flex items-center gap-1 font-medium mt-0.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{credHelper.note}</span>
            </p>
          </div>

          {/* Mandatory Checkbox Audit */}
          <div className="flex items-start gap-3 pt-1">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="audit-agreement"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-[#050b14] text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                required
              />
            </div>
            <label htmlFor="audit-agreement" className="text-[9px] leading-relaxed text-slate-400 font-bold cursor-pointer uppercase select-none">
              I acknowledge authorization tracking and consent to active audit logging under compliance standards.
            </label>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || !agreed || (isSignUp && !isStrongPassword(password))}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-bold text-sm rounded-lg shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] transition-all duration-200 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed text-center block active:scale-95"
          >
            {loading 
              ? 'Verifying Credentials...' 
              : isSignUp 
                ? 'Secure Register' 
                : 'Secure Authenticate'
            }
          </button>

          {/* Quick Roles Access (Hackathon/Grading only) */}
          <div className="border-t border-slate-800/80 pt-5 mt-5">
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider mb-3.5">
              Quick Roles Access (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('io_sharma');
                  setPassword('password123');
                  setRole('IO');
                  setRoleCredential('IO-10293');
                  setAgreed(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-[10px] font-extrabold uppercase tracking-wide text-indigo-400 hover:text-white transition-all duration-200"
              >
                <span>IO Sharma</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('sho_singh');
                  setPassword('password123');
                  setRole('SHO');
                  setRoleCredential('PS-4001');
                  setAgreed(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-extrabold uppercase tracking-wide text-amber-400 hover:text-white transition-all duration-200"
              >
                <span>SHO Singh</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('legal_verma');
                  setPassword('password123');
                  setRole('LEGAL_ADVISOR');
                  setRoleCredential('BC-1234/56');
                  setAgreed(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-[10px] font-extrabold uppercase tracking-wide text-sky-400 hover:text-white transition-all duration-200"
              >
                <span>Legal Verma</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin_crimegpt');
                  setPassword('password123');
                  setRole('ADMIN');
                  setRoleCredential('ADM-99182');
                  setAgreed(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-[10px] font-extrabold uppercase tracking-wide text-rose-400 hover:text-white transition-all duration-200"
              >
                <span>Admin Portal</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

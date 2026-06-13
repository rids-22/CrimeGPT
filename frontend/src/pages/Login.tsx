import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertOctagon, UserPlus, Info, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-[#020c1b] via-[#040e22] to-[#020813] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background grid pattern that disappears towards the right */}
      <div 
        className="absolute inset-0 login-grid-pattern pointer-events-none z-0"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0) 65%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0) 65%)'
        }}
      ></div>

      {/* Central glow spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>

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
            disabled={loading || !agreed}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-bold text-sm rounded-lg shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] transition-all duration-200 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed text-center block active:scale-95"
          >
            {loading 
              ? 'Verifying Credentials...' 
              : isSignUp 
                ? 'Secure Register' 
                : 'Secure Authenticate'
            }
          </button>
        </form>

      </div>
    </div>
  );
};

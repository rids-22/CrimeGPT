import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  Folder, 
  FileClock, 
  LogOut, 
  Languages, 
  FileText,
  User,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', label: t('dashboard'), icon: Shield },
    { path: '/cases', label: t('cases'), icon: Folder },
    { path: '/cases/new', label: t('newCase'), icon: PlusCircle },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ path: '/audit', label: t('auditLogs'), icon: FileClock });
  }

  // Get Role Badge color styling
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-police-crimson/10 text-police-crimson border-police-crimson/30';
      case 'SHO': return 'bg-police-gold/10 text-police-gold border-police-gold/30';
      case 'LEGAL_ADVISOR': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default: return 'bg-emerald-500/10 text-police-success border-police-success/30';
    }
  };

  const isDemoUser = user?.username === 'io_sharma' || user?.username === 'sho_singh' || user?.username === 'legal_verma' || user?.username === 'admin_crimegpt';

  return (
    <div className="min-h-screen bg-[#020c1b] flex flex-col">
      {isDemoUser && (
        <div className="bg-amber-500/10 border-b border-amber-500/35 text-amber-400 py-2.5 px-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 relative z-50">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>DEMO PREVIEW ACTIVE: All database write/modify actions are disabled. Browse-only mode.</span>
        </div>
      )}
      <div className="flex-1 flex flex-col md:flex-row text-police-light police-watermark">
        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`w-64 bg-[#081225] border-r border-police-border/60 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-police-border/60 flex items-center gap-3">
            <div className="bg-police-gold/10 p-2 rounded-lg border border-police-gold/20 text-police-gold animate-pulse">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">{t('appTitle')}</h1>
              <p className="text-xs text-police-slate font-medium uppercase tracking-wider">{t('appSubtitle')}</p>
            </div>
          </div>

          {/* User Bio Panel */}
          {user && (
            <div className="p-4 mx-4 my-4 bg-police-card border border-police-border/40 rounded-lg shadow-inner">
              <div className="flex items-center gap-3">
                <div className="bg-police-hover p-2 rounded-full border border-police-border">
                  <User className="w-4 h-4 text-police-slate" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                  <p className="text-[10px] text-police-slate truncate">{user.police_station}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wide ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
                <span className="text-[10px] text-police-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-police-success animate-ping"></span>
                  {t('systemStatus')}
                </span>
              </div>
            </div>
          )}

          {/* Nav Menu */}
          <nav className="px-4 py-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active 
                      ? 'bg-police-hover text-police-gold border-l-4 border-police-gold shadow-neon-navy' 
                      : 'text-police-slate hover:text-white hover:bg-police-hover/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-police-gold' : 'text-police-slate'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-police-border/60 space-y-3 bg-[#050e1c]">
          {/* Language selection widget */}
          <div className="flex items-center gap-2 justify-between bg-police-card border border-police-border/40 rounded px-2.5 py-1.5">
            <span className="text-xs text-police-slate flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-police-gold" />
              {t('selectLanguage')}:
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-xs text-police-gold font-semibold outline-none cursor-pointer"
            >
              <option value="en" className="bg-police-card text-white">EN</option>
              <option value="hi" className="bg-police-card text-white">हिन्दी</option>
              <option value="gu" className="bg-police-card text-white">ગુજરાતી</option>
              <option value="mr" className="bg-police-card text-white">मराठी</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-police-hover/30 hover:bg-police-crimson/10 border border-police-border hover:border-police-crimson/30 text-police-slate hover:text-police-crimson rounded-md text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020c1b]/50 md:pl-0">
        <header className="h-16 border-b border-police-border/60 bg-[#081225]/50 backdrop-blur-md flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-police-slate hover:text-white md:hidden border border-police-border/30 rounded bg-police-card/30"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-police-slate font-medium hidden md:inline">
                CrimeGPT Portal &gt;
              </span>
              <span className="text-xs text-police-gold font-semibold uppercase tracking-wider">
                {location.pathname === '/' ? 'SYSTEM DASHBOARD' : location.pathname.substring(1).replace(/\//g, ' > ').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-police-slate font-medium">
            {t('welcome')}, <span className="text-white font-semibold">{user?.name}</span>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};

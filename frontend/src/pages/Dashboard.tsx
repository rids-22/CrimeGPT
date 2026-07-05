import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Folder, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  PlusCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Paperclip,
  Activity,
  Gavel,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  arrested: number;
  documents: number;
  recentActivities: Array<{
    id: number;
    case_id: number;
    timestamp: string;
    entry_type: string;
    description: string;
    officer_name: string;
    case_number: string;
    crime_type: string;
  }>;
  auditLogs: Array<{
    id: number;
    username: string;
    action: string;
    timestamp: string;
  }>;
  crimeTypeDistribution: Array<{
    label: string;
    count: number;
    percent: number;
  }>;
  monthlyTrend: Array<{
    label: string;
    count: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, token, authHeader } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cases/dashboard', {
      headers: { ...authHeader() } as any
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    })
    .then(data => {
      setStats(data);
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-police-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('totalCases'),
      value: stats?.total || 0,
      icon: Folder,
      color: 'border-l-4 border-police-gold text-police-gold bg-police-gold/5',
      glow: 'shadow-neon-gold border-l-police-gold'
    },
    {
      title: t('activeCases'),
      value: stats?.active || 0,
      icon: ShieldAlert,
      color: 'border-l-4 border-sky-500 text-sky-400 bg-sky-500/5',
      glow: 'shadow-neon-navy border-l-sky-500'
    },
    {
      title: t('arrestedCases'),
      value: stats?.arrested || 0,
      icon: UserCheck,
      color: 'border-l-4 border-police-success text-police-success bg-police-success/5',
      glow: 'shadow-neon-navy border-l-police-success'
    },
    {
      title: t('documentsGenerated'),
      value: stats?.documents || 0,
      icon: FileText,
      color: 'border-l-4 border-purple-500 text-purple-400 bg-purple-500/5',
      glow: 'shadow-neon-navy border-l-purple-500'
    }
  ];

  const quickLinks = [
    {
      title: t('newCase'),
      subtitle: 'OCR and file ingestion',
      icon: PlusCircle,
      path: '/cases/new',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/20'
    },
    {
      title: t('cases'),
      subtitle: 'Browse active files',
      icon: Folder,
      path: '/cases',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/20'
    },
    {
      title: t('auditLogs'),
      subtitle: 'Access logs & audits',
      icon: ShieldCheck,
      path: '/audit',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/20'
    },
    {
      title: t('aiAssistant'),
      subtitle: 'Legal advisory mapping',
      icon: TrendingUp,
      path: '/cases',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20'
    }
  ];

  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'FIR_REGISTERED':
        return {
          label: 'FIR Registered',
          color: 'border-red-500/30 bg-red-500/5 text-red-400',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          bulletColor: 'bg-red-500 ring-red-500/30'
        };
      case 'STATEMENT_RECORDED':
        return {
          label: 'Statement Recorded',
          color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          bulletColor: 'bg-cyan-500 ring-cyan-500/30'
        };
      case 'EVIDENCE_SEIZED':
        return {
          label: 'Evidence Seized',
          color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          bulletColor: 'bg-emerald-500 ring-emerald-500/30'
        };
      case 'ARREST_MADE':
        return {
          label: 'Arrest Made',
          color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          bulletColor: 'bg-amber-500 ring-amber-500/30'
        };
      case 'MEDICAL_EXAM':
        return {
          label: 'Medical Exam',
          color: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          bulletColor: 'bg-purple-500 ring-purple-500/30'
        };
      case 'COURT_PRODUCTION':
        return {
          label: 'Court Production',
          color: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
          badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
          bulletColor: 'bg-violet-500 ring-violet-500/30'
        };
      default:
        return {
          label: type.replace(/_/g, ' '),
          color: 'border-police-border/30 bg-police-dark/30 text-police-light',
          badgeColor: 'bg-police-hover border-police-border text-white',
          bulletColor: 'bg-police-slate ring-police-slate/20'
        };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'FIR_REGISTERED':
        return ShieldAlert;
      case 'STATEMENT_RECORDED':
        return MessageSquare;
      case 'EVIDENCE_SEIZED':
        return Paperclip;
      case 'ARREST_MADE':
        return UserCheck;
      case 'MEDICAL_EXAM':
        return Activity;
      case 'COURT_PRODUCTION':
        return Gavel;
      default:
        return Clock;
    }
  };

  // ---- Donut chart: crime type distribution, computed from real case data ----
  const DONUT_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#94a3b8'];
  const DONUT_RADIUS = 50;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
  const crimeDistribution = stats?.crimeTypeDistribution || [];
  let cumulativePercent = 0;
  const donutSlices = crimeDistribution.map((entry, idx) => {
    const sliceLength = (entry.percent / 100) * DONUT_CIRCUMFERENCE;
    const offset = -(cumulativePercent / 100) * DONUT_CIRCUMFERENCE;
    cumulativePercent += entry.percent;
    return {
      ...entry,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
      dasharray: `${sliceLength} ${DONUT_CIRCUMFERENCE - sliceLength}`,
      dashoffset: offset
    };
  });

  // ---- Line chart: monthly case registration trend, computed from real case data ----
  const monthlyTrend = stats?.monthlyTrend || [];
  const trendCounts = monthlyTrend.map(m => m.count);
  const trendMax = Math.max(5, ...trendCounts);
  // Round the axis ceiling up to a clean multiple of 5 so grid labels stay whole numbers.
  const yAxisMax = Math.ceil(trendMax / 5) * 5;
  const CHART_LEFT = 50;
  const CHART_RIGHT = 560;
  const CHART_TOP = 20;
  const CHART_BOTTOM = 180;
  const trendPoints = monthlyTrend.map((m, idx) => {
    const x = monthlyTrend.length > 1
      ? CHART_LEFT + (idx / (monthlyTrend.length - 1)) * (CHART_RIGHT - CHART_LEFT)
      : (CHART_LEFT + CHART_RIGHT) / 2;
    const y = CHART_BOTTOM - (m.count / yAxisMax) * (CHART_BOTTOM - CHART_TOP);
    return { x, y, label: m.label, count: m.count };
  });
  const trendLinePath = trendPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const trendAreaPath = trendPoints.length
    ? `M ${trendPoints[0].x} ${CHART_BOTTOM} L ${trendLinePath.slice(2)} L ${trendPoints[trendPoints.length - 1].x} ${CHART_BOTTOM} Z`
    : '';
  const yAxisTicks = [0, 1, 2, 3, 4, 5].map(i => ({
    y: CHART_BOTTOM - (i / 5) * (CHART_BOTTOM - CHART_TOP),
    value: Math.round((i / 5) * yAxisMax)
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#020c1b] p-8 rounded-2xl border border-police-border/40 relative overflow-hidden shadow-neon-navy">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-police-gold/5 rounded-full blur-3xl"></div>
        {/* Scanner Line */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-[pulse_2.5s_infinite]"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                OPERATIONAL STATE // ONLINE
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-police-gold to-amber-400">{user?.name}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-police-slate font-medium">
              <span className="flex items-center gap-1.5 font-bold uppercase text-police-light">
                <span className="text-police-gold">STATION CLEARANCE &gt;</span> {user?.police_station || 'District HQ'}
              </span>
              <span className="hidden sm:inline text-police-border">|</span>
              <span className="font-mono text-[11px] bg-police-dark/50 px-2 py-0.5 rounded border border-police-border/30 text-cyan-400">
                CREDENTIAL ID: {user?.role_credential || 'ADM-99182'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/cases/new')}
            className="btn-primary w-full md:w-auto px-6 py-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] whitespace-nowrap"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>{t('newCase')}</span>
          </button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-6 rounded-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.03] ${card.color} ${card.glow}`}
            >
              <div>
                <p className="text-[11px] font-bold text-police-slate uppercase tracking-widest mb-1.5">
                  {card.title}
                </p>
                <h3 className="text-3xl font-black text-white">{card.value}</h3>
              </div>
              <div className="p-3.5 rounded-xl bg-police-hover/60 border border-police-border shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Commands Grid (horizontal row) */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest pl-1">
          Operational Commands
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(link.path)}
                className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.05] group ${link.color}`}
              >
                <div className="p-3 rounded-full bg-police-dark/50 border border-police-border transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-6 h-6 transition-all duration-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white tracking-wide uppercase">{link.title}</h4>
                  <p className="text-[9px] text-police-slate mt-0.5 leading-tight group-hover:text-police-light transition-colors">{link.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Widget: Monthly Crime Registration Trend (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-police-border/40 flex flex-col justify-between h-[360px]">
          <div className="pb-3 border-b border-police-border/40">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Monthly Crime Registration Trend
            </h3>
          </div>
          <div className="my-auto py-2 w-full h-[220px]">
            <svg viewBox="0 0 600 240" className="w-full h-full text-indigo-400">
              {/* Grid Lines */}
              {yAxisTicks.map((tick, idx) => (
                <line
                  key={idx}
                  x1="50" y1={tick.y} x2="560" y2={tick.y}
                  stroke="#1d2d50"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? undefined : "3,3"}
                />
              ))}

              {/* Y-Axis Labels */}
              {yAxisTicks.map((tick, idx) => (
                <text key={idx} x="25" y={tick.y + 4} className="fill-police-slate text-[10px] font-mono font-semibold" textAnchor="end">
                  {tick.value}
                </text>
              ))}

              {/* X-Axis Labels */}
              {trendPoints.map((p, idx) => (
                <text key={idx} x={p.x} y="212" className="fill-police-slate text-[10px] font-mono font-bold" textAnchor="middle">
                  {p.label}
                </text>
              ))}

              {trendPoints.length > 0 && (
                <>
                  {/* Area fill under curve */}
                  <path d={trendAreaPath} fill="url(#gradient-area)" opacity="0.15" />

                  {/* Glowing stroke line */}
                  <path d={trendLinePath} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Data points */}
                  {trendPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x} cy={p.y} r="5"
                      className="fill-[#6366f1] stroke-[#030a16] stroke-2 cursor-pointer hover:r-7 transition-all duration-150"
                    >
                      <title>{`${p.label}: ${p.count} case${p.count === 1 ? '' : 's'}`}</title>
                    </circle>
                  ))}
                </>
              )}

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Donut Chart Widget: Crime Type Distribution (1/3 width) */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-police-border/40 flex flex-col justify-between h-[360px]">
          <div className="pb-3 border-b border-police-border/40">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Crime Type Distribution
            </h3>
          </div>
          <div className="my-auto py-2">
            <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto transform -rotate-90">
              {donutSlices.length > 0 ? (
                donutSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx="100"
                    cy="100"
                    r={DONUT_RADIUS}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="24"
                    strokeDasharray={slice.dasharray}
                    strokeDashoffset={slice.dashoffset}
                  >
                    <title>{`${slice.label}: ${slice.count} case${slice.count === 1 ? '' : 's'} (${slice.percent}%)`}</title>
                  </circle>
                ))
              ) : (
                <circle cx="100" cy="100" r={DONUT_RADIUS} fill="transparent" stroke="#334155" strokeWidth="24" />
              )}
              {/* Inner Core hole overlay */}
              <circle
                cx="100"
                cy="100"
                r="38"
                className="fill-[#020c1b]"
              />
            </svg>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-police-slate pt-3 border-t border-police-border/40">
            {donutSlices.length > 0 ? (
              donutSlices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: slice.color }}></span>
                  <span>{slice.label} ({slice.percent}%)</span>
                </div>
              ))
            ) : (
              <span>No cases registered yet</span>
            )}
          </div>
        </div>

      </div>

      {/* Live Timeline and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-police-border/40 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-police-border/40">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-police-gold" />
              Recent Activities (Timeline)
            </h3>
            {user?.role === 'ADMIN' && (
              <Link
                to="/audit"
                className="text-xs text-police-gold hover:underline font-semibold flex items-center gap-1"
              >
                <span>Verify Audit Trails</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="relative border-l-2 border-police-border/50 pl-6 ml-3 space-y-6">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => {
                const style = getActivityStyle(activity.entry_type);
                const Icon = getActivityIcon(activity.entry_type);
                return (
                  <div key={activity.id} className="relative">
                    {/* Timeline Node */}
                    <span className={`absolute -left-[32px] top-1.5 w-4 h-4 rounded-full border border-police-dark shadow-md flex items-center justify-center ${style.bulletColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    </span>

                    {/* Card container */}
                    <div className={`p-4 rounded-lg border transition-all duration-200 hover:border-police-border/80 ${style.color}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-police-border/30 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badgeColor} uppercase tracking-wider flex items-center gap-1`}>
                            <Icon className="w-3 h-3" />
                            {style.label}
                          </span>
                          <span className="text-[10px] text-police-slate font-semibold uppercase">
                            Crime: {activity.crime_type}
                          </span>
                        </div>
                        <div className="text-[10px] text-police-slate font-medium">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <p className="text-xs text-police-light leading-relaxed font-normal mb-3">
                        {activity.description}
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-police-slate">
                        <div className="flex items-center gap-1 bg-police-dark/50 px-2 py-1 rounded border border-police-border/20">
                          <span className="font-semibold">Case:</span>
                          <Link 
                            to={`/cases/${activity.case_id}`}
                            className="text-police-gold hover:underline font-extrabold flex items-center gap-0.5"
                          >
                            {activity.case_number}
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                        <div>
                          Operator: <span className="text-white font-bold">{activity.officer_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-police-slate pl-2 py-4">No recent case activities logged.</p>
            )}
          </div>
        </div>

        {/* Analytics & System Status (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-police-border/40 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-police-gold" />
              Surveillance Analytics
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-police-dark/30 p-2.5 rounded border border-police-border/20">
                <span className="text-police-slate font-medium">Clearance Rate</span>
                <span className="font-bold text-white">{stats?.total ? Math.round((stats.arrested / stats.total) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between items-center bg-police-dark/30 p-2.5 rounded border border-police-border/20">
                <span className="text-police-slate font-medium">BNS Document Pipeline</span>
                <span className="font-bold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center bg-[#0e1626]/40 p-2.5 rounded border border-police-border/20">
                <span className="text-police-slate font-medium">AI Translation Core</span>
                <span className="font-bold text-cyan-400">SYNCED</span>
              </div>
              <div className="flex justify-between items-center bg-[#0e1626]/40 p-2.5 rounded border border-police-border/20">
                <span className="text-police-slate font-medium">OCR Scan Engine</span>
                <span className="font-bold text-police-gold">READY</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

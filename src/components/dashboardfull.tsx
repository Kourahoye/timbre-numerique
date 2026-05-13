import {  gql } from "@apollo/client";
import {  useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import ThemeSwitcher, { type ThemeName } from "./theme";

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const DASHBOARD_QUERY = gql`
  query DashboardFull {
    dashboardStats {
      totalTimbres usedTimbres unusedTimbres totalRevenue
      pendingTransactions acceptedTransactions rejectedTransactions
      unreadNotifications totalUsers
      activeSession { id name }
    }
    sessionInfos { id name active startDate endDate }
    timbres {
      id used
      price { price session { id name } type { name } }
    }
    transactions { id status createdAt timbre { id type { name } } }
    timbreType { id name }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActiveSession { id: string; name: string }
interface Stats {
  totalTimbres: number; usedTimbres: number; unusedTimbres: number;
  totalRevenue: number; pendingTransactions: number;
  acceptedTransactions: number; rejectedTransactions: number;
  unreadNotifications: number; totalUsers: number;
  activeSession: ActiveSession | null;
}
interface Session { id: string; name: string; active: boolean; startDate: string; endDate: string }
interface TypeTimbre { id: string; name: string }
interface TimbreItem {
  id: string; used: boolean;
  price: { price: number; session: { id: string; name: string }; type: { name: string } };
}
interface Transaction { id: string; status: string; createdAt: string; timbre: { id: string; type: { name: string } } }
interface QueryData {
  dashboardStats: Stats; sessionInfos: Session[];
  timbres: TimbreItem[]; transactions: Transaction[]; timbreType: TypeTimbre[];
}


interface Palette { p: string; s: string; a: string; ok: string; warn: string; err: string; info: string; dim: string }

const PALETTES: Record<ThemeName, Palette> = {
  //   primary            secondary         accent            success           warning           error             info              muted/dim
  Timbre: { p:"#a78bfa", s:"#a3e635",      a:"#5eead4",      ok:"#4ade80",     warn:"#fb923c",   err:"#f87171",    info:"#60a5fa",   dim:"#a8a29e" },
  Slate:  { p:"#86efac", s:"#818cf8",      a:"#67e8f9",      ok:"#86efac",     warn:"#fde68a",   err:"#fca5a5",    info:"#93c5fd",   dim:"#94a3b8" },
  desk:   { p:"#6b7280", s:"#e879f9",      a:"#6ee7b7",      ok:"#34d399",     warn:"#fbbf24",   err:"#f97316",    info:"#60a5fa",   dim:"#6b7280" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt     = (n: number) => n.toLocaleString("fr-FR");
const fmtK    = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}k` : `${v}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"2-digit" });

// ─── Recharts tooltip (uses DaisyUI classes) ──────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-200 border border-base-300 rounded-box px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-base-content mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ h = "h-28" }: { h?: string }) => (
  <div className={`skeleton rounded-box ${h} w-full`} />
);

// ─── Section header ───────────────────────────────────────────────────────────

const Section = ({ title }: { title: string }) => (
  <h2 className="mt-8 mb-3 pb-1.5 border-b border-base-300 text-[10px] font-bold uppercase tracking-widest text-base-content/40">
    {title}
  </h2>
);

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "text-primary" | "text-secondary" | "text-accent" | "text-success" | "text-warning" | "text-error" | "text-info";
}) {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm">
      <div className="card-body p-4 gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">{label}</span>
        <span className={`font-mono text-2xl font-bold ${color ?? "text-base-content"}`}>{value}</span>
        {sub && <span className="text-[11px] text-base-content/40">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm">
      <div className="card-body p-4 gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">{title}</span>
        {children}
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function UsageDonut({ used, total, pal }: { used: number; total: number; pal: Palette }) {
  const {t:trans} = useTranslation()
  const unused = total - used;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const data = [{ name: trans("timbre.used_s"), value: used }, { name: trans("timbre.available_s"), value: unused }];
  return (
    <ChartCard title={trans("dashboard.globalUse")}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={70}
              dataKey="value" startAngle={90} endAngle={-270} paddingAngle={3}>
              <Cell fill={pal.p} />
              <Cell fill={pal.dim + "55"} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-bold text-base-content">{pct}%</span>
          <span className="text-[10px] text-base-content/40">{trans("timbre.used_s")}</span>
        </div>
      </div>
      <div className="flex justify-around">
        {[{ label: trans("timbre.used_s"), val: used, color: pal.p }, { label: trans("timbre.available_s"), val: unused, color: pal.dim }].map(d => (
          <div key={d.label} className="flex flex-col items-center gap-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-[9px] uppercase tracking-wider text-base-content/40">{d.label}</span>
            <span className="font-mono text-sm font-bold text-base-content">{fmt(d.val)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function TxPie({ pending, accepted, rejected, pal }: {
  pending: number; accepted: number; rejected: number; pal: Palette;
}) {
  const {t:trans} = useTranslation()
  const data = [
    { name: trans("transaction.status.accepted"),  value: accepted },
    { name: trans("transaction.status.pending"), value: pending  },
    { name: trans("transaction.status.rejected"),   value: rejected },
  ];
  const colors = [pal.ok, pal.warn, pal.err];
  return (
    <ChartCard title={trans("dashboard.repartitionTransaction")}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={68}
            dataKey="value" paddingAngle={4}>
            {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-around">
        {data.map((d, i) => (
          <div key={d.name} className="flex flex-col items-center gap-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
            <span className="text-[9px] uppercase tracking-wider text-base-content/40">{d.name}</span>
            <span className="font-mono text-sm font-bold text-base-content">{d.value}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function RevenueBar({ sessionInfos, timbres, pal }: { sessionInfos: Session[]; timbres: TimbreItem[]; pal: Palette }) {
  const {t:trans} = useTranslation()
  const data = sessionInfos.map(s => {
    const st = timbres.filter(t => t.price.session.id === s.id);
    return { name: s.name, [trans("timbre.revenus")]: Math.round(st.filter(t => t.used).reduce((sum, t) => sum + t.price.price, 0)) };
  });
  return (
    <ChartCard title={trans("dashboard.revenueBySession")}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={pal.dim + "33"} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: pal.dim }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: pal.dim }} axisLine={false} tickLine={false} width={44} tickFormatter={fmtK} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey={trans("timbre.revenus")} fill={pal.p} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function TimbreStackBar({ sessionInfos, timbres, pal }: { sessionInfos: Session[]; timbres: TimbreItem[]; pal: Palette }) {
  const {t:trans} = useTranslation()
  const data = sessionInfos.map(s => {
    const st = timbres.filter(t => t.price.session.id === s.id);
    const used = st.filter(t => t.used).length;
    return { name: s.name, [`${trans("timbre.used_s")}`]: used, [`${trans("timbre.available_s")}`]: st.length - used };
  });
  return (
    <ChartCard title={trans("dashboard.bySessionStamp")}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={pal.dim + "33"} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: pal.dim }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: pal.dim }} axisLine={false} tickLine={false} width={32} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey={trans("timbre.used_s")}    stackId="a" fill={pal.p} />
          <Bar dataKey={trans("timbre.available_s")} stackId="a" fill={pal.s} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function TypeBar({ timbres, timbreType, pal }: { timbres: TimbreItem[]; timbreType: TypeTimbre[]; pal: Palette }) {
   const {t:trans} = useTranslation()
  const data = timbreType.map(tt => {
    const items = timbres.filter(t => t.price.type.name === tt.name);
    return { name: tt.name, [`${trans("timbre.total")}`]: items.length, [`${trans("timbre.used_s")}`]: items.filter(t => t.used).length };
  });
  return (
    <ChartCard title={trans("dashboard.stampByType")}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={pal.dim + "33"} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: pal.dim }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: pal.dim }} axisLine={false} tickLine={false} width={80} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey={trans("timbre.total")}   fill={pal.a}  radius={[0, 4, 4, 0]} />
          <Bar dataKey={trans("timbre.used_s")} fill={pal.p}  radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function TxTrend({ transactions, pal }: { transactions: Transaction[]; pal: Palette }) {
  const {t:trans} = useTranslation()
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const data = days.map(day => {
    const tx = transactions.filter(t => t.createdAt.startsWith(day));
      return {
    date: day.slice(5),
    [trans("transaction.status.accepted")]: tx.filter(t => t.status === "accepted").length,
    [trans("transaction.status.pending")]:  tx.filter(t => t.status === "pending").length,
    [trans("transaction.status.rejected")]: tx.filter(t => t.status === "rejected").length,
  };
  });
  return (
    <ChartCard title={trans("dashboard.evolution")}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={pal.dim + "33"} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: pal.dim }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: pal.dim }} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey={trans("transaction.status.accepted")}   stroke={pal.ok}   strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey={trans("transaction.status.pending")}    stroke={pal.warn} strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey={trans("transaction.status.rejected")}     stroke={pal.err}  strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── sessionInfos table ───────────────────────────────────────────────────────────

function SessionTable({ sessionInfos, timbres }: { sessionInfos: Session[]; timbres: TimbreItem[] }) {
  const {t:trans} = useTranslation()
  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="bg-base-300/60 text-base-content/50 text-[10px] uppercase tracking-widest">
              <th>{trans("session.name")}</th>
              <th>{trans("session.startDate")}</th>
              <th>{trans("session.endDate")}</th>
              <th>{trans("timbre.stamps")}</th>
              <th>{trans("timbre.used")}</th>
              <th className="text-right">{trans("timbre.revenus")}</th>
              <th>{trans("timbre.status")}</th>
            </tr>
          </thead>
          <tbody>
            {sessionInfos.map(s => {
              const st      = timbres.filter(t => t.price.session.id === s.id);
              const used    = st.filter(t => t.used).length;
              const revenue = st.filter(t => t.used).reduce((sum, t) => sum + t.price.price, 0);
              return (
                <tr key={s.id} className="border-base-300 hover:bg-base-300/30 transition-colors">
                  <td className="font-mono font-semibold text-sm text-base-content">{s.name}</td>
                  <td className="text-xs text-base-content/60">{fmtDate(s.startDate)}</td>
                  <td className="text-xs text-base-content/60">{fmtDate(s.endDate)}</td>
                  <td className="text-right font-mono text-sm text-base-content">{fmt(st.length)}</td>
                  <td className="text-right font-mono text-sm text-base-content">{fmt(used)}</td>
                  <td className="text-right font-mono text-sm text-base-content">
                    {fmt(Math.round(revenue))}
                    <span className="text-base-content/40 text-[10px] ml-1">GNF</span>
                  </td>
                  <td>
                    {s.active
                      ? <span className="badge badge-success badge-sm gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />{trans("session.active")}
                        </span>
                      : <span className="badge badge-neutral badge-sm">{trans("session.inactive")}</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Theme switcher ───────────────────────────────────────────────────────────



// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardFull() {
  const {t:trans} = useTranslation()
  const [theme, setTheme] = useState<ThemeName>(`${localStorage.getItem("dash-theme")?.toString() as ThemeName ||"Timbre"}`);

  const { data, loading, error, refetch } = useQuery<QueryData>(DASHBOARD_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const pal = PALETTES[theme];
  const s   = data?.dashboardStats;

  const handleTheme = (t: ThemeName) => {
    setTheme(t);
    localStorage.setItem("dash-theme",t)
    document.querySelector("#dashbord")?.setAttribute("data-theme-2", t);
  };

  return (
    <div id="dashboard" data-theme={theme} className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-base-content">{trans("dashboard.name")}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mt-0.5">
              {trans("dashboard.desc")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {s?.activeSession && (
              <div className="badge badge-outline badge-lg gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs">{trans("session.title")} : {s.activeSession.name}</span>
              </div>
            )}
            <ThemeSwitcher theme={theme} setTheme={handleTheme} />
            <button className="btn btn-sm btn-ghost" onClick={() => refetch()} disabled={loading}>
              {trans("common.refresh")}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error my-4 text-sm">{error.message}</div>
        )}

        {/* KPIs */}
        {/* "Vue globale" */}
        <Section title={trans("dashboard.overview")} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading && !s
            ? Array.from({ length: 6 }).map((_, i) => <Sk key={i} h="h-20" />)
            : s ? (
              <>
                <KpiCard label={trans("timbre.total")}   value={fmt(s.totalTimbres)} />
                <KpiCard label={trans("timbre.used_s")}  value={fmt(s.usedTimbres)}    color="text-primary" />
                <KpiCard label={trans("timbre.available_s")}      value={fmt(s.unusedTimbres)}  color="text-secondary" />
                <KpiCard label={trans("timbre.revenus")}          value={`${fmtK(s.totalRevenue)} GNF`} sub={trans("timbre.used_s")} color="text-accent" />
                <KpiCard label={trans("auth.users")}    value={fmt(s.totalUsers)} />
                <KpiCard label={trans("notifications.notifications")}   value={s.unreadNotifications} sub={trans("notifications.unRead")}
                  color={s.unreadNotifications > 0 ? "text-warning" : undefined} />
              </>
            ) : null}
        </div>

        {/* Overview charts */}
        <Section title={trans("dashboard.survey")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && !s
            ? <><Sk h="h-72" /><Sk h="h-72" /><Sk h="h-72" /></>
            : s && data ? (
              <>
                <UsageDonut used={s.usedTimbres} total={s.totalTimbres} pal={pal} />
                <TxPie pending={s.pendingTransactions} accepted={s.acceptedTransactions} rejected={s.rejectedTransactions} pal={pal} />
                <TypeBar timbres={data.timbres} timbreType={data.timbreType} pal={pal} />
              </>
            ) : null}
        </div>

        {/* Per-session charts */}
        <Section title={trans("dashboard.bySession")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading && !s
            ? <><Sk h="h-64" /><Sk h="h-64" /></>
            : data ? (
              <>
                <RevenueBar    sessionInfos={data.sessionInfos} timbres={data.timbres} pal={pal} />
                <TimbreStackBar sessionInfos={data.sessionInfos} timbres={data.timbres} pal={pal} />
              </>
            ) : null}
        </div>

        {/* Trend */}
        <Section title={trans("dashboard.evolution")} />
        {loading && !s ? <Sk h="h-64" /> : data ? <TxTrend transactions={data.transactions} pal={pal} /> : null}

        {/* sessionInfos table */}
        <Section title={trans("session.allSessions")} />
        {loading && !s ? <Sk h="h-40" /> : data ? <SessionTable sessionInfos={data.sessionInfos} timbres={data.timbres} /> : null}

        <p className="mt-10 text-center text-[9px] uppercase tracking-widest text-base-content/20">
          Timbre system · dashboard v2
        </p>
      </div>
    </div>
  );
}
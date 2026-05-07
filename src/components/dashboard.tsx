import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

// ─── GraphQL Query ────────────────────────────────────────────────────────────

const DASHBOARD_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalTimbres
      usedTimbres
      unusedTimbres
      totalRevenue
      pendingTransactions
      acceptedTransactions
      rejectedTransactions
      unreadNotifications
      totalUsers
      activeSession {
        id
        name
      }
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveSession {
  id: string;
  name: string;
}

interface DashboardStatsData {
  totalTimbres: number;
  usedTimbres: number;
  unusedTimbres: number;
  totalRevenue: number;
  pendingTransactions: number;
  acceptedTransactions: number;
  rejectedTransactions: number;
  unreadNotifications: number;
  totalUsers: number;
  activeSession: ActiveSession | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/60">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${accent ?? "bg-zinc-700"}`}
      />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-zinc-100">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-zinc-500">{sub}</p>
      )}
    </div>
  );
}

function TransactionBar({
  pending,
  accepted,
  rejected,
}: {
  pending: number;
  accepted: number;
  rejected: number;
}) {
  const total = pending + accepted + rejected || 1;
  const pPct = Math.round((pending / total) * 100);
  const aPct = Math.round((accepted / total) * 100);
  const rPct = 100 - pPct - aPct;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Transactions
      </p>

      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-amber-400 transition-all duration-700"
          style={{ width: `${pPct}%` }}
        />
        <div
          className="bg-emerald-400 transition-all duration-700"
          style={{ width: `${aPct}%` }}
        />
        <div
          className="bg-rose-500 transition-all duration-700"
          style={{ width: `${rPct}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "En attente", value: pending, color: "text-amber-400", dot: "bg-amber-400" },
          { label: "Acceptées",  value: accepted, color: "text-emerald-400", dot: "bg-emerald-400" },
          { label: "Rejetées",   value: rejected, color: "text-rose-500", dot: "bg-rose-500" },
        ].map(({ label, value, color, dot }) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
            </div>
            <span className={`font-mono text-xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageRing({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Utilisation des timbres
      </p>
      <div className="mt-4 flex items-center gap-5">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45" cy="45" r={r}
            fill="none"
            stroke="#27272a"
            strokeWidth="7"
          />
          <circle
            cx="45" cy="45" r={r}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={circ / 4}
            className="transition-all duration-700"
          />
          <text
            x="45" y="45"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-zinc-100 font-mono text-sm font-bold"
            style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}
          >
            {Math.round(pct)}%
          </text>
        </svg>
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Utilisés</p>
            <p className="font-mono text-xl font-bold text-violet-400">{used}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Disponibles</p>
            <p className="font-mono text-xl font-bold text-zinc-300">{total - used}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionBadge({ session }: { session: ActiveSession | null }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1.5">
      <span
        className={`h-2 w-2 rounded-full ${session ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600"}`}
      />
      <span className="text-xs font-medium text-zinc-300">
        {session ? `Session active — ${session.name}` : "Aucune session active"}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-zinc-800/60 ${className ?? ""}`}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardInfo() {
  const { data, loading, error, refetch } = useQuery<{
    dashboardStats: DashboardStatsData;
  }>(DASHBOARD_QUERY, { fetchPolicy: "cache-and-network" });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  const s = data?.dashboardStats;

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 font-sans text-zinc-100">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vue d'ensemble — données en temps réel
          </p>
        </div>
        <div className="flex items-center gap-3">
          {s && <SessionBadge session={s.activeSession} />}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-40"
          >
            <span className={refreshing ? "animate-spin inline-block" : ""}>↺</span>
            {" "}Actualiser
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-400">
          Erreur de chargement : {error.message}
        </div>
      )}

      {/* Top row — revenue + users + notifications */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading && !s ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : s ? (
          <>
            <StatCard
              label="Revenus totaux"
              value={`${s.totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} GNF`}
              sub="Timbres utilisés uniquement"
              accent="bg-gradient-to-r from-violet-500 to-indigo-500"
            />
            <StatCard
              label="Utilisateurs"
              value={s.totalUsers}
              sub="Comptes enregistrés"
              accent="bg-zinc-700"
            />
            <StatCard
              label="Notifications non lues"
              value={s.unreadNotifications}
              sub="Pour l'utilisateur connecté"
              accent={s.unreadNotifications > 0 ? "bg-amber-400" : "bg-zinc-700"}
            />
          </>
        ) : null}
      </div>

      {/* Middle row — ring + transactions */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading && !s ? (
          <>
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </>
        ) : s ? (
          <>
            <UsageRing used={s.usedTimbres} total={s.totalTimbres} />
            <TransactionBar
              pending={s.pendingTransactions}
              accepted={s.acceptedTransactions}
              rejected={s.rejectedTransactions}
            />
          </>
        ) : null}
      </div>

      {/* Bottom row — total timbres detail */}
      {s && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <StatCard
            label="Total timbres"
            value={s.totalTimbres}
            accent="bg-zinc-700"
          />
          <StatCard
            label="Utilisés"
            value={s.usedTimbres}
            accent="bg-violet-500"
          />
          <StatCard
            label="Disponibles"
            value={s.unusedTimbres}
            accent="bg-emerald-500"
          />
        </div>
      )}

      {/* Footer */}
      <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-zinc-700">
        Timbre system · dashboard v1
      </p>
    </div>
  );
}
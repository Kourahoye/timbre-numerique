
export type ThemeName = "Timbre" | "Slate" | "desk";

const THEMES: { label: string; value: ThemeName }[] = [
  { label: "Timbre", value: "Timbre" },
  { label: "Slate",  value: "Slate"  },
  { label: "Desk",   value: "desk"   },
];

export default function ThemeSwitcher({ theme, setTheme }: { theme: ThemeName; setTheme: (t: ThemeName) => void }) {
  return (
    <div className="flex items-center gap-1 bg-base-300 rounded-btn p-0.5">
      {THEMES.map(t => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`btn btn-xs rounded-btn ${theme === t.value ? "btn-primary" : "btn-ghost"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
import { useTheme } from "../context/ThemeContext";

const OPTIONS = [
  { id: "bright", label: "Bright", icon: "☀️" },
  { id: "mixed", label: "Mixed", icon: "🌓" },
  { id: "dark", label: "Dark", icon: "🌙" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="Chat theme">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={theme === opt.id}
          title={opt.label}
          className={`theme-switcher-btn ${theme === opt.id ? "theme-switcher-btn-active" : ""}`}
          onClick={() => setTheme(opt.id)}
        >
          <span aria-hidden="true">{opt.icon}</span>
        </button>
      ))}
    </div>
  );
}

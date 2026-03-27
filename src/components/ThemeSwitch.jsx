import useStore from "../store";

const THEMES = [
  {
    id: "green",
    label: "Green",
    swatch: "#6B9B1C",
    bg: "#F4F7EE",
    title: "New palette",
  },
  {
    id: "copper",
    label: "Copper",
    swatch: "#C17F4E",
    bg: "#FAF7F2",
    title: "Original palette",
  },
];

export default function ThemeSwitch() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const active = THEMES.find((t) => t.id === theme) || THEMES[0];
  const next = THEMES.find((t) => t.id !== theme);

  return (
    <button
      className="theme-switch"
      onClick={() => setTheme(next.id)}
      title={`Switch to ${next.label} theme`}
      aria-label={`Switch to ${next.label} theme`}
    >
      <span className="theme-switch-track">
        <span
          className="theme-switch-thumb"
          style={{ background: active.swatch }}
        />
      </span>
      <span className="theme-switch-label">{active.label}</span>
    </button>
  );
}

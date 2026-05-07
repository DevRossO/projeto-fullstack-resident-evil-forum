import type { Screen } from "../App";

type NavigationItem = {
  label: string;
  target: Screen;
};

type SiteFooterProps = {
  navigationItems: NavigationItem[];
  onNavigate: (screen: Screen) => void;
};

export function SiteFooter({ navigationItems, onNavigate }: SiteFooterProps) {
  return (
    <footer className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.3)] lg:grid-cols-[1.1fr_1fr_0.9fr] lg:text-left">
      <div>
        <h3 className="text-2xl uppercase tracking-[0.22em] text-zinc-50">Resident Evil Forum</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          Comunidade feita por fãs da franquia Resident Evil, com uma base pronta para crescer por telas e módulos.
        </p>
      </div>

      <div className="grid gap-3 justify-items-center lg:justify-items-center lg:text-center">
        <span className="text-xs font-bold uppercase tracking-[0.28em] text-red-100">Links rápidos</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {navigationItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.target)}
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 justify-items-center text-sm text-zinc-300 lg:justify-items-end lg:text-right">
        <span>Desenvolvido por Felipe Rosso</span>
        <span>Projeto acadêmico - ADS</span>
        <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-end">
          <a className="transition hover:text-red-200" href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="transition hover:text-red-200" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
        <span>© 2026 Resident Evil Forum</span>
      </div>
    </footer>
  );
}
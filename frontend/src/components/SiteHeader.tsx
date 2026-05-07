import type { Screen } from "../App";
import type { AuthResponse } from "../types";
import { SearchBar } from "./SearchBar";

type NavigationItem = {
  label: string;
  target: Screen;
};

type SiteHeaderProps = {
  user: AuthResponse | null;
  onLogout: () => void;
  activeScreen: Screen;
  navigationItems: NavigationItem[];
  mobileMenuOpen: boolean;
  searchValue: string;
  onLogoClick: () => void;
  onNavigate: (screen: Screen) => void;
  onMobileMenuToggle: () => void;
  onSearchChange: (value: string) => void;
};

export function SiteHeader({
  user,
  onLogout,
  activeScreen,
  navigationItems,
  mobileMenuOpen,
  searchValue,
  onLogoClick,
  onNavigate,
  onMobileMenuToggle,
  onSearchChange,
}: SiteHeaderProps) {
  return (
    <>
      <button
        type="button"
        onClick={onLogoClick}
        className="mb-2 ml-2 text-left text-base font-black uppercase tracking-[0.24em] text-zinc-50 transition hover:text-red-400 md:hidden"
      >
        Resident Evil Forum
      </button>

      <header className="sticky top-3 z-20 rounded-[2rem] border border-white/10 bg-black/70 px-3 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl md:px-6 md:py-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 md:grid-cols-[minmax(0,1fr)_minmax(420px,560px)_minmax(0,1fr)] md:gap-5">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:border-red-400/50 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5 text-zinc-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
            <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onLogoClick}
          className="hidden text-left text-lg font-black uppercase tracking-[0.25em] text-zinc-50 transition hover:text-red-400 md:block md:justify-self-start md:text-xl"
        >
          Resident Evil Forum
        </button>

        <div className="min-w-0 md:justify-self-center md:px-0">
          <SearchBar
            value={searchValue}
            onValueChange={onSearchChange}
          />
        </div>

        {user ? (
          <div className="hidden items-center justify-end gap-4 md:flex md:justify-self-end">
            <p className="text-sm font-bold text-red-100">Olá, {user.nome}! 👋</p>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-100 transition hover:border-red-400/50 hover:bg-white/10 hover:text-red-200"
            >
              Sair
            </button>
          </div>
        ) : (
          <nav className="hidden items-center justify-end gap-2 md:flex md:justify-self-end">
            {navigationItems.map((item) => {
              const isActive = activeScreen === item.target;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onNavigate(item.target)}
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition",
                    isActive
                      ? "border-red-500/60 bg-red-500/15 text-red-100"
                      : "border-white/10 bg-white/5 text-zinc-100 hover:border-red-400/50 hover:bg-white/10 hover:text-red-200",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
        </div>

        <nav className={mobileMenuOpen ? "mt-4 flex flex-col gap-2 md:hidden" : "hidden"}>
          {user ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-bold text-red-100">Olá, {user.nome}! 👋</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.22em] text-zinc-100 transition hover:border-red-400/50 hover:bg-white/10 hover:text-red-200"
              >
                Sair
              </button>
            </>
          ) : (
            navigationItems.map((item) => {
              const isActive = activeScreen === item.target;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onNavigate(item.target)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.22em] transition",
                    isActive
                      ? "border-red-500/60 bg-red-500/15 text-red-100"
                      : "border-white/10 bg-white/5 text-zinc-100 hover:border-red-400/50 hover:bg-white/10 hover:text-red-200",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })
          )}
        </nav>
      </header>
    </>
  );
}
type SearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function SearchBar({ value, onValueChange }: SearchBarProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl md:max-w-[560px]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-red-200">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.8-3.8" strokeLinecap="round" />
        </svg>
      </span>

      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder=""
        aria-label="Pesquisar jogos"
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase tracking-[0.16em] text-zinc-50 placeholder:text-transparent focus:outline-none"
      />
    </div>
  );
}
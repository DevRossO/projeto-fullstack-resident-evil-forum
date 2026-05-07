import { useMemo } from "react";

type MetricItem = {
  id: string;
  title: string;
  value: number;
};

type AdminDashboardProps = {
  clickMetrics: MetricItem[];
  commentMetrics: MetricItem[];
  isLoading?: boolean;
};

type DonutMetricPanelProps = {
  title: string;
  subtitle: string;
  emptyMessage: string;
  colors: string[];
  items: MetricItem[];
};

type Slice = {
  id: string;
  title: string;
  value: number;
  percent: number;
  color: string;
};

function buildSlices(items: MetricItem[], colors: string[]): Slice[] {
  const total = items.reduce((acc, item) => acc + item.value, 0);

  return items.map((item, index) => ({
    id: item.id,
    title: item.title,
    value: item.value,
    percent: total > 0 ? (item.value / total) * 100 : 0,
    color: colors[index % colors.length],
  }));
}

function buildConicGradient(slices: Slice[]) {
  const totalPercent = slices.reduce((acc, slice) => acc + slice.percent, 0);
  if (totalPercent <= 0) {
    return "conic-gradient(rgba(255,255,255,0.08) 0% 100%)";
  }

  let start = 0;
  const parts = slices.map((slice) => {
    const end = start + slice.percent;
    const segment = `${slice.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${parts.join(",")})`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function DonutMetricPanel({
  title,
  subtitle,
  emptyMessage,
  colors,
  items,
}: DonutMetricPanelProps) {
  const sortedItems = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const slices = useMemo(() => buildSlices(sortedItems, colors), [sortedItems, colors]);
  const conicGradient = useMemo(() => buildConicGradient(slices), [slices]);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-zinc-100">{title}</p>
        <p className="mt-2 text-sm text-zinc-300/80">{subtitle}</p>
      </div>

      {sortedItems.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-zinc-950/35 px-4 py-4 text-sm text-zinc-300">{emptyMessage}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="mx-auto flex w-full max-w-[220px] flex-col items-center">
            <div
              className="h-48 w-48 rounded-full border border-white/15"
              style={{ background: conicGradient }}
            />
          </div>

          <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
            {slices.map((slice) => (
              <div key={slice.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950/35 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                  <p className="truncate text-xs font-semibold text-zinc-200">{slice.title}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.1em] text-zinc-300">{formatPercent(slice.percent)}</p>
                  <p className="text-[0.65rem] font-semibold text-zinc-400">{slice.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function AdminDashboard({ clickMetrics, commentMetrics, isLoading = false }: AdminDashboardProps) {
  const clickColors = ["#4ec8a8", "#f06f78", "#f1d770", "#6bb9f0", "#8d6ad4", "#2f2f35", "#9fd970"];
  const commentColors = ["#ef5f8f", "#b8d067", "#7dc4e8", "#b886b0", "#8d6ad4", "#2f2f35", "#4ec8a8"];

  return (
    <section className="rounded-[2rem] border border-cyan-400/20 bg-[linear-gradient(145deg,rgba(10,22,34,0.82),rgba(8,12,18,0.94))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-cyan-100">
            Dashboard Admin
          </span>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-zinc-100">Topicos com mais cliques e comentarios</h2>
        </div>
        {isLoading ? <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Atualizando...</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DonutMetricPanel
          title="TOPICOS COM MAIS CLIQUES"
          subtitle="Cards cadastrados e distribuicao de cliques."
          emptyMessage="Nenhum card cadastrado para exibir cliques."
          colors={clickColors}
          items={clickMetrics}
        />

        <DonutMetricPanel
          title="TOPICOS COM MAIS COMENTARIOS"
          subtitle="Cards cadastrados e distribuicao de comentarios."
          emptyMessage="Nenhum card cadastrado para exibir comentarios."
          colors={commentColors}
          items={commentMetrics}
        />
      </div>
    </section>
  );
}

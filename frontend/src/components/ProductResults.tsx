import type { AgentResponse, Product } from "@/lib/types";

interface Props {
  response: AgentResponse | null;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950/90 transition duration-200 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-orange-950/20">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      )}

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {product.category && (
              <span className="inline-flex rounded-full border border-amber-400/15 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-100">
                {product.category}
              </span>
            )}
            <h3 className="text-base font-semibold leading-snug text-white">{product.name}</h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${
              product.inStock
                ? "border border-lime-400/20 bg-lime-400/10 text-lime-200"
                : "border border-red-400/20 bg-red-400/10 text-red-200"
            }`}
          >
            {product.inStock ? "In stock" : "Unavailable"}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-5 text-slate-300">{product.description}</p>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
            <p className="mt-1 text-lg font-semibold text-amber-300">
              {product.currency} {product.price.toLocaleString()}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            #{product.id}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function ProductResults({ response }: Props) {
  const products = response?.products ?? [];
  const inStockCount = products.filter((product) => product.inStock).length;

  return (
    <section className="flex h-full min-h-0 w-full flex-col rounded-[24px] border border-white/10 bg-black/35 p-4 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/70">Catalog matches</p>
          <h2 className="text-xl font-semibold text-white">
            {response ? `${products.length} product${products.length !== 1 ? "s" : ""} matched` : "Results will appear here"}
          </h2>
          <p className="max-w-3xl text-sm leading-5 text-slate-300">
            {response?.message || "Run a voice search to see matched products and the agent summary in this panel."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-fit">
          <MetricCard label="Matches" value={String(products.length)} />
          <MetricCard label="Available now" value={String(inStockCount)} />
        </div>
      </div>

      {!response ? (
        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-950/70 px-6 py-10 text-center text-sm text-slate-400">
          Record a request to populate this results view.
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-white/10 bg-zinc-950/70 px-6 py-10 text-center text-sm text-slate-400">
          No products found. Try a more specific request, a different budget, or another category.
        </div>
      ) : (
        <div className="mt-4 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-amber-100">{value}</p>
    </div>
  );
}

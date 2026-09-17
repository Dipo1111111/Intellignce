export function PageLoading({ label }: { label: string }) {
  return (
    <div className="card p-6 md:p-10" aria-busy="true" aria-label={`Loading ${label}`}>
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-ink/10" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 space-y-3">
        <div className="h-24 animate-pulse rounded-xl bg-ink/[0.07]" />
        <div className="h-24 animate-pulse rounded-xl bg-ink/[0.07]" />
      </div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.28em] text-raspberry-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-lg leading-8 text-ink/65">{body}</p> : null}
    </div>
  );
}

type Props = {
  name: string;
  value: unknown;
};

export function SignalBadge({ name, value }: Props) {
  return (
    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
      <p className="text-xs text-cyan-300">{name}</p>
      <p className="text-sm text-white">{String(value)}</p>
    </div>
  );
}
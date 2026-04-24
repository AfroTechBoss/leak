export default function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3,
          background: i < step ? 'var(--accent)' : 'var(--border-strong)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

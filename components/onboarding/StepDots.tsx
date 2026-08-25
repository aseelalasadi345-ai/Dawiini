export default function StepDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            'h-1.5 rounded-full transition-all ' +
            (n === step
              ? 'w-9 bg-brand-blue'
              : n < step
                ? 'w-1.5 bg-brand-teal'
                : 'w-1.5 bg-slate-200')
          }
        />
      ))}
    </div>
  );
}

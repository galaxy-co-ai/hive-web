import { ReactNode } from "react";

interface DocSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function DocSection({ id, title, subtitle, children }: DocSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-sm text-gray-400 max-w-prose">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

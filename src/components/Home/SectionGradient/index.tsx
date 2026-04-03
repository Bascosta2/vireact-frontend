interface SectionGradientProps {
  children: React.ReactNode;
  top: string;
  bottom: string;
  className?: string;
}

function SectionGradient({ children, top, bottom, className = '' }: SectionGradientProps) {
  return (
    <section
      className={className}
      style={{
        background: `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`,
      }}
    >
      {children}
    </section>
  );
}

export default SectionGradient;

type SectionTitleProps = {
  number: string;
  children: string;
  className?: string;
};

export function SectionTitle({ number, children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`section__title reveal ${className}`.trim()}>
      <span className="section__number">{number}</span>
      <span className="section__title-text">{children}</span>
    </h2>
  );
}

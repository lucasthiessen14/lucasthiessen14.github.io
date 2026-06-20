import { ViewMenu } from './ViewMenu';

type AlternateViewHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function AlternateViewHeader({ title, subtitle, className }: AlternateViewHeaderProps) {
  return (
    <header className={['alt-view-header', className].filter(Boolean).join(' ')}>
      <div className="alt-view-header__inner">
        <div className="alt-view-header__brand">
          <span className="alt-view-header__title">{title}</span>
          {subtitle && <span className="alt-view-header__subtitle">{subtitle}</span>}
        </div>
        <ViewMenu variant="nav" />
      </div>
    </header>
  );
}

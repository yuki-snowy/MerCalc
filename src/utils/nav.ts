export type AppNavLink = {
  href: string;
  label: string;
  shortLabel: string;
};

export const APP_NAV_LINKS: AppNavLink[] = [
  { href: '/dashboard', label: 'ダッシュボード', shortLabel: 'ダッシュ' },
  { href: '/assets', label: '資産一覧', shortLabel: '一覧' },
  { href: '/assets/new', label: '新規登録', shortLabel: '登録' },
];

export function isAppNavActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/assets') {
    return (
      pathname === '/assets' ||
      (pathname.startsWith('/assets/') && pathname !== '/assets/new')
    );
  }
  return pathname === href;
}

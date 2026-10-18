export interface NavItem {
  to: string;
  label: string;
  permission: string;
}

/** Sidebar destinations, each gated by a permission. Unpermitted items are hidden. */
export const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', permission: 'ops_dashboard.ops_dashboard.view' },
  { to: '/kyc', label: 'KYC queue', permission: 'ops_kyc.kyc_case.view' },
];

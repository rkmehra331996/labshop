/**
 * Central Domain Configuration for INDIANLALAJI.COM Healthcare Platform
 */

export const SUPER_ADMIN_DOMAIN = 'indianlalaji.com';
export const SUPER_ADMIN_NAME = 'INDIANLALAJI.COM';
export const SUPER_ADMIN_EMAIL = 'admin@indianlalaji.com';
export const SUPPORT_PHONE = '7087033009';
export const SUPPORT_PHONE_FORMATTED = '+91 7087033009';

/**
 * Returns formatted website/app URL for a tenant or platform service
 */
export function getTenantWebsiteUrl(subdomainOrDomain: string): string {
  if (subdomainOrDomain.includes('.')) {
    return `https://${subdomainOrDomain}`;
  }
  return `https://${subdomainOrDomain}.${SUPER_ADMIN_DOMAIN}`;
}

export function getSuperAdminDashboardUrl(): string {
  return `https://${SUPER_ADMIN_DOMAIN}/admin`;
}

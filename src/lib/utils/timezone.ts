/**
 * Format timezone string for display
 * @param timezone - IANA timezone string (e.g., "Australia/Sydney")
 * @returns Formatted timezone string (e.g., "AEST" or "AEDT")
 */
export function getTimezoneDisplay(timezone: string): string {
  if (!timezone) return '';
  
  // Common timezone abbreviations mapping
  const timezoneMap: Record<string, string> = {
    'Australia/Sydney': 'AEST/AEDT',
    'Australia/Melbourne': 'AEST/AEDT',
    'Australia/Brisbane': 'AEST',
    'Australia/Adelaide': 'ACST/ACDT',
    'Australia/Perth': 'AWST',
    'Australia/Darwin': 'ACST',
    'Australia/Hobart': 'AEST/AEDT',
    'America/Sao_Paulo': 'BRT/BRST',
    'America/New_York': 'EST/EDT',
    'America/Chicago': 'CST/CDT',
    'America/Denver': 'MST/MDT',
    'America/Los_Angeles': 'PST/PDT',
    'Europe/London': 'GMT/BST',
    'Europe/Paris': 'CET/CEST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
  };
  
  // Return mapped abbreviation or the original timezone string
  return timezoneMap[timezone] || timezone;
}

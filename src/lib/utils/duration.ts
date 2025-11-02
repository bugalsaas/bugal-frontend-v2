/**
 * Convert duration in minutes to a human-readable display format
 * @param duration - Duration in minutes
 * @returns Formatted string like "1h 30m" or "45m"
 */
export function getDurationDisplay(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

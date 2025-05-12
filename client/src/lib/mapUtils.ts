// Map related utility functions

/**
 * Calculates the distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates the estimated time of arrival based on distance and speed
 */
export function calculateETA(
  distanceInKm: number,
  speedInKmPerHour: number
): number {
  // Return ETA in minutes
  if (speedInKmPerHour === 0) return 0;
  return (distanceInKm / speedInKmPerHour) * 60;
}

/**
 * Formats the ETA as a string
 */
export function formatETA(etaInMinutes: number): string {
  if (etaInMinutes < 1) {
    return 'Arriving now';
  } else if (etaInMinutes < 60) {
    return `${Math.round(etaInMinutes)} mins`;
  } else {
    const hours = Math.floor(etaInMinutes / 60);
    const mins = Math.round(etaInMinutes % 60);
    return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
  }
}

/**
 * Gets a user-friendly description of the bus status
 */
export function getBusStatusText(
  status: string,
  etaInMinutes: number | null
): string {
  switch (status) {
    case 'active':
      if (etaInMinutes !== null) {
        if (etaInMinutes < 1) {
          return 'Arriving now';
        } else {
          return `Arriving in ${formatETA(etaInMinutes)}`;
        }
      }
      return 'On route';
    case 'delayed':
      return 'Delayed';
    case 'maintenance':
      return 'In maintenance';
    case 'inactive':
      return 'Not in service';
    default:
      return status;
  }
}

/**
 * Gets the color class for a bus status
 */
export function getBusStatusColorClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-success text-white';
    case 'delayed':
      return 'bg-warning text-white';
    case 'maintenance':
    case 'inactive':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-primary text-white';
  }
}

/**
 * Creates a static map URL (fallback if Mapbox not available)
 */
export function createStaticMapUrl(
  latitude: string,
  longitude: string,
  zoom: number = 14,
  width: number = 600,
  height: number = 400
): string {
  // Using OpenStreetMap as a free alternative
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=${latitude},${longitude},red`;
}

/**
 * Formats a time string (HH:MM:SS) to a more user-friendly format
 */
export function formatTimeString(timeString: string): string {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
}

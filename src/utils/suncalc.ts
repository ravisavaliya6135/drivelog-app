import { getTimes, getSunrise, getSunset } from 'suncalc';
import type { StateInfo } from '../types';

// State capital coordinates for sunrise/sunset calculations
export const STATE_CAPITALS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.3668, lng: -86.2999 },
  AK: { lat: 58.3019, lng: -134.4197 },
  AZ: { lat: 33.4484, lng: -112.0740 },
  AR: { lat: 34.7465, lng: -92.2896 },
  CA: { lat: 38.5816, lng: -121.4944 },
  CO: { lat: 39.7392, lng: -104.9903 },
  CT: { lat: 41.7658, lng: -72.6734 },
  DE: { lat: 39.1582, lng: -75.5244 },
  FL: { lat: 30.4383, lng: -84.2807 },
  GA: { lat: 33.7490, lng: -84.3880 },
  HI: { lat: 21.3099, lng: -157.8581 },
  ID: { lat: 43.6150, lng: -116.2023 },
  IL: { lat: 39.7817, lng: -89.6501 },
  IN: { lat: 39.7684, lng: -86.1581 },
  IA: { lat: 41.5868, lng: -93.6250 },
  KS: { lat: 39.0473, lng: -95.6752 },
  KY: { lat: 38.1986, lng: -84.8747 },
  LA: { lat: 30.4515, lng: -91.1871 },
  ME: { lat: 44.3106, lng: -69.7795 },
  MD: { lat: 38.9785, lng: -76.4922 },
  MA: { lat: 42.3601, lng: -71.0589 },
  MI: { lat: 42.7325, lng: -84.5555 },
  MN: { lat: 44.9537, lng: -93.0900 },
  MS: { lat: 32.2988, lng: -90.1848 },
  MO: { lat: 38.5767, lng: -92.1735 },
  MT: { lat: 46.5898, lng: -112.0391 },
  NE: { lat: 40.8136, lng: -96.7026 },
  NV: { lat: 39.1638, lng: -119.7674 },
  NH: { lat: 43.2067, lng: -71.5373 },
  NJ: { lat: 40.2206, lng: -74.7699 },
  NM: { lat: 35.6870, lng: -105.9378 },
  NY: { lat: 42.6526, lng: -73.7562 },
  NC: { lat: 35.7796, lng: -78.6382 },
  ND: { lat: 46.8083, lng: -100.7837 },
  OH: { lat: 39.9612, lng: -82.9988 },
  OK: { lat: 35.4676, lng: -97.5164 },
  OR: { lat: 44.9429, lng: -123.0351 },
  PA: { lat: 40.2732, lng: -76.8867 },
  RI: { lat: 41.8240, lng: -71.4128 },
  SC: { lat: 34.0007, lng: -81.0348 },
  SD: { lat: 44.3683, lng: -100.3510 },
  TN: { lat: 36.1627, lng: -86.7816 },
  TX: { lat: 30.2672, lng: -97.7431 },
  UT: { lat: 40.7608, lng: -111.8910 },
  VT: { lat: 44.2601, lng: -72.5806 },
  VA: { lat: 37.5407, lng: -77.4360 },
  WA: { lat: 47.6062, lng: -122.3321 },
  WV: { lat: 38.3498, lng: -81.6326 },
  WI: { lat: 43.0731, lng: -89.4012 },
  WY: { lat: 41.1400, lng: -104.8202 },
};

export interface NightCalculationResult {
  isNight: boolean;
  sunsetTime: Date;
  legalNightStart: Date; // 30 minutes after sunset
}

/**
 * Calculate if a given datetime is considered "night" for a specific state
 * Legal night = 30 minutes after sunset (standard DMV definition)
 */
export function calculateNightStatus(
  dateTime: Date,
  stateCode: string
): NightCalculationResult {
  const capital = STATE_CAPITALS[stateCode] || STATE_CAPITALS.CA;
  const { lat, lng } = capital;

  // Get sunset time for the date
  const times = getTimes(dateTime, lat, lng);
  const sunset = times.sunset;
  const legalNightStart = new Date(sunset.getTime() + 30 * 60 * 1000); // 30 minutes after sunset

  return {
    isNight: dateTime >= legalNightStart,
    sunsetTime: sunset,
    legalNightStart,
  };
}

/**
 * Get sunset time for a specific date and state
 */
export function getSunsetForDate(date: Date, stateCode: string): Date {
  const capital = STATE_CAPITALS[stateCode] || STATE_CAPITALS.CA;
  const { lat, lng } = capital;
  const times = getTimes(date, lat, lng);
  return times.sunset;
}

/**
 * Get sunrise time for a specific date and state
 */
export function getSunriseForDate(date: Date, stateCode: string): Date {
  const capital = STATE_CAPITALS[stateCode] || STATE_CAPITALS.CA;
  const { lat, lng } = capital;
  const times = getTimes(date, lat, lng);
  return times.sunrise;
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get state info for requirements
 */
export function getStateRequirements(stateCode: string): StateInfo | undefined {
  // This will be imported from types
  return undefined; // Placeholder - imported from types
}

/**
 * Calculate day/night minutes for a drive that spans both periods
 */
export function calculateDayNightMinutes(
  startTime: Date,
  endTime: Date,
  stateCode: string
): { dayMinutes: number; nightMinutes: number } {
  const capital = STATE_CAPITALS[stateCode] || STATE_CAPITALS.CA;
  const { lat, lng } = capital;

  const startDate = new Date(startTime);
  startDate.setHours(0, 0, 0, 0);

  const times = getTimes(startDate, lat, lng);
  const sunset = times.sunset;
  const legalNightStart = new Date(sunset.getTime() + 30 * 60 * 1000);

  let dayMinutes = 0;
  let nightMinutes = 0;

  const current = new Date(startTime);
  const end = new Date(endTime);

  while (current < end) {
    const nextMinute = new Date(current.getTime() + 60 * 1000);
    if (current >= legalNightStart) {
      nightMinutes++;
    } else {
      dayMinutes++;
    }
    current.setTime(nextMinute.getTime());
  }

  return { dayMinutes, nightMinutes };
}
import type { CityCoord, SolarAnchor, SolarTimes } from './types';

export const OFFLINE_CITIES: CityCoord[] = [
  { id: 'rome', name: 'Rome / Vatican City', country: 'Italy', lat: 41.9022, lon: 12.4539, tzOffsetMinutes: 60 },
  { id: 'jerusalem', name: 'Jerusalem', country: 'Holy Land', lat: 31.7767, lon: 35.2345, tzOffsetMinutes: 120 },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5072, lon: -0.1276, tzOffsetMinutes: 0 },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, tzOffsetMinutes: 60 },
  { id: 'chartres', name: 'Chartres', country: 'France', lat: 48.4439, lon: 1.489, tzOffsetMinutes: 60 },
  { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, tzOffsetMinutes: 60 },
  { id: 'vienna', name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, tzOffsetMinutes: 60 },
  { id: 'munich', name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.582, tzOffsetMinutes: 60 },
  { id: 'warsaw', name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, tzOffsetMinutes: 60 },
  { id: 'dublin', name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603, tzOffsetMinutes: 0 },
  { id: 'lisbon', name: 'Lisbon / Fátima', country: 'Portugal', lat: 39.622, lon: -8.6524, tzOffsetMinutes: 0 },
  { id: 'new_york', name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006, tzOffsetMinutes: -300 },
  { id: 'washington', name: 'Washington, D.C.', country: 'USA', lat: 38.9072, lon: -77.0369, tzOffsetMinutes: -300 },
  { id: 'chicago', name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, tzOffsetMinutes: -360 },
  { id: 'los_angeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, tzOffsetMinutes: -480 },
  { id: 'toronto', name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, tzOffsetMinutes: -300 },
  { id: 'mexico_city', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, tzOffsetMinutes: -360 },
  { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, tzOffsetMinutes: -180 },
  { id: 'sao_paulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, tzOffsetMinutes: -180 },
  { id: 'tehran', name: 'Tehran', country: 'Iran', lat: 35.6892, lon: 51.389, tzOffsetMinutes: 210 },
  { id: 'isfahan', name: 'Isfahan', country: 'Iran', lat: 32.6539, lon: 51.666, tzOffsetMinutes: 210 },
  { id: 'shiraz', name: 'Shiraz', country: 'Iran', lat: 29.5918, lon: 52.5837, tzOffsetMinutes: 210 },
  { id: 'beirut', name: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018, tzOffsetMinutes: 120 },
  { id: 'manila', name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, tzOffsetMinutes: 480 },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978, tzOffsetMinutes: 540 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tzOffsetMinutes: 540 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tzOffsetMinutes: 600 },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, tzOffsetMinutes: 600 },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, tzOffsetMinutes: 180 },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, tzOffsetMinutes: 120 },
];

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000);
}

function clampMinutes(mins: number): number {
  const m = Math.round(mins);
  return ((m % 1440) + 1440) % 1440;
}

/**
 * Pure offline NOAA Solar Calculation algorithm.
 * Computes local sunrise, sunset, solar noon, civil dawn/dusk, and Roman temporal hours (Terce/None).
 * Works completely offline from latitude, longitude, and timezone offset.
 */
function calculateSunEventUTCMinutes(
  year: number,
  month: number,
  day: number,
  lat: number,
  lon: number,
  zenithDegrees: number,
  isSunrise: boolean
): number {
  const n = dayOfYear(year, month, day);
  const lngHour = lon / 15;
  const t = isSunrise ? n + (6 - lngHour) / 24 : n + (18 - lngHour) / 24;

  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * DEG2RAD) + 0.02 * Math.sin(2 * M * DEG2RAD) + 282.634;
  L = ((L % 360) + 360) % 360;

  let RA = RAD2DEG * Math.atan(0.91764 * Math.tan(L * DEG2RAD));
  RA = ((RA % 360) + 360) % 360;

  const lQuadrant = Math.floor(L / 90) * 90;
  const raQuadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (lQuadrant - raQuadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(L * DEG2RAD);
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(zenithDegrees * DEG2RAD) - sinDec * Math.sin(lat * DEG2RAD)) /
    (cosDec * Math.cos(lat * DEG2RAD));

  // Polar day/night fallback
  if (cosH > 1) return isSunrise ? 360 : 1080;
  if (cosH < -1) return isSunrise ? 240 : 1200;

  const H = isSunrise ? 360 - RAD2DEG * Math.acos(cosH) : RAD2DEG * Math.acos(cosH);
  const HHours = H / 15;

  const T = HHours + RA - 0.06571 * t - 6.622;
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  return UT * 60;
}

export function calculateSolarTimes(
  date: Date,
  lat: number,
  lon: number,
  tzOffsetMinutes: number
): SolarTimes {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const sunriseUTC = calculateSunEventUTCMinutes(year, month, day, lat, lon, 90.833, true);
  const sunsetUTC = calculateSunEventUTCMinutes(year, month, day, lat, lon, 90.833, false);
  const civilDawnUTC = calculateSunEventUTCMinutes(year, month, day, lat, lon, 96, true);
  const civilDuskUTC = calculateSunEventUTCMinutes(year, month, day, lat, lon, 96, false);

  const sunriseMinutes = clampMinutes(sunriseUTC + tzOffsetMinutes);
  const sunsetMinutes = clampMinutes(sunsetUTC + tzOffsetMinutes);
  const civilDawnMinutes = clampMinutes(civilDawnUTC + tzOffsetMinutes);
  const civilDuskMinutes = clampMinutes(civilDuskUTC + tzOffsetMinutes);

  // Handle day length properly even if sunset wraps past midnight in extreme edge cases
  const daylightDuration =
    sunsetMinutes >= sunriseMinutes
      ? sunsetMinutes - sunriseMinutes
      : 1440 - sunriseMinutes + sunsetMinutes;

  const solarNoonMinutes = clampMinutes(sunriseMinutes + daylightDuration / 2);
  // Roman Terce = 3rd hour of daylight (quarter of daylight after sunrise)
  const romanTerceMinutes = clampMinutes(sunriseMinutes + daylightDuration * 0.25);
  // Roman None = 9th hour of daylight (three-quarters of daylight after sunrise)
  const romanNoneMinutes = clampMinutes(sunriseMinutes + daylightDuration * 0.75);

  return {
    civilDawnMinutes,
    sunriseMinutes,
    romanTerceMinutes,
    solarNoonMinutes,
    romanNoneMinutes,
    sunsetMinutes,
    civilDuskMinutes,
  };
}

export function getSolarAnchorMinutes(solar: SolarTimes, anchor: SolarAnchor): number {
  switch (anchor) {
    case 'civil_dawn':
      return solar.civilDawnMinutes;
    case 'sunrise':
      return solar.sunriseMinutes;
    case 'roman_terce':
      return solar.romanTerceMinutes;
    case 'solar_noon':
      return solar.solarNoonMinutes;
    case 'roman_none':
      return solar.romanNoneMinutes;
    case 'sunset':
      return solar.sunsetMinutes;
    case 'civil_dusk':
      return solar.civilDuskMinutes;
    default:
      return solar.sunriseMinutes;
  }
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  const m = clampMinutes(totalMinutes);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function parseHHMMToMinutes(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number.parseInt(hStr ?? '0', 10);
  const m = Number.parseInt(mStr ?? '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return clampMinutes(h * 60 + m);
}

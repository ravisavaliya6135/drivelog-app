declare module 'suncalc' {
  export interface SunTimes {
    solarNoon: Date;
    nadir: Date;
    sunrise: Date;
    sunset: Date;
    sunriseEnd: Date;
    sunsetStart: Date;
    dawn: Date;
    dusk: Date;
    goldenHourEnd: Date;
    goldenHour: Date;
    nightStart: Date;
    nightEnd: Date;
  }

  export function getTimes(date: Date, lat: number, lng: number): SunTimes;
  export function getSunrise(date: Date, lat: number, lng: number): Date;
  export function getSunset(date: Date, lat: number, lng: number): Date;
  /** Sun altitude above the horizon in radians (0 = horizon, negative = below) */
  export function getAltitude(date: Date, lat: number, lng: number): number;
  export function getPosition(date: Date, lat: number, lng: number): {
    azimuth: number;
    altitude: number;
  };
}

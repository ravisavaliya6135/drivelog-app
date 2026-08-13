import { useState, useEffect, useCallback } from 'react';
import { getTimes, calculateNightStatus, formatTime, formatDate, STATE_CAPITALS } from '../utils/suncalc';

export function useNightDetection(stateCode: string = 'CA') {
  const [sunsetTime, setSunsetTime] = useState<Date | null>(null);
  const [legalNightStart, setLegalNightStart] = useState<Date | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualOverride, setManualOverride] = useState<'day' | 'night' | null>(null); // Manual fallback when GPS/location denied

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate night status for current time and state
  useEffect(() => {
    const result = calculateNightStatus(currentTime, stateCode);
    setIsNight(manualOverride ? manualOverride === 'night' : result.isNight);
    setSunsetTime(result.sunsetTime);
    setLegalNightStart(result.legalNightStart);
  }, [currentTime, stateCode, manualOverride]);

  // Get night status for a specific datetime
  const getNightStatus = useCallback((dateTime: Date, useAuto: boolean = true) => {
    if (!useAuto && manualOverride) {
      return { isNight: manualOverride === 'night', sunsetTime: sunsetTime, legalNightStart: legalNightStart };
    }
    return calculateNightStatus(dateTime, stateCode);
  }, [stateCode, manualOverride, sunsetTime, legalNightStart]);

  // Get sunset for a specific date
  const getSunset = useCallback((date: Date) => {
    const capital = STATE_CAPITALS[stateCode] || STATE_CAPITALS.CA;
    const times = getTimes(date, capital.lat, capital.lng);
    return times.sunset;
  }, [stateCode]);

  // Get sunrise for a specific date
  const getSunrise = useCallback((date: Date) => {
    const capital = STATE_CAPITALS[stateCode] || STATE_CAPITALS.CA;
    const times = getTimes(date, capital.lat, capital.lng);
    return times.sunrise;
  }, [stateCode]);

  // Format time for display
  const getFormattedTime = useCallback((date: Date) => formatTime(date), []);
  const getFormattedDate = useCallback((date: Date) => formatDate(date), []);

  // Manual override functions for when GPS/location is denied
  const setManualDayNight = useCallback((mode: 'day' | 'night' | 'auto') => {
    setManualOverride(mode === 'auto' ? null : mode);
  }, []);

  return {
    isNight,
    sunsetTime,
    legalNightStart,
    currentTime,
    getNightStatus,
    getSunset,
    getSunrise,
    getFormattedTime,
    getFormattedDate,
    manualOverride,
    setManualDayNight,
  };
}
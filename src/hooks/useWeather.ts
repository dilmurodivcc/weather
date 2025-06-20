import { useState, useEffect } from 'react';
import { api, WeatherData } from '../service/API';

interface UseWeatherParams {
  city: string;
  lang?: string;
  units?: string;
}

export function useWeather({ city, lang = 'en', units = 'metric' }: UseWeatherParams) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('', { params: { q: city, lang, units } })
      .then(res => setWeather(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [city, lang, units]);

  return { weather, loading, error };
} 
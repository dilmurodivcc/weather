import axios from 'axios';

export interface WeatherData {
  name: string;
  weather: { description: string }[];
  main: { temp: number };
}

const API_URL = import.meta.env.VITE_WEATHER_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  params: {
    appid: import.meta.env.VITE_WEATHER_API_KEY,
    units: 'metric',
    lang: 'en',
  },
});

export const fetchWeather = async (
  { city, lang = 'en', units = 'metric' }: { city: string; lang?: string; units?: string }
): Promise<WeatherData> => {
  const url = `${API_URL}?q=${city}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=${units}&lang=${lang}`;
  const response = await axios.get(url);
  return response.data;
}; 
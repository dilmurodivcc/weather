import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useMemo } from "react";
import { fetchWeather } from "../service/API";
import type { WeatherData } from "../service/API";
import { useLanguageStore } from "../store/languageStore";
import axios from "axios";

const languages = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "tr", label: "Türkçe" },
  { code: "uz", label: "O‘zbek" },
];

const Home = () => {
  const { i18n, t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const lang = useLanguageStore((state) => state.lang);
  const setLang = useLanguageStore((state) => state.setLang);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setLang(lang);
  };

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdown = () => setOpen((o) => !o);
  const handleSelect = (code: string) => {
    changeLang(code);
    setOpen(false);
  };

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tashkent");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const weatherTheme = useMemo(() => {
    if (!weather) return "sunny";
    if (weather.clouds.all > 50 || weather.main.temp < 10) {
      return "cloudy";
    }
    return "sunny";
  }, [weather]);

  const handleSearch = () => {
    if (search.trim()) {
      setSelectedCity(search.trim());
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    const timeout = setTimeout(() => {
      axios
        .get("https://api.openweathermap.org/geo/1.0/direct", {
          params: {
            q: search,
            limit: 5,
            appid: import.meta.env.VITE_WEATHER_API_KEY,
          },
        })
        .then((res) => setSuggestions(res.data));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchWeather({ city: selectedCity, lang })
      .then(setWeather)
      .catch(console.error);
  }, [selectedCity, lang]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFormattedDate = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} - ${dayName}, ${
      day < 10 ? "0" + day : day
    } ${month} '${year}`;
  };

  return (
    <>
      <main className={`home ${weatherTheme}`}>
        <div className="overlay"></div>
        <div className="content">
          <div className="actions">
            <div className="lang-dropdown-wrapper">
              <div
                className={`lang-dropdown ${open ? "open" : ""}`}
                onClick={handleDropdown}
                ref={dropdownRef}
              >
                <div className="lang-selected">
                  {languages.find((l) => l.code === lang)?.label || "Language"}
                </div>
                <div className="lang-arrow" />
                <div className="lang-options">
                  {languages.map((l) => (
                    <div
                      key={l.code}
                      className={`lang-option${
                        l.code === lang ? " selected" : ""
                      }`}
                      onClick={() => handleSelect(l.code)}
                    >
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="reload">
              <i className="fa-solid fa-arrow-rotate-right"></i>
            </button>
          </div>

          {weather && (
            <div className="main-info">
              <p className="temp">
                {weather.main.temp.toFixed(0)} <span>°</span>
              </p>
              <div className="right">
                <h2>{weather.name}</h2>
                <span className="date-time">{getFormattedDate()}</span>
                <p>{weather.weather[0].description}</p>
              </div>
            </div>
          )}

          <div className="sidebar">
            <div
              className="search-bar"
              ref={searchBarRef}
              style={{ position: "relative" }}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("another_location")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                onFocus={() => {
                  if (search) setShowSuggestions(true);
                }}
              />
              <button className="search-btn" onClick={handleSearch}>
                <svg width="32" height="32" fill="none">
                  <circle cx="14" cy="14" r="9" stroke="#fff" strokeWidth="2" />
                  <path
                    d="M21 21L28 28"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {showSuggestions && (
                <div className={"suggestion-list show"}>
                  {suggestions.length === 0 ? (
                    <div className="suggestion-item" style={{ color: "#fff" }}>
                      {t("not_found")}
                    </div>
                  ) : (
                    suggestions.map((s) => (
                      <div
                        key={s.lat + "-" + s.lon}
                        className="suggestion-item"
                        onClick={() => {
                          setSelectedCity(s.name);
                          setSearch("");
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                      >
                        {s.name}
                        {s.state ? ", " + s.state : ""}, {s.country}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="sidebar-content">
              <div className="city-list">
                {(t("cities", { returnObjects: true }) as string[]).map(
                  (city) => (
                    <div
                      key={city}
                      className={`city-item${
                        city === selectedCity ? " selected" : ""
                      }`}
                      onClick={() => setSelectedCity(city)}
                    >
                      {city}
                    </div>
                  )
                )}
              </div>
              <div className="weather-detail">
                <h2>{t("weather_detail")}</h2>
                <div className="detail-row">
                  <span>{t("cloudy")}</span>
                  <span>{weather?.clouds?.all ?? 0}%</span>
                </div>
                <div className="detail-row">
                  <span>{t("humidity")}</span>
                  <span>{weather?.main?.humidity ?? 0}%</span>
                </div>
                <div className="detail-row">
                  <span>{t("wind")}</span>
                  <span>{weather?.wind?.speed ?? 0} km/h</span>
                </div>
                <div className="detail-row">
                  <span>{t("pressure")}</span>
                  <span>{weather?.main?.pressure ?? 0} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

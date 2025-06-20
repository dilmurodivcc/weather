import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { fetchWeather } from "../service/API";
import type { WeatherData } from "../service/API";
import { useLanguageStore } from "../store/languageStore";

const languages = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "tr", label: "Türkçe" },
  { code: "uz", label: "O‘zbekcha" },
];

const Home = () => {
  const { t, i18n } = useTranslation();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchWeather({ city: "tashkent", lang })
      .then(setWeather)
      .catch(console.error);
  }, [lang]);

  return (
    <>
      <main className="home sun">
        <div className="overlay"></div>
        <div className="content">
          <h1>{t("welcome")}</h1>
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
          {weather && (
            <div>
              <h2>{weather.name}</h2>
              <p>{weather.weather[0].description}</p>
              <p>{weather.main.temp}°C</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

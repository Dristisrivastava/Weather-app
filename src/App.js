import React, { useState } from "react";
import "./App.css";
import { useEffect } from "react";

const getWeatherImage = (description) => {
  const lower = description.toLowerCase();

  if (lower.includes("heavy rain")) return require("./assets/heavyrain.png");
  if (
    lower.includes("light rain") ||
    lower.includes("moderate rain") ||
    lower.includes("drizzle") ||
    lower.includes("shower")
  )
    return require("./assets/partialrain.png");

  if (
    lower.includes("mist") ||
    lower.includes("haze") ||
    lower.includes("fog") ||
    lower.includes("smoke")
  )
    return require("./assets/mist.png");

  if (lower.includes("overcast") || lower.includes("broken clouds"))
    return require("./assets/overcast.png");

  if (lower.includes("clear")) return require("./assets/clear.png");
  if (lower.includes("sunny")) return require("./assets/sunny.png");
  if (lower.includes("clouds")) return require("./assets/overcast.png");

  return require("./assets/mist.png"); 
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [isLightTheme, setIsLightTheme] = useState(false);

  const toggleTheme = () => setIsLightTheme(!isLightTheme);
  const API_KEY = "c02aba8730a9796dce95d5e77297ff32";
  useEffect(() => {
    document.body.classList.toggle("light-mode", isLightTheme);
  }, [isLightTheme]);
  const fetchWeather = async (selectedCity) => {
    if (!selectedCity) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      const daily = forecastData.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(daily);

      const upperCity = selectedCity.toUpperCase();
      setHistory((prev) => {
        const filtered = prev.filter((c) => c !== upperCity);
        return [upperCity, ...filtered].slice(0, 5);
      });
    } catch (err) {
      setError("Invalid city or API error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const handleHistoryClick = (selectedCity) => {
    setCity(selectedCity);
    fetchWeather(selectedCity);
  };

  return (
    <div className={isLightTheme ? "app light" : "app"}>
      <div className="top-right-controls">
        <button onClick={toggleTheme}>
          {isLightTheme ? "🌙 Dark Mode" : "🌞 Light Mode"}
        </button>
        <button onClick={() => fetchWeather(city)} disabled={!city || loading}>
          🔄 Refresh
        </button>
      </div>

      {history.length > 0 && (
        <div className="history">
          <h3>Recent</h3>
          <ul>
            {history.map((item, index) => (
              <li key={index} onClick={() => handleHistoryClick(item)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="container">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : weather ? (
          <div className="box">
            <div className="detail">
              <div className="temp">
                <p>{Math.round(weather.main.temp)}°C</p>
              </div>
              <div className="temploc">
                <p>{weather.name.toUpperCase()}</p>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="condition">
                <p>{weather.weather[0].description}</p>
              </div>
              <div className="extras">
                <p>Humidity: {weather.main.humidity}%</p>
                <p>Wind: {weather.wind.speed} km/h</p>
              </div>
            </div>
            <div className="image">
              <img
                src={getWeatherImage(weather.weather[0].description)}
                alt={weather.weather[0].description}
                width="200"
                height="190"
              />
            </div>
          </div>
        ) : (
          <div className="info">
          <h2>Weather Explorer</h2>
          <p>Type a city name above to begin your journey</p>
          <img
            src={require("./assets/intro.png")}
            alt="Weather intro illustration"
            className="intro-image"
          />
        </div>
        
        )}

        {forecast.length > 0 && (
          <div className="forecast-box">
            <h3 className="forecast-item">5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((item, index) => (
                <div className="forecast-item" key={index}>
                  <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
                  <img
                    src={getWeatherImage(item.weather[0].description)}
                    alt={item.weather[0].description}
                    width="60"
                  />
                  <p>{Math.round(item.main.temp)}°C</p>
                  <p>{item.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search the location"
            className="searcharea"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </nav>
    </div>
  );
}

export default App;

const city = document.getElementsByClassName("search")[0];
const searchIcon = document.getElementsByClassName("search-icon")[0];

// Retrieve API Key from Vite .env or global window config
const apiKey = (import.meta && import.meta.env && import.meta.env.VITE_WEATHER_API_KEY) || (typeof window !== 'undefined' && window.apiKey);

if (!apiKey) {
  console.error("OpenWeatherMap API Key is missing! Please set VITE_WEATHER_API_KEY in your .env file.");
  alert("OpenWeatherMap API Key is missing! Please set VITE_WEATHER_API_KEY in your .env file.");
}

// --------------------------------------------------------------------------
// ⚡ PERFORMANCE CACHING (O(1) lookup for repeated searches & DOM elements)
// --------------------------------------------------------------------------
const apiCache = new Map();

// Cache DOM elements to prevent repeated O(N) DOM tree traversals
const domElements = {
  tempValue: document.getElementById("temp-value"),
  feelLike: document.getElementById("feel-like"),
  location: document.getElementById("searched-location"),
  country: document.getElementById("country"),
  windSpeed: document.getElementById("Wind-Speed"),
  pressure: document.getElementById("Pressure"),
  humidity: document.getElementById("Humidity"),
  visibility: document.getElementById("Visibility"),
  weatherLogo: document.getElementById("current-weather-logo"),
  weatherDesc: document.getElementById("current-weather-desc"),
  suggestionsList: document.getElementById("suggestions-list")
};

let url = '';
let url1 = '';

// Handle city search trigger
function cityname() {
  const userInput = city.value.trim();

  if (userInput.length > 0) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(userInput)}&appid=${apiKey}`;
    url1 = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(userInput)}&cnt=7&appid=${apiKey}`;

    // ⚡ OPTIMIZATION: Fetch weather and forecast in parallel using Promise.all
    // Reduces total wait time from (T1 + T2) to max(T1, T2)
    fetchWeatherDataParallel(url, url1);
  } else {
    console.log("Please enter a city name");
  }
}

// ⚡ Parallel API Fetcher with O(1) Cache Lookup
async function fetchWeatherDataParallel(weatherUrl, forecastUrl) {
  try {
    // Check if results are cached in memory (O(1) instant return)
    if (apiCache.has(weatherUrl) && apiCache.has(forecastUrl)) {
      const cachedWeather = apiCache.get(weatherUrl);
      const cachedForecast = apiCache.get(forecastUrl);
      
      temp_to_celcius(cachedWeather);
      renderData(cachedWeather);
      weather_info_data(cachedWeather);
      currentday_logo_change(cachedWeather);
      renderforecastdata(cachedForecast);
      return;
    }

    // Execute network requests simultaneously in parallel
    const [resWeather, resForecast] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ]);

    if (resWeather.ok) {
      const weatherData = await resWeather.json();
      apiCache.set(weatherUrl, weatherData);
      temp_to_celcius(weatherData);
      renderData(weatherData);
      weather_info_data(weatherData);
      currentday_logo_change(weatherData);
    } else {
      console.error("Error fetching weather data:", resWeather.statusText);
    }

    if (resForecast.ok) {
      const forecastInfo = await resForecast.json();
      apiCache.set(forecastUrl, forecastInfo);
      renderforecastdata(forecastInfo);
    } else {
      console.error("Error fetching forecast data:", resForecast.statusText);
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Legacy async wrappers for direct calls
async function getdata(url) {
  try {
    if (apiCache.has(url)) {
      const data = apiCache.get(url);
      temp_to_celcius(data);
      renderData(data);
      weather_info_data(data);
      currentday_logo_change(data);
      return;
    }
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      apiCache.set(url, data);
      temp_to_celcius(data);
      renderData(data);
      weather_info_data(data);
      currentday_logo_change(data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function getforecast(url1) {
  try {
    if (apiCache.has(url1)) {
      renderforecastdata(apiCache.get(url1));
      return;
    }
    const response = await fetch(url1);
    if (response.ok) {
      const forecastinfo = await response.json();
      apiCache.set(url1, forecastinfo);
      renderforecastdata(forecastinfo);
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// --------------------------------------------------------------------------
// ORIGINAL UI RENDER FUNCTIONS (PRESERVED)
// --------------------------------------------------------------------------

// Convert temperature to Celsius and render
function temp_to_celcius(data) {
  const kelvin = data.main.temp;
  const feels_like_kelvin = data.main.feels_like;

  const feel_celsius = feels_like_kelvin - 273.15;
  const celsius = kelvin - 273.15;

  const tempValEl = domElements.tempValue || document.getElementById("temp-value");
  const feelLikeEl = domElements.feelLike || document.getElementById("feel-like");

  if (tempValEl) tempValEl.innerHTML = `${celsius.toFixed(0)}<span class="degree">°C</span>`;
  if (feelLikeEl) feelLikeEl.innerText = `Feels-Like: ${feel_celsius.toFixed(0)}°C`;
}

// Render location and country
function renderData(data) {
  const locEl = domElements.location || document.getElementById("searched-location");
  const countryEl = domElements.country || document.getElementById("country");

  if (locEl) locEl.innerText = `${data.name},`;
  if (countryEl) countryEl.innerText = `${data.sys.country}`;
}

// Render weather metrics (Wind, Pressure, Humidity, Visibility)
function weather_info_data(data) {
  const wind_speed = domElements.windSpeed || document.getElementById("Wind-Speed");
  const Pressure = domElements.pressure || document.getElementById("Pressure");
  const Humidity = domElements.humidity || document.getElementById("Humidity");
  const Visibility = domElements.visibility || document.getElementById("Visibility");

  if (wind_speed) wind_speed.innerHTML = `<i class="fa-solid fa-wind"></i> Wind Speed: ${data.wind.speed} KM/H`;
  if (Pressure) Pressure.innerHTML = `<i class="fa-solid fa-gauge"></i> Pressure: ${data.main.pressure} hPa`;
  if (Humidity) Humidity.innerHTML = `<i class="fa-solid fa-droplet"></i> Humidity: ${data.main.humidity}%`;

  const distance = data.visibility;
  const Km = (distance / 1000).toFixed(1);
  if (Visibility) Visibility.innerHTML = `<i class="fa-solid fa-eye"></i> Visibility: ${Km} KM`;
}

// Change logo and description of current city
function currentday_logo_change(data) {
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;

  const logoEl = domElements.weatherLogo || document.getElementById("current-weather-logo");
  const descEl = domElements.weatherDesc || document.getElementById("current-weather-desc");

  if (logoEl) logoEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  if (descEl) descEl.innerText = description;
}

// Render upcoming forecast data
function renderforecastdata(forecastinfo) {
  if (!forecastinfo || !forecastinfo.list) return;

  for (let i = 0; i < forecastinfo.list.length; i++) {
    const icon_day = document.getElementById(`icon-day${i + 1}`);
    const forecast_temp = document.getElementById(`forecast${i + 1}`);
    const description = document.getElementById(`weather-description${i + 1}`);

    if (icon_day) {
      const icon = forecastinfo.list[i].weather[0].icon;
      icon_day.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }

    if (forecast_temp) {
      const temp_celsius = forecastinfo.list[i].main.temp - 273.15;
      forecast_temp.innerText = `${temp_celsius.toFixed(0)}°C`;
    }

    if (description) {
      description.innerText = forecastinfo.list[i].weather[0].description;
    }
  }
}

// Geolocation City Lookup Helper
function getCityName(lat, lon, isAutoCall = false) {
  if (isAutoCall && city.value.trim().length > 0) return;
  const url3 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(url3)
    .then(response => response.json())
    .then(data => {
      if (isAutoCall && city.value.trim().length > 0) return;
      if (data && data.name && data.name.length > 0) {
        city.value = `${data.name}, ${data.sys.country}`;
        cityname();
      } else {
        if (city.value.trim().length === 0) {
          city.value = "London";
          cityname();
        }
      }
    })
    .catch(error => {
      console.error("Error reverse-geocoding location:", error);
      if (city.value.trim().length === 0) {
        city.value = "London";
        cityname();
      }
    });
}

// Geolocation Handler
function getCurrentLocation(isAuto = false) {
  if (isAuto && city.value.trim().length > 0) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isAuto && city.value.trim().length > 0) return;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getCityName(lat, lon, isAuto);
      },
      (error) => {
        console.error("Error getting location:", error);
        if (!isAuto) {
          alert("Location access denied or timed out. Please enable GPS.");
        }
        if (city.value.trim().length === 0) {
          city.value = "London";
          cityname();
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    if (!isAuto) alert("Geolocation is not supported by this browser.");
    if (city.value.trim().length === 0) {
      city.value = "London";
      cityname();
    }
  }
}

window.addEventListener("load", () => {
  getCurrentLocation(true);
});

// Autocomplete Logic with Debounce and DocumentFragment Batching
let debounceTimer;
const suggestionsList = domElements.suggestionsList || document.getElementById("suggestions-list");

city.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  const query = city.value.trim();

  if (query.length < 3) {
    if (suggestionsList) {
      suggestionsList.style.display = "none";
      suggestionsList.innerHTML = "";
    }
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

async function fetchSuggestions(query) {
  const cacheKey = `geo_${query.toLowerCase()}`;
  if (apiCache.has(cacheKey)) {
    renderSuggestions(apiCache.get(cacheKey));
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      apiCache.set(cacheKey, data);
      renderSuggestions(data);
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

// ⚡ OPTIMIZATION: Use DocumentFragment to batch DOM insertions in O(1) layout reflow
function renderSuggestions(suggestions) {
  if (!suggestionsList) return;
  suggestionsList.innerHTML = "";

  if (!suggestions || suggestions.length === 0) {
    suggestionsList.style.display = "none";
    return;
  }

  const fragment = document.createDocumentFragment();

  suggestions.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion-item";

    const stateStr = item.state ? `, ${item.state}` : "";
    const displayText = `${item.name}${stateStr}, ${item.country}`;

    div.innerHTML = `
      <i class="fa-solid fa-location-dot"></i>
      <span>${displayText}</span>
    `;

    div.addEventListener("click", () => {
      city.value = `${item.name}, ${item.country}`;
      suggestionsList.style.display = "none";
      cityname();
    });

    fragment.appendChild(div);
  });

  suggestionsList.appendChild(fragment);
  suggestionsList.style.display = "block";
}

// Hide suggestions on outside click
document.addEventListener("click", function (event) {
  const searchBox = document.querySelector(".search-box");
  if (suggestionsList && searchBox && !searchBox.contains(event.target)) {
    suggestionsList.style.display = "none";
  }
});

searchIcon.addEventListener('click', function () {
  if (suggestionsList) suggestionsList.style.display = "none";
  cityname();
});

document.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    if (suggestionsList) suggestionsList.style.display = "none";
    cityname();
  }
});

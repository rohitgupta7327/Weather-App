const city = document.getElementsByClassName("search")[0];
const searchIcon = document.getElementsByClassName("search-icon")[0];

// Verify API Key from config.js is loaded
if (typeof apiKey === 'undefined' || apiKey === 'YOUR_API_KEY_HERE' || !apiKey) {
  console.error("OpenWeatherMap API Key is missing or not configured! Please configure config.js. Refer to config.example.js.");
  alert("OpenWeatherMap API Key is missing! Please configure config.js using config.example.js as a template.");
}

let url = '';
let url1 = '';
// Function to handle input change

function cityname() {
  const userInput = city.value.trim();

  if (userInput.length > 0) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=${apiKey}`;
    url1 = `https://api.openweathermap.org/data/2.5/forecast?q=${userInput}&cnt=7&appid=${apiKey}`;
    getdata(url);
    getforecast(url1);
  } else {
    console.log("Please enter a city name");
  }
}

// Function to fetch data from the API
async function getdata(url) {
  try {
    console.log("getting data");
    let response = await fetch(url);
    if (response.ok) {
      let data = await response.json();

      temp_to_celcius(data);
      renderData(data);
      weather_info_data(data);
      currentday_logo_change(data);

    } else {
      console.error("Error fetching data:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// 7 days forecast data
async function getforecast(url1) {
  try {
    let fetching = await fetch(url1);
    if (fetching.ok) {
      let forecastinfo = await fetching.json();
      renderforecastdata(forecastinfo);
    } else {
      console.error("Error fetching data:", fetching.statusText);
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }

}

// *END


// *START CONVERT TEMPRATURE TO CELCIUS
function temp_to_celcius(data) {
  const temp_value = document.getElementById("temp-value");
  const feel_like = document.getElementById("feel-like");

  const kelvin = data.main.temp;
  const feels_like_kelvin = data.main.feels_like;

  const feel_celsius = feels_like_kelvin - 273.15;
  const celsius = kelvin - 273.15;

  temp_value.innerHTML = `${celsius.toFixed(0)}<span class="degree">°C</span>`;
  feel_like.innerText = `Feels-Like: ${feel_celsius.toFixed(0)}°C`;
}
//*END


// *START
// Function to render the fetched data
function renderData(data) {
  const location = document.getElementById("searched-location");
  const country = document.getElementById("country");
  location.innerText = `${data.name},`;
  country.innerText = `${data.sys.country}`;
}

searchIcon.addEventListener('click', function () {
  const suggestionsList = document.getElementById("suggestions-list");
  if (suggestionsList) {
    suggestionsList.style.display = "none";
  }
  cityname();
});

// *END



// *START "weather-info-data"
function weather_info_data(data) {

  const wind_speed = document.getElementById("Wind-Speed");
  wind_speed.innerText = ` Wind-Speed = ${data.wind.speed} KM/H`;

  const Pressure = document.getElementById("Pressure");
  Pressure.innerText = `Pressure = ${data.main.pressure} hPa`;

  const Humidity = document.getElementById("Humidity");
  Humidity.innerText = `Humidity = ${data.main.humidity} %`;

  const Visibility = document.getElementById("Visibility");

  const distance = data.visibility;
  const Km = distance / 1000;
  Visibility.innerText = `Visibility = ${Km} KM`;

}


//  Change logo and description of current searched city

function currentday_logo_change(data) {

  const description = data.weather[0].description;
  const icon = data.weather[0].icon;

  const current_weather_logo = document.getElementById("current-weather-logo");
  const current_weather_desc = document.getElementById("current-weather-desc");

  current_weather_logo.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  current_weather_desc.innerText = `${description}`;
}

//Change logo and temp of upcomming days


function renderforecastdata(forecastinfo) {


  for (let i = 0; i < forecastinfo.list.length; i++) {
    const icon_day = document.getElementById(`icon-day${i + 1}`);
    const icon = forecastinfo.list[i].weather[0].icon;
    icon_day.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const forecast_temp = document.getElementById(`forecast${i + 1}`);
    const temp_celsius = forecastinfo.list[i].main.temp - 273.15;
    forecast_temp.innerText = `${temp_celsius.toFixed(0)}°C`;

    const description = document.getElementById(`weather-description${i + 1}`);
    description.innerText = forecastinfo.list[i].weather[0].description;
  }
}



// search by pressing Currentlocation 
// ** START

function getCurrentLocation(isAuto = false) {
  // If this is an automatic GPS load, and the user has already typed something, do not override it.
  if (isAuto && city.value.trim().length > 0) {
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Double check in the callback as well in case they typed while waiting
        if (isAuto && city.value.trim().length > 0) {
          return;
        }
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getCityName(lat, lon, isAuto);
      },
      (error) => {
        console.error("Error getting location:", error);
        if (!isAuto) {
          alert("Location access denied or timed out. Please enable GPS.");
        }
        // Only fallback to London if input is empty
        if (city.value.trim().length === 0) {
          const defaultCity = "London";
          city.value = defaultCity;
          cityname();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Auto search by userlocation latitude and longitude                  
    function getCityName(lat, lon, isAutoCall = false) {
      if (isAutoCall && city.value.trim().length > 0) {
        return;
      }
      const url3 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      fetch(url3)
        .then(response => response.json())
        .then(data => {
          if (isAutoCall && city.value.trim().length > 0) {
            return;
          }
          if (data && data.name && data.name.length > 0) {
            city.value = `${data.name}, ${data.sys.country}`;
            cityname();
          } else {
            console.log("Location not found via GPS coordinates.");
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
  } else {
    if (!isAuto) {
      alert("Geolocation is not supported by this browser.");
    }
    if (city.value.trim().length === 0) {
      city.value = "London";
      cityname();
    }
  }
}

// Call on load with auto = true
window.onload = () => {
  getCurrentLocation(true);
};
// *END


// Suggestions Autocomplete Logic
let debounceTimer;
const suggestionsList = document.getElementById("suggestions-list");

city.addEventListener("input", function() {
  clearTimeout(debounceTimer);
  const query = city.value.trim();

  if (query.length < 3) {
    suggestionsList.style.display = "none";
    suggestionsList.innerHTML = "";
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

async function fetchSuggestions(query) {
  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      renderSuggestions(data);
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = "";
  
  if (!suggestions || suggestions.length === 0) {
    suggestionsList.style.display = "none";
    return;
  }

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
    
    suggestionsList.appendChild(div);
  });

  suggestionsList.style.display = "block";
}

// Hide suggestions when clicking outside
document.addEventListener("click", function(event) {
  const searchBox = document.querySelector(".search-box");
  if (suggestionsList && searchBox && !searchBox.contains(event.target)) {
    suggestionsList.style.display = "none";
  }
});

// ON pressing ENTER button search occur
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    if (suggestionsList) {
      suggestionsList.style.display = "none";
    }
    cityname();
  }
});







// Function to update the weekday and date
function updateWeekdayAndDate() {
  const currentDate = new Date();
  
  // Array of weekday names
  const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  
  // Get the current day name and format the date
  const dayName = weekdays[currentDate.getDay()];
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString(undefined, options);
  
  // Combine the weekday and date
  const fullDateString = `${dayName}, ${formattedDate}`;
  
  // Update the HTML element
  document.getElementById("display-date").textContent = fullDateString;

  UpComming_days_info(formattedDate);  
}
  // Call the function to update the date on page load
  updateWeekdayAndDate();
 
  // Optional: Update at midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updateDate();
    }
  }, 60000); // Check every minute

  
// Function to determine the appropriate greeting
function getGreeting() {
    const currentHour = new Date().getHours(); // Get the current hour (0-23)
    let greeting;
  
    if (currentHour >= 1 && currentHour < 12) {
      greeting = "Good Morning";
    } else if (currentHour >= 12 && currentHour < 16) {
      greeting = "Good Afternoon";
    } else if (currentHour >= 16 && currentHour < 18) {
      greeting = "Good Evening";
    } else {
      greeting = "Good Night";
    }
    return greeting;
  }
  
  // Function to update the greeting on the webpage
  function updateGreeting() {
    const greetingMessage = getGreeting();
    document.getElementById("greeting").textContent = greetingMessage;
  }
  updateGreeting();
  


// Further Days Date update

//*START
function UpComming_days_info(date) {
  const upDated_date = document.querySelectorAll("#updated-day1, #updated-day2, #updated-day3, #updated-day4, #updated-day5, #updated-day6, #updated-day7");
  const currentDate = new Date(date);

  upDated_date.forEach((element, index) => {
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + index + 1);
    const options = { day: 'numeric' ,  month: 'long'};
    const formattedDate = futureDate.toLocaleDateString(undefined, options);
    element.innerText = formattedDate;
  });
}


// when no internet is connected 
// function updateOnlineStatus() {
//   const offlineMessage = document.getElementById('offline-message');
//   const body = document.querySelectorAll('body'); // Assuming 'content' is the id of the main content

//   if (!navigator.onLine) {
//       body.style.display = 'none';  // Hide all content

//       offlineMessage.style.display = 'block';  // Show offline image

//   } else {
//       content.style.display = 'block'; // Show content when online
//       offlineMessage.style.display = 'none'; // Hide offline image
//   }
// }

// // Run on page load and when connection status changes
// window.addEventListener('load', updateOnlineStatus);
// window.addEventListener('online', updateOnlineStatus);
// window.addEventListener('offline', updateOnlineStatus);
    

  // automatic suggest city name

  function initAutocomplete() {
    var input = document.getElementsByClassName("search");
    var autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["(cities)"] // Restrict to cities only
    });

    autocomplete.setFields(["address_component"]);
}






  
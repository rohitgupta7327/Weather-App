// Function to update the weekday and date
function updateWeekdayAndDate() {
  const currentDate = new Date();
  
  const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  
  const dayName = weekdays[currentDate.getDay()];
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString(undefined, options);
  
  const displayDate = document.getElementById("display-date");
  if (displayDate) {
    displayDate.textContent = `${dayName}, ${formattedDate}`;
  }

  updateUpcomingDaysInfo(currentDate);  
}

// Function to determine the appropriate greeting
function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return "Good Morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Good Afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}

// Function to update the greeting on the webpage
function updateGreeting() {
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) {
    greetingEl.textContent = getGreeting();
  }
}

// Update upcoming forecast dates
function updateUpcomingDaysInfo(currentDate) {
  const upcomingDayEls = document.querySelectorAll(
    "#updated-day1, #updated-day2, #updated-day3, #updated-day4, #updated-day5, #updated-day6, #updated-day7"
  );

  upcomingDayEls.forEach((element, index) => {
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + index + 1);
    const options = { day: 'numeric', month: 'long' };
    element.innerText = futureDate.toLocaleDateString(undefined, options);
  });
}

// Initialize on load
updateWeekdayAndDate();
updateGreeting();

// Refresh date and greeting at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    updateWeekdayAndDate();
    updateGreeting();
  }
}, 60000);
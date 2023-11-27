const darkModeToggle = document.getElementById("dark-mode-toggle");

// Check if the user has a preferred theme in local storage
const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

// Apply the theme on page load
if (isDarkMode) {
    document.documentElement.classList.add('dark');
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
    // Toggle the class on the document element
    document.documentElement.classList.toggle("dark");

    // Update the user's preference in local storage
    const newMode = document.documentElement.classList.contains('dark') ? 'enabled' : 'disabled';
    localStorage.setItem('darkMode', newMode);
});

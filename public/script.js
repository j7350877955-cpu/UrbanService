/**
 * ServicePros - Main JavaScript File
 */

// --- Sticky Header Shadow on Scroll ---
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    // Add the 'scrolled' class when the page is scrolled down more than 10 pixels
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Search Functionality ---
function handleSearch() {
    const input = document.getElementById('searchInput').value;
    const locationSelect = document.getElementById('location');
    const location = locationSelect.options[locationSelect.selectedIndex].text;
    
    if (input.trim() === '') {
        alert(`Please enter a service to search in ${location}.`);
    } else {
        // In a real application, this would redirect to a search results page
        // e.g., window.location.href = `/search?q=${input}&loc=${locationSelect.value}`;
        alert(`Searching for '${input}' in ${location}...\n(This would route to a search results page)`);
    }
}

// --- Category Selection ---
function selectService(categoryName) {
    const searchInput = document.getElementById('searchInput');
    
    // Auto-fill the search bar with the clicked category and focus it
    searchInput.value = categoryName;
    searchInput.focus();
    
    // Optional: You could trigger the search immediately here
    // handleSearch(); 
}

// --- Booking Flow ---
function bookService(serviceName) {
    // In a real application, this would open a modal, slide-over, or redirect to a booking page
    alert(`Opening booking flow for: ${serviceName}\n(This would open a modal to select a date and time slot)`);
}

// --- Smooth Scrolling for internal links (Optional enhancement) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    const navItems = document.querySelectorAll('.nav-item .nav-link');
    navItems.forEach(navItem => {
        if (navItem.getAttribute('href') === window.location.pathname) {
            navItem.classList.add('active');
        }
    });
});
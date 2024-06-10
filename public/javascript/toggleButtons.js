document.addEventListener('DOMContentLoaded', function () {
    const navbarButtons = document.getElementById('navbar-buttons');
    const offcanvasButtons = document.getElementById('offcanvas-buttons');
    const buttonsHTML = navbarButtons.innerHTML;

    function moveButtons() {
        if (window.innerWidth <= 990) {
            if (offcanvasButtons.innerHTML.trim() === '') {
                offcanvasButtons.innerHTML = buttonsHTML;
            }
            navbarButtons.innerHTML = '';
        } else {
            if (navbarButtons.innerHTML.trim() === '') {
                navbarButtons.innerHTML = buttonsHTML;
            }
            offcanvasButtons.innerHTML = '';
        }
    }

    window.addEventListener('resize', moveButtons);
    moveButtons(); // Initial call to set the correct state
});

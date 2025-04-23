document.addEventListener('DOMContentLoaded', function() {
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');

    // Open search overlay
    searchToggle.addEventListener('click', function() {
        searchOverlay.classList.add('active');
        document.querySelector('.search-input').focus();
    });

    // Close search overlay
    closeSearch.addEventListener('click', function() {
        searchOverlay.classList.remove('active');
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
    });

    // Close when clicking outside search container
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    });
});
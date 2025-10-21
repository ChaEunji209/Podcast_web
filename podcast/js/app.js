const cardGrid = document.getElementById('cardGrid');
const showFavsBtn = document.getElementById('showFavsBtn');

// Check if PODCASTS is available from data.js
// If PODCASTS is not defined here, the script will halt. 
// Assuming data.js loads it as a global variable.
if (typeof PODCASTS === 'undefined') {
    console.error("Error: PODCASTS array is not defined. Ensure data.js is loaded correctly.");
}

// State to track if we are showing only favorites
let isShowingFavorites = false;

// isFav and toggleFav functions are used by both app.js and auth.js.
// It is recommended to keep them here or in a utils.js file.
function isFav(id) {
    // Check for user login is handled in the original auth.js file, 
    // but the actual favoriting works regardless of login status in the provided logic
    const favs = JSON.parse(localStorage.getItem('favs') || '[]');
    return favs.includes(id);
}

function toggleFav(id) {
    const user = getCurrentUser(); // Assuming getCurrentUser is available from auth.js
    if (!user) {
        alert('즐겨찾기는 로그인 후 이용할 수 있습니다.');
        return;
    }

    let favs = JSON.parse(localStorage.getItem('favs') || '[]');
    if (favs.includes(id)) {
        favs = favs.filter(i => i !== id);
    } else {
        favs.push(id);
    }
    localStorage.setItem('favs', JSON.stringify(favs));

    // If currently showing only favorites, re-render to update the list
    if (isShowingFavorites) {
        const filtered = PODCASTS.filter(p => isFav(p.id));
        renderList(filtered);
    }
}

// Global function to render the list (used by search, initial load, and auth.js on logout)
function renderList(list) {
    cardGrid.innerHTML = '';
    if (list.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-results-message';
        message.textContent = isShowingFavorites 
            ? '즐겨찾기에 추가된 에피소드가 없습니다.'
            : '검색 결과가 없습니다.';
        cardGrid.appendChild(message);
        return;
    }

    list.forEach(ep => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="star ${isFav(ep.id) ? 'on' : ''}" data-id="${ep.id}">★</span>
            <h3>${ep.title}</h3>
            <p>${ep.description}</p>
        `;
        card.onclick = (e) => {
            if (e.target.classList.contains('star')) {
                toggleFav(ep.id);
                // The visual toggle is handled inside toggleFav if the user is logged in
                // We keep the logic simple here:
                if (getCurrentUser()) {
                   e.target.classList.toggle('on');
                }
                return;
            }
            location.href = `detail.html?id=${ep.id}`;
        };
        cardGrid.appendChild(card);
    });
}

// --- Favorites Filter Handler ---
showFavsBtn.addEventListener('click', () => {
    if (!getCurrentUser()) {
        alert('즐겨찾기 목록은 로그인 후 확인할 수 있습니다.');
        return;
    }

    // Toggle the filter state
    isShowingFavorites = !isShowingFavorites;
    showFavsBtn.classList.toggle('active', isShowingFavorites);
    searchBar.value = ''; // Clear search when switching to favorites

    // Check for PODCASTS availability before filtering
    if (typeof PODCASTS === 'undefined') return; 

    if (isShowingFavorites) {
        // Filter to show only favorites
        const favoriteEpisodes = PODCASTS.filter(p => isFav(p.id));
        renderList(favoriteEpisodes);
    } else {
        // Show all episodes again
        renderList(PODCASTS);
    }
});

// Initial rendering of the full list
// Check for PODCASTS availability before the initial render
if (typeof PODCASTS !== 'undefined') {
    renderList(PODCASTS);
}





//-----------------Hamburger menu-------------------------

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
})

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}))
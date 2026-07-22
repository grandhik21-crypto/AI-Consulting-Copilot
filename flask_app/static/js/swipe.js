/**
 * SwipeFlix - Swipe Interface JavaScript
 */

let movies = [];
let currentIndex = 0;
let likedMovies = [];
let swipeCount = 0;
let swipesRequired = 12;
let genreId = null;
let genreName = '';
let isDragging = false;
let dragStartX = 0;
let dragOffset = 0;

/**
 * Initialize the swipe interface
 */
async function initSwipe(gId, required) {
    genreId = gId;
    swipesRequired = required;
    
    // Get genre name from the page title
    const titleEl = document.querySelector('.genre-title');
    genreName = titleEl ? titleEl.textContent.replace(' Movies', '') : '';
    
    await loadMovies();
    setupEventListeners();
}

/**
 * Load movies from API
 */
async function loadMovies() {
    const container = document.getElementById('cardContainer');
    
    try {
        const response = await fetch(`/api/movies?genre_id=${genreId}&count=${swipesRequired + 5}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        movies = data.movies;
        
        if (movies.length === 0) {
            container.innerHTML = `
                <div class="error">
                    <span style="font-size: 3rem;">😕</span>
                    <p>No movies found for this genre.</p>
                </div>
            `;
            return;
        }
        
        renderCurrentCard();
        enableButtons();
        
    } catch (error) {
        container.innerHTML = `<div class="error">Failed to load movies: ${error.message}</div>`;
    }
}

/**
 * Render the current movie card
 */
function renderCurrentCard() {
    const container = document.getElementById('cardContainer');
    
    if (currentIndex >= movies.length) {
        finishSwiping();
        return;
    }
    
    const movie = movies[currentIndex];
    
    const starsHtml = renderStars(movie.rating);
    const reviewsHtml = movie.reviews && movie.reviews.length > 0
        ? `<div class="card-reviews">
            ${movie.reviews.slice(0, 2).map(r => `
                <div class="mini-review">
                    <div class="mini-review-header">
                        <span class="mini-review-author">@${r.author}</span>
                        ${r.rating ? `<span class="mini-review-rating">★ ${r.rating}/10</span>` : ''}
                    </div>
                    <p class="mini-review-content">"${r.content}"</p>
                </div>
            `).join('')}
           </div>`
        : '';
    
    container.innerHTML = `
        <div class="movie-card" id="movieCard">
            <div class="card-poster">
                ${movie.poster_url 
                    ? `<img src="${movie.poster_url}" alt="${movie.title}" draggable="false">`
                    : '<div class="no-poster"><span>🎬</span></div>'
                }
                <div class="poster-gradient"></div>
                <div class="stamp like" id="likeStamp">LIKE</div>
                <div class="stamp nope" id="nopeStamp">NOPE</div>
            </div>
            <div class="card-info">
                <div class="card-header">
                    <h3 class="card-title">${movie.title}</h3>
                    <span class="card-year">${movie.year}</span>
                </div>
                <div class="star-rating">
                    ${starsHtml}
                    <span class="rating-text">${movie.rating}/10</span>
                </div>
                <p class="card-overview">${movie.overview}</p>
                ${reviewsHtml}
            </div>
        </div>
    `;
    
    // Add drag listeners to new card
    const card = document.getElementById('movieCard');
    addCardDragListeners(card);
}

/**
 * Render star rating
 */
function renderStars(rating) {
    const fullStars = Math.round(rating / 2);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star ${i <= fullStars ? '' : 'empty'}">★</span>`;
    }
    return html;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Button clicks
    document.getElementById('nopeBtn').addEventListener('click', () => swipe(false));
    document.getElementById('likeBtn').addEventListener('click', () => swipe(true));
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') swipe(false);
        if (e.key === 'ArrowRight') swipe(true);
    });
}

/**
 * Add drag listeners to a card
 */
function addCardDragListeners(card) {
    // Mouse events
    card.addEventListener('mousedown', (e) => startDrag(e.clientX));
    document.addEventListener('mousemove', (e) => moveDrag(e.clientX));
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    card.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX));
    document.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX));
    document.addEventListener('touchend', endDrag);
}

/**
 * Start dragging
 */
function startDrag(clientX) {
    isDragging = true;
    dragStartX = clientX;
    dragOffset = 0;
}

/**
 * Handle drag movement
 */
function moveDrag(clientX) {
    if (!isDragging) return;
    
    dragOffset = clientX - dragStartX;
    
    const card = document.getElementById('movieCard');
    if (!card) return;
    
    const rotation = dragOffset * 0.1;
    card.style.transform = `translateX(${dragOffset}px) rotate(${rotation}deg)`;
    card.style.transition = 'none';
    
    // Update stamps
    const likeStamp = document.getElementById('likeStamp');
    const nopeStamp = document.getElementById('nopeStamp');
    
    if (likeStamp) likeStamp.style.opacity = Math.max(0, Math.min(1, dragOffset / 100));
    if (nopeStamp) nopeStamp.style.opacity = Math.max(0, Math.min(1, -dragOffset / 100));
}

/**
 * End dragging
 */
function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    
    const card = document.getElementById('movieCard');
    if (!card) return;
    
    if (dragOffset > 80) {
        swipe(true);
    } else if (dragOffset < -80) {
        swipe(false);
    } else {
        // Reset position
        card.style.transform = '';
        card.style.transition = 'transform 0.3s ease';
        
        const likeStamp = document.getElementById('likeStamp');
        const nopeStamp = document.getElementById('nopeStamp');
        if (likeStamp) likeStamp.style.opacity = 0;
        if (nopeStamp) nopeStamp.style.opacity = 0;
    }
    
    dragOffset = 0;
}

/**
 * Handle swipe
 */
function swipe(liked) {
    if (currentIndex >= movies.length) return;
    
    const card = document.getElementById('movieCard');
    if (!card) return;
    
    const movie = movies[currentIndex];
    
    // Animate card out
    card.classList.add(liked ? 'swiping-right' : 'swiping-left');
    
    // Track liked movies
    if (liked) {
        likedMovies.push(movie);
    }
    
    swipeCount++;
    
    // Update UI
    updateStats();
    
    // After animation, show next card or finish
    setTimeout(() => {
        if (swipeCount >= swipesRequired) {
            finishSwiping();
        } else {
            currentIndex++;
            renderCurrentCard();
        }
    }, 500);
}

/**
 * Update stats display
 */
function updateStats() {
    const remaining = swipesRequired - swipeCount;
    document.getElementById('remaining').textContent = remaining;
    document.getElementById('likedCount').textContent = likedMovies.length;
    document.getElementById('swipedCount').textContent = swipeCount;
    
    const progress = (swipeCount / swipesRequired) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

/**
 * Enable swipe buttons
 */
function enableButtons() {
    document.getElementById('nopeBtn').disabled = false;
    document.getElementById('likeBtn').disabled = false;
}

/**
 * Finish swiping and show recommendation
 */
function finishSwiping() {
    // Pick the best movie from liked ones
    let recommendation = null;
    
    if (likedMovies.length > 0) {
        recommendation = likedMovies.reduce((best, movie) => {
            const score = movie.rating * Math.log10(Math.max(movie.vote_count, 1));
            const bestScore = best.rating * Math.log10(Math.max(best.vote_count, 1));
            return score > bestScore ? movie : best;
        });
    }
    
    // Store recommendation data
    sessionStorage.setItem('swipeflix_recommendation', JSON.stringify({
        recommendation,
        totalLiked: likedMovies.length,
        totalSwiped: swipeCount,
        genreName: genreName
    }));
    
    // Navigate to recommendation page
    window.location.href = '/recommendation';
}

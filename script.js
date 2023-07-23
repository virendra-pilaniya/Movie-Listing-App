const API_KEY = '624c3f71';
const ITEMS_PER_PAGE = 14;
const movieSearchBox = document.getElementById('movie-search-box');
const searchButton = document.querySelector('.search-button');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const movieDetailsContainer = document.querySelector('.movie-details-container');
const paginationContainer = document.querySelector('.pagination');

let searchTerm = '';
let currentPage = 1;
let totalResults = 0;
let totalPages = 10;
let currentMovies = [];

searchButton.addEventListener('click', searchMovies);
movieSearchBox.addEventListener('input', onSearchInput);

function onSearchInput() {
    searchTerm = movieSearchBox.value.trim();
}

function searchMovies() {
    if (searchTerm.length > 0) {
        currentPage = 1; // Reset current page to 1 when doing a new search
        fetchMovies(searchTerm);
    }
}

async function fetchMovies(searchTerm) {
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=${currentPage}&apikey=${API_KEY}`;
    try {
        const response = await fetch(URL);
        const data = await response.json();
        if (data.Response === "True") {
            totalResults = parseInt(data.totalResults);
            totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
            currentMovies = data.Search;
            displayMovieList(currentMovies);
            updatePaginationButtons();
        } else {
            displayError("No movies found for the given search term.");
        }
    } catch (error) {
        displayError("An error occurred while fetching data.");
        console.error(error);
    }
}

function displayError(errorMessage) {
    resultGrid.innerHTML = `<p class="error-message">${errorMessage}</p>`;
    searchList.innerHTML = '';
    paginationContainer.innerHTML = ''; // Clear pagination when displaying error
    document.querySelector('.movie-details-container').style.display = "none";
}

function displayMovieList(movies) {
    searchList.innerHTML = "";
    resultGrid.innerHTML = "";

    for (const movie of movies) {
        const movieListItem = document.createElement('div');
        movieListItem.classList.add('movie-item');

        if (movie.Poster !== "N/A") {
            movieListItem.innerHTML = `
                <div class="movie-poster">
                    <img src="${movie.Poster}" alt="movie poster">
                </div>
                <div class="movie-title">
                    ${movie.Title}
                </div>
            `;
        } else {
            movieListItem.innerHTML = `
                <div class="movie-poster">
                    <img src="image_not_found.png" alt="movie poster">
                </div>
                <div class="movie-title">${movie.Title}</div>
            `;
        }

        movieListItem.addEventListener('click', () => {
            showMovieDetails(movie.imdbID);
        });

        searchList.appendChild(movieListItem);
    }
}

async function showMovieDetails(movieId) {
    const URL = `https://omdbapi.com/?i=${movieId}&apikey=${API_KEY}`;

    try {
        const response = await fetch(URL);
        const data = await response.json();
        if (data.Response === "True") {
            document.querySelector('.movie-details-container').style.display = "flex";
            const { Title, Year, Genre, Plot, Poster } = data;
            document.getElementById('movie-poster').src = Poster !== "N/A" ? Poster : "image_not_found.png";
            document.getElementById('movie-title').textContent = Title;
            document.getElementById('movie-year').textContent = `Year: ${Year}`;
            document.getElementById('movie-genre').textContent = `Genre: ${Genre}`;
            document.getElementById('movie-plot').textContent = `Plot: ${Plot}`;
        } else {
            displayError("Unable to fetch movie details.");
        }
    } catch (error) {
        displayError("An error occurred while fetching movie details.");
        console.error(error);
    }
}


function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies(searchTerm);
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        fetchMovies(searchTerm);
    }
}

function updatePaginationButtons() {
    paginationContainer.innerHTML = `
        <button class="prev-button" onclick="goToPrevPage()">&lt; Prev</button>
        ${currentPage}
        <button class="next-button" onclick="goToNextPage()">Next &gt;</button>
    `;

    const prevButton = paginationContainer.querySelector('.prev-button');
    const nextButton = paginationContainer.querySelector('.next-button');

    if (currentPage === 1) {
        prevButton.disabled = true;
    } else {
        prevButton.disabled = false;
    }

    if (currentPage === totalPages) {
        nextButton.disabled = true;
    } else {
        nextButton.disabled = false;
    }
}
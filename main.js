const swup = new Swup();

let moviesArray;
let watchlistArray = [];
let movieName;

const renderMovies = (array) => {
  mainContent.innerHTML = "";
  for (const movie of array) {
    const isInWatchlist = watchlistArray.some(
      (item) => item.imdbID === movie.imdbID
    );
    const watchlistText = isInWatchlist ? "Remove" : "Watchlist";
    const watchlistClass = isInWatchlist ? "remove-link" : "add-link";
    mainContent.innerHTML += `
          <div id="movie-container">
          <img
            src="${movie.Poster}"
            alt=""
          />
          <div id="info-container">
            <div id="movie-title">
              <h3>${movie.Title}</h3>
              <p><img src="images/star.svg">${movie.imdbRating}</p>
            </div>
            <div id="duration-category">
              <p>${movie.Runtime}</p>
              <p>${movie.Genre}</p>
              <a href="#" data-imdbid="${movie.imdbID}" class="${watchlistClass}">${watchlistText}</a>
            </div>
            <div id="description">
              <p>
                ${movie.Plot}
              </p>
            </div>
          </div>
        </div>
        <hr />
          `;
  }
};

const searchMovie = async () => {
  moviesArray = [];
  movieName = movieInputElement.value;

  document.getElementById("main-content").innerHTML = `
      <div id="spacer"></div>
      <div class="loader transition-fade"></div>
      `;

  const response = await fetch(
    `https://www.omdbapi.com/?apikey=1db24459&s=${movieName}&page=1`
  );
  const data = await response.json();

  if (data.Response === "True") {
    const firstFiveMovies = data.Search.slice(0, 5);
    for (const movie of firstFiveMovies) {
      const imdbID = movie.imdbID;

      const movieDetailsResponse = await fetch(
        `https://www.omdbapi.com/?apikey=1db24459&i=${imdbID}`
      );
      const movieDetails = await movieDetailsResponse.json();
      moviesArray.push(movieDetails);
    }

    renderPage();
  } else {
    mainContent.innerHTML = `
      <div id="spacer"></div>
      <div id="placeholder">
        <p class="error-text">Unable to find what you're looking for. Please try another search.</p>
      </div>
      `;
  }
  movieInputElement.placeholder = movieName;
  movieInputElement.value = "";
};

function addWatchlistItem(imdbid) {
  {
    const movie = moviesArray.find((movie) => movie.imdbID === imdbid);
    watchlistArray.push(movie);
    localStorage.setItem("movie-watchlist", JSON.stringify(watchlistArray));
    renderPage();
    console.log(watchlistArray);
  }
}

function removeWatchlistItem(imdbid) {
  {
    watchlistArray = watchlistArray.filter((item) => item.imdbID !== imdbid);
    localStorage.setItem("movie-watchlist", JSON.stringify(watchlistArray));
    renderPage();
    console.log(watchlistArray);
  }
}

function renderPage() {
  if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
    if (movieName) {
      movieInputElement.placeholder = movieName;
    }
    if (moviesArray) {
      renderMovies(moviesArray);
    }
  }

  if (window.location.pathname === "/watchlist.html" || window.location.pathname === "/watchlist") {
    if (watchlistArray) {
      renderMovies(watchlistArray);
    }
  }
}

const initializeFormEventListener = () => {
  movieSearchForm = document.getElementById("movie-search-form");
  movieInputElement = document.getElementById("movie-name");
  mainContent = document.getElementById("main-content");
  watchlistArray = JSON.parse(localStorage.getItem("movie-watchlist") || "[]");

  movieSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchMovie().catch(console.error);
  });

  mainContent.addEventListener("click", (event) => {
    event.preventDefault();
    if (event.target.classList.contains("add-link")) {
      const imdbid = event.target.dataset.imdbid;
      addWatchlistItem(imdbid);
    }
    if (event.target.classList.contains("remove-link")) {
      const imdbid = event.target.dataset.imdbid;
      removeWatchlistItem(imdbid);
    }
  });

  renderPage();
};

initializeFormEventListener();

swup.hooks.on("page:view", () => {
  initializeFormEventListener();
});

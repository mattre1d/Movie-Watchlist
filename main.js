const swup = new Swup();

let movieName;
let moviesArray;
let watchlistArray = [];
let pageNumber = 1;
let totalResults = 0;

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

function handleNA(value, defaultValue = "/images/placeholder.svg") {
  return value === "N/A" ? defaultValue : value;
}

const searchMovie = async (name, page) => {
  moviesArray = [];
  nextButton.style.display = "none";
  prevButton.style.display = "none";

  document.getElementById("main-content").innerHTML = `
      <div id="spacer"></div>
      <div class="loader transition-fade"></div>
      `;

  const response = await fetch(
    `https://www.omdbapi.com/?apikey=1db24459&s=${encodeURIComponent(name)}&page=${page}`
  );
  const data = await response.json();

  if (data.Response === "True") {
    if (pageNumber === 1) {
      totalResults = data.totalResults;
    }

    const detailPromises = data.Search.map((movie) =>
      fetch(`https://www.omdbapi.com/?apikey=1db24459&i=${movie.imdbID}`)
        .then((response) => response.json())
        .then((movieDetails) => {
          movieDetails.Poster = handleNA(movieDetails.Poster);
          return movieDetails;
        })
        .catch((error) => {
          console.error("Error fetching movie details:", error);
          return null;
        })
    );

    moviesArray = (await Promise.all(detailPromises)).filter((m) => m !== null);

    renderPage();
  } else {
    mainContent.innerHTML = `
      <div id="spacer"></div>
      <div id="placeholder">
        <p class="error-text">Unable to find what you're looking for. Please try another search.</p>
      </div>
      `;
  }

};

function addWatchlistItem(imdbid) {
  {
    const movie = moviesArray.find((movie) => movie.imdbID === imdbid);
    watchlistArray.push(movie);
    localStorage.setItem("movie-watchlist", JSON.stringify(watchlistArray));
    renderPage();
  }
}

function removeWatchlistItem(imdbid) {
  {
    watchlistArray = watchlistArray.filter((item) => item.imdbID !== imdbid);
    localStorage.setItem("movie-watchlist", JSON.stringify(watchlistArray));
    renderPage();
  }
}

function renderPage() {
  if (
    window.location.pathname === "/index.html" ||
    window.location.pathname === "/"
  ) {
    nextButton.style.display = totalResults > 10 ? "block" : "none";
    prevButton.style.display = pageNumber > 1 ? "block" : "none";
    if (moviesArray) {
      renderMovies(moviesArray);
    }
    if (movieName) {
        movieInputElement.value = movieName;
    }
  }

  if (
    window.location.pathname === "/watchlist.html" ||
    window.location.pathname === "/watchlist"
  ) {
    if (watchlistArray) {
      renderMovies(watchlistArray);
    }
  }
}

const initializeFormEventListener = () => {
  movieSearchForm = document.getElementById("movie-search-form");
  movieInputElement = document.getElementById("movie-name");
  mainContent = document.getElementById("main-content");
  prevButton = document.getElementById("prev-btn");
  nextButton = document.getElementById("next-btn");
  watchlistArray = JSON.parse(localStorage.getItem("movie-watchlist") || "[]");

  movieSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    movieName = movieInputElement.value;
    searchMovie(movieName, pageNumber).catch(console.error);
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

  nextButton.addEventListener("click", (event) => {
    event.preventDefault();
    pageNumber++;
    totalResults -= 10;
    searchMovie(movieName, pageNumber).catch(console.error);
  });

  prevButton.addEventListener("click", (event) => {
    event.preventDefault();
    pageNumber--;
    totalResults += 10;
    searchMovie(movieName, pageNumber).catch(console.error);
  });
};

initializeFormEventListener();

swup.hooks.on("page:view", () => {
  initializeFormEventListener();
  renderPage();
});

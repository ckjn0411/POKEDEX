const popUp = document.querySelector(".pu-container");
const loadAll = document.getElementById("load-all");

loadAll.addEventListener("click", displayPokesList);
loadAll.addEventListener("click", renderButtonType);

document
  .getElementById("searching")
  .addEventListener("click", searchPokeByName);

let allPokeData = [];
let displayPokemon = [];

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Error: ", error);
    return null;
  }
}

async function fetchAllPokemon() {
  if (allPokeData.length === 0) {
    const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0";
    const allPokeList = await fetchData(apiUrl);
    if (!allPokeList) return false;

    allPokeData = await Promise.all(
      allPokeList.results.map((pokemon) => fetchData(pokemon.url))
    );

    allPokeData = allPokeData.filter((pokemon) => pokemon !== null);
    displayPokemon = [...allPokeData];
  }

  return true;
}

async function displayPokesList() {
  const success = await fetchAllPokemon();
  if (!success) return;

  pokeListElement.innerHTML = "";
  displayPokemon.forEach(renderPokemonCard);
}

async function searchPokeByName() {
  const success = await fetchAllPokemon();
  if (!success) return;

  let inputValue = document.querySelector(".search-poke").value.toLowerCase();
  // tìm
  displayPokemon = allPokeData.filter((pokemon) => {
    return pokemon.name.toLowerCase().includes(inputValue);
  });
  // xoa list r render lai
  pokeListElement.innerHTML = "";
  if (displayPokemon.length === 0) {
    pokeListElement.innerHTML = `
      <div class="not-found-message">
        <h2>No Pokémon found</h2>
      </div>
      `;
  } else {
    displayPokemon.forEach(renderPokemonCard);
  }
}

const pokeListElement = document.querySelector(".poke-list");
const renderPokemonCard = (pokemon) => {
  const pokeCard = document.createElement("div");
  pokeCard.classList.add("pokemon-card");
  pokeCard.setAttribute("data-id", pokemon.id);
  pokeCard.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <p>#${pokemon.id}</p>
    <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
    <div class="types">
      ${pokemon.types
        .map(
          (type) => `
          <span class="type ${type.type.name}">${capitalizeFirstLetter(
            type.type.name
          )}</span>`
        )
        .join("")} 
    </div>
  `;
  pokeListElement.appendChild(pokeCard);
};

// filter
async function renderButtonType() {
  const apiUrl = "https://pokeapi.co/api/v2/type";
  const types = await fetchData(apiUrl);
  if (!types) return false;

  const typeList = document.querySelector(".filter");

  typeList.innerHTML = `
    <label for="type" class="filter-label">Category</label>
    <select name="type" id="filter-type" class="select-type">
      ${types.results
        .slice()
        .map(
          (type) => `
            <option value="${type.name}">${capitalizeFirstLetter(
            type.name
          )}</option>
          `
        )
        .join("")}
    </select>
  `;
  document
    .querySelector(".select-type")
    .addEventListener("change", filterByType);
}

async function filterByType(event) {
  const success = await fetchAllPokemon();
  if (!success) return;

  const selectValue = event.target.value;

  displayPokemon = allPokeData.filter((pokemon) => {
    return pokemon.types.some((t) => t.type.name === selectValue);
  });

  // xoa list r render lai
  pokeListElement.innerHTML = "";
  if (displayPokemon.length === 0) {
    pokeListElement.innerHTML = `
      <div class="not-found-message">
        <h2>There are no Pokémon of this type</h2>
      </div>
      `;
  } else {
    displayPokemon.forEach(renderPokemonCard);
  }
}

// show info details
document.querySelector(".poke-list").addEventListener("click", (event) => {
  const card = event.target.closest(".pokemon-card");
  if (card) {
    const pokeId = card.dataset.id;
    const pokemon = allPokeData.find((poke) => poke.id == pokeId);
    if (pokemon) {
      const popUp = document.querySelector(".pu-container");
      popUp.classList.add("open");
      popUp.innerHTML = `
  <div class="info-block">
    <div class="block-top">
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    </div>
    <div class="block-bottom">
      <div class="info">
        <p class="id">#${pokemon.id}</p>
        <p class="name">${capitalizeFirstLetter(pokemon.name)}</p>
      </div>
      <div class="stats">
        <div class="row-top">
          ${pokemon.stats
            .slice(0, 3)
            .map(
              (stat) => `
                <div class="stat ${stat.stat.name}">
                  <div class="stat-title">${formatStatName(
                    stat.stat.name
                  )}</div>
                  <div class="stat-value">${stat.base_stat}</div>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="row-bt">
          ${pokemon.stats
            .slice(3, 6)
            .map(
              (stat) => `
                <div class="stat ${stat.stat.name}">
                  <div class="stat-title">${formatStatName(
                    stat.stat.name
                  )}</div>
                  <div class="stat-value">${stat.base_stat}</div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="info-more">
        <div class="weight">
          <span>Weight:</span>
          <span style="font-weight: 500">${pokemon.weight}</span>
        </div>
        <div class="types">
          <p style="margin: 1.2rem 0 0.8rem">Type</p>
          ${pokemon.types
            .map(
              (type) => `
                <span class="type ${type.type.name}" style="font-size: 1.6rem; font-weight: 400">${type.type.name}</span>
              `
            )
            .join(" ")}
        </div>
      </div>
    </div>
  </div>
  <button type="button" id="close">
      <img src="./assets/img/close.png" alt="" />
  </button>
`;
    }
  }
});

// Button close
popUp.addEventListener("click", (event) => {
  if (event.target.closest("#close")) {
    popUp.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    popUp.classList.remove("open");
  }
});

// utils
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatStatName = (statName) => {
  return statName
    .replace(/-/g, " ") // Thay thế tất cả dấu gạch nối bằng khoảng trắng
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Viết hoa chữ cái đầu mỗi từ
};

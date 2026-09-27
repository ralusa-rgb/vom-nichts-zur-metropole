const map = document.querySelector("#map");
const buildingsLayer = document.querySelector("#buildings");

const euro = n =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(n);

const num = n =>
  new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0
  }).format(n);

let game = {
  city: "Berlin",
  year: 2026,
  money: 10000000000,
  population: 3669000,
  gdp: 180000000000,
  unemployment: 0.09,
  satisfaction: 72,
  education: 65,
  health: 70,
  transport: 60,
  energyProduction: 12,
  energyConsumption: 10,

  buildings: [
    { type: "housing", x: 690, y: 430, district: "Zentrum" },
    { type: "housing", x: 750, y: 450, district: "Zentrum" },
    { type: "housing", x: 810, y: 420, district: "Zentrum" },
    { type: "industry", x: 710, y: 1020, district: "Süd" },
    { type: "industry", x: 790, y: 990, district: "Süd" },
    { type: "school", x: 280, y: 600, district: "West" },
    { type: "hospital", x: 930, y: 470, district: "Zentrum" },
    { type: "research", x: 330, y: 700, district: "West" },
    { type: "energy", x: 1300, y: 760, district: "Ost" }
  ]
};

const icons = {
  housing: "🏠",
  industry: "🏭",
  school: "🏫",
  hospital: "🏥",
  research: "🔬",
  energy: "⚡"
};

const names = {
  housing: "Wohnviertel",
  industry: "Industriepark",
  school: "Schule",
  hospital: "Krankenhaus",
  research: "Forschungszentrum",
  energy: "Solarkraftwerk"
};

const districts = {
  Zentrum: {
    description: "Dicht bebautes Stadtzentrum mit Verwaltung, Handel und Dienstleistungen."
  },
  Nord: {
    description: "Große Wohngebiete und neue Wohnbauflächen."
  },
  Süd: {
    description: "Industrie-, Logistik- und Energieflächen."
  },
  West: {
    description: "Universitäten, Forschung und wissensintensive Wirtschaft."
  },
  Ost: {
    description: "Neues Entwicklungsgebiet der Metropole."
  }
};

function updateUI() {
  document.querySelector("#year").textContent = game.year;
  document.querySelector("#money").textContent = euro(game.money);
  document.querySelector("#population").textContent = num(game.population);
  document.querySelector("#gdp").textContent = euro(game.gdp);

  document.querySelector("#energy").textContent =
    `${game.energyProduction.toFixed(1)} / ${game.energyConsumption.toFixed(1)} TWh`;

  document.querySelector("#cityName").textContent = game.city;
  document.querySelector("#unemployment").textContent =
    `${(game.unemployment * 100).toFixed(1)}%`;

  document.querySelector("#satisfaction").textContent =
    `${game.satisfaction.toFixed(0)}%`;

  document.querySelector("#education").textContent =
    game.education.toFixed(0);

  document.querySelector("#health").textContent =
    game.health.toFixed(0);

  document.querySelector("#transport").textContent =
    game.transport.toFixed(0);

  renderBuildings();
  renderProjects();
}

function renderBuildings() {
  buildingsLayer.innerHTML = "";

  game.buildings.forEach((building, index) => {
    const el = document.createElement("button");

    el.className = `building ${building.type}`;
    el.style.left = `${building.x}px`;
    el.style.top = `${building.y}px`;

    el.textContent = icons[building.type];
    el.title = `${names[building.type]} – ${building.district}`;

    el.addEventListener("click", event => {
      event.stopPropagation();

      showNotification(
        `${names[building.type]} · Bezirk ${building.district}`
      );
    });

    buildingsLayer.appendChild(el);
  });
}

function renderProjects() {
  const container = document.querySelector("#projects");

  const latest = game.buildings.slice(-5).reverse();

  if (!latest.length) {
    container.innerHTML = "<p>Keine Projekte vorhanden.</p>";
    return;
  }

  container.innerHTML = latest.map(building => `
    <div class="project-mini">
      <b>${icons[building.type]} ${names[building.type]}</b>
      <small>${building.district}</small>
    </div>
  `).join("");
}

function showDistrict(name) {
  const district = districts[name];

  document.querySelector("#overview").classList.add("hidden");
  document.querySelector("#districtPanel").classList.remove("hidden");

  document.querySelector("#districtTitle").textContent = name;
  document.querySelector("#districtDescription").textContent =
    district.description;

  const buildings = game.buildings.filter(
    b => b.district === name
  );

  document.querySelector("#districtBuildings").textContent =
    buildings.length;

  document.querySelector("#districtPopulation").textContent =
    num(Math.round(game.population / 5));

  document.querySelector("#districtJobs").textContent =
    num(buildings.filter(b => b.type === "industry").length * 8000);
}

document.querySelectorAll(".map-label").forEach(label => {
  label.addEventListener("click", () => {
    showDistrict(label.dataset.district);
  });
});

document.querySelector("#closeDistrict").addEventListener("click", () => {
  document.querySelector("#districtPanel").classList.add("hidden");
  document.querySelector("#overview").classList.remove("hidden");
});

document.querySelector("#nextYear").addEventListener("click", () => {
  advanceYear();
});

function advanceYear() {
  const taxes = game.gdp * 0.012;
  const expenses = game.gdp * 0.006;

  game.year++;

  game.gdp *=
    1.012 +
    ((game.education - 60) / 10000);

  game.money += taxes - expenses;

  game.population *=
    1.004 +
    ((game.satisfaction - 70) / 10000);

  game.unemployment =
    Math.max(
      0.025,
      game.unemployment - 0.001
    );

  game.energyConsumption *= 1.01;

  game.satisfaction +=
    game.energyProduction >= game.energyConsumption
      ? 0.5
      : -0.8;

  game.transport += 0.15;

  game.satisfaction =
    Math.max(
      0,
      Math.min(100, game.satisfaction)
    );

  updateUI();

  showNotification(`Das Jahr ${game.year} hat begonnen.`);
}

function openBuildMenu() {
  document.querySelector("#buildMenu")
    .classList.remove("hidden");
}

function closeBuildMenu() {
  document.querySelector("#buildMenu")
    .classList.add("hidden");
}

document.querySelector("#buildMode")
  .addEventListener("click", openBuildMenu);

document.querySelector("#closeBuild")
  .addEventListener("click", closeBuildMenu);

document.querySelectorAll(".build-option")
  .forEach(button => {

    button.addEventListener("click", () => {

      const type = button.dataset.type;
      const cost = Number(button.dataset.cost);

      if (game.money < cost) {
        showNotification("Nicht genug Geld für dieses Projekt.");
        return;
      }

      game.money -= cost;

      const position = getNewBuildingPosition();

      const district = getDistrictFromPosition(
        position.x,
        position.y
      );

      game.buildings.push({
        type,
        x: position.x,
        y: position.y,
        district
      });

      applyBuildingEffect(type);

      closeBuildMenu();
      updateUI();

      showNotification(
        `${names[type]} wurde in ${district} gebaut.`
      );
    });
  });

function applyBuildingEffect(type) {

  if (type === "housing") {
    game.population += 3000;
    game.satisfaction += 2;
  }

  if (type === "industry") {
    game.gdp += 800000000;
    game.energyConsumption += 0.8;
    game.transport -= 1;
  }

  if (type === "school") {
    game.education += 2;
  }

  if (type === "hospital") {
    game.health += 3;
  }

  if (type === "research") {
    game.education += 3;
    game.gdp += 250000000;
  }

  if (type === "energy") {
    game.energyProduction += 1.5;
  }

  game.education = Math.min(100, game.education);
  game.health = Math.min(100, game.health);
  game.satisfaction = Math.min(100, game.satisfaction);
}

function getNewBuildingPosition() {

  const zones = [
    { x: 650, y: 400 },
    { x: 850, y: 400 },
    { x: 650, y: 850 },
    { x: 850, y: 850 },
    { x: 250, y: 500 },
    { x: 300, y: 700 },
    { x: 1250, y: 500 },
    { x: 1300, y: 700 },
    { x: 700, y: 180 },
    { x: 850, y: 180 }
  ];

  const position =
    zones[
      Math.floor(Math.random() * zones.length)
    ];

  return {
    x: position.x + Math.floor(Math.random() * 80),
    y: position.y + Math.floor(Math.random() * 80)
  };
}

function getDistrictFromPosition(x, y) {

  if (x < 560) return "West";
  if (x > 1170) return "Ost";
  if (y < 360) return "Nord";
  if (y > 820) return "Süd";

  return "Zentrum";
}

function showNotification(text) {

  const notification =
    document.querySelector("#notification");

  notification.textContent = text;
  notification.classList.add("show");

  clearTimeout(window.notificationTimer);

  window.notificationTimer =
    setTimeout(() => {
      notification.classList.remove("show");
    }, 2200);
}

/* -------------------------
   ZOOM
------------------------- */

let zoom = 1;

function updateZoom() {
  map.style.transform =
    `translate(-50%, -50%) scale(${zoom})`;
}

document.querySelector("#zoomIn")
  .addEventListener("click", () => {
    zoom = Math.min(1.8, zoom + 0.15);
    updateZoom();
  });

document.querySelector("#zoomOut")
  .addEventListener("click", () => {
    zoom = Math.max(.65, zoom - 0.15);
    updateZoom();
  });

document.querySelector("#resetZoom")
  .addEventListener("click", () => {
    zoom = 1;
    updateZoom();
  });

/* -------------------------
   KARTENANSICHTEN
------------------------- */

function setMapMode(mode) {

  document.body.classList.remove(
    "mode-population",
    "mode-economy",
    "mode-energy"
  );

  if (mode === "population") {
    document.body.classList.add("mode-population");
  }

  if (mode === "economy") {
    document.body.classList.add("mode-economy");
  }

  if (mode === "energy") {
    document.body.classList.add("mode-energy");
  }

  document.querySelectorAll(".mode")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );
    });

  document.querySelectorAll(".tool")
    .forEach(button => {
      if (button.dataset.mode) {
        button.classList.toggle(
          "active",
          button.dataset.mode === mode
        );
      }
    });
}

document.querySelectorAll("[data-mode]")
  .forEach(button => {

    if (button.classList.contains("build-option"))
      return;

    button.addEventListener("click", () => {
      setMapMode(button.dataset.mode);
    });
  });

updateUI();
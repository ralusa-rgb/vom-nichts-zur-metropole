const app = document.querySelector("#app");

const cities = {
  Berlin: {
    population: 3669000,
    area: 891,
    gdp: 180e9,
    unemployment: 0.09
  },
  Hamburg: {
    population: 1900000,
    area: 755,
    gdp: 150e9,
    unemployment: 0.07
  },
  München: {
    population: 1600000,
    area: 311,
    gdp: 130e9,
    unemployment: 0.04
  },
  Köln: {
    population: 1100000,
    area: 405,
    gdp: 80e9,
    unemployment: 0.08
  },
  Frankfurt: {
    population: 780000,
    area: 248,
    gdp: 85e9,
    unemployment: 0.06
  },
  Stuttgart: {
    population: 640000,
    area: 207,
    gdp: 70e9,
    unemployment: 0.05
  },
  Leipzig: {
    population: 630000,
    area: 298,
    gdp: 25e9,
    unemployment: 0.08
  },
  Dresden: {
    population: 570000,
    area: 328,
    gdp: 24e9,
    unemployment: 0.07
  },
  Nürnberg: {
    population: 530000,
    area: 186,
    gdp: 28e9,
    unemployment: 0.06
  },
  Dortmund: {
    population: 610000,
    area: 281,
    gdp: 27e9,
    unemployment: 0.10
  }
};

const euro = n =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(n);

const number = n =>
  new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0
  }).format(n);

const percent = n =>
  `${(n * 100).toFixed(1)}%`;

let game = null;
let canvas = null;
let ctx = null;

const BUILDINGS = {
  house: {
    name: "Wohngebiet",
    icon: "🏠",
    cost: 500e6,
    size: 42,
    housing: 10000,
    population: 3000
  },

  industry: {
    name: "Industriepark",
    icon: "🏭",
    cost: 1e9,
    size: 58,
    jobs: 8000,
    gdp: 800e6,
    energy: 0.8,
    transport: -1
  },

  school: {
    name: "Schule",
    icon: "🏫",
    cost: 30e6,
    size: 48,
    education: 2
  },

  hospital: {
    name: "Krankenhaus",
    icon: "🏥",
    cost: 500e6,
    size: 55,
    health: 3
  },

  station: {
    name: "Bahnhof",
    icon: "🚉",
    cost: 300e6,
    size: 58,
    transport: 4
  },

  energy: {
    name: "Solarkraftwerk",
    icon: "☀️",
    cost: 1e9,
    size: 55,
    energyProduction: 1.5
  },

  research: {
    name: "Forschungszentrum",
    icon: "🔬",
    cost: 500e6,
    size: 52,
    education: 3,
    gdp: 50e6
  },

  road: {
    name: "Straße",
    icon: "🛣️",
    cost: 10e6,
    size: 0
  }
};

/* =========================
   START SCREEN
========================= */

function renderStart() {
  app.innerHTML = `
    <div class="start-screen">
      <div class="start-card">

        <div class="logo">
          Vom Nichts zur Metropole
        </div>

        <div class="subtitle">
          Baue eine deutsche Stadt von Grund auf aus.
          Entwickle Wirtschaft, Bevölkerung, Infrastruktur,
          Energie, Bildung und Lebensqualität über Jahrzehnte.
        </div>

        <div class="form-grid">

          <label class="form-field full">
            <span>Startstadt</span>
            <select id="citySelect">
              ${Object.keys(cities)
                .map(city =>
                  `<option value="${city}">${city}</option>`
                )
                .join("")}
            </select>
          </label>

          <label class="form-field">
            <span>Privates Startvermögen</span>
            <select id="capitalSelect">
              <option value="1e9">1 Mrd. €</option>
              <option value="1e10">10 Mrd. €</option>
              <option value="1e11">100 Mrd. €</option>
              <option value="3e11">300 Mrd. €</option>
            </select>
          </label>

          <label class="form-field">
            <span>Jährliches Budget</span>
            <select id="budgetSelect">
              <option value="5e8">500 Mio. €</option>
              <option value="2e9">2 Mrd. €</option>
              <option value="5e9">5 Mrd. €</option>
              <option value="1e10">10 Mrd. €</option>
            </select>
          </label>

          <label class="form-field full">
            <span>Schwierigkeit</span>
            <select id="difficultySelect">
              <option value="normal">Normal</option>
              <option value="hard">Schwer</option>
              <option value="extreme">Extrem</option>
            </select>
          </label>

        </div>

        <div id="cityPreview" class="city-preview"></div>

        <button id="startButton" class="primary">
          Stadt gründen
        </button>

      </div>
    </div>
  `;

  const updatePreview = () => {
    const city =
      cities[
        document.querySelector("#citySelect").value
      ];

    document.querySelector("#cityPreview").innerHTML = `
      <h3>Ausgangslage</h3>

      <div class="preview-grid">

        <div class="preview-stat">
          <small>Einwohner</small>
          <strong>${number(city.population)}</strong>
        </div>

        <div class="preview-stat">
          <small>Fläche</small>
          <strong>${number(city.area)} km²</strong>
        </div>

        <div class="preview-stat">
          <small>BIP</small>
          <strong>${euro(city.gdp)}</strong>
        </div>

        <div class="preview-stat">
          <small>Arbeitslosigkeit</small>
          <strong>${percent(city.unemployment)}</strong>
        </div>

      </div>
    `;
  };

  document
    .querySelector("#citySelect")
    .addEventListener("change", updatePreview);

  updatePreview();

  document
    .querySelector("#startButton")
    .addEventListener("click", startGame);
}

/* =========================
   GAME CREATION
========================= */

function startGame() {
  const cityName =
    document.querySelector("#citySelect").value;

  const city = cities[cityName];

  game = {
    city: cityName,
    year: 2026,

    population: city.population,
    gdp: city.gdp,
    unemployment: city.unemployment,

    money: Number(
      document.querySelector("#capitalSelect").value
    ),

    budget: Number(
      document.querySelector("#budgetSelect").value
    ),

    debt: 0,

    housing:
      Math.round(city.population * 0.52),

    jobs:
      Math.round(
        city.population *
        (1 - city.unemployment) *
        0.55
      ),

    satisfaction: 72,
    education: 65,
    health: 70,

    energyProduction: 12,
    energyConsumption: 10,

    transport: 60,

    buildings: [],
    roads: [],

    selectedTool: "select",

    camera: {
      x: 0,
      y: 0,
      zoom: 1
    },

    dragging: false,
    lastMouseX: 0,
    lastMouseY: 0,

    selectedBuilding: null,

    notifications: []
  };

  createInitialCity();
  renderGame();
}

/* =========================
   INITIAL MAP
========================= */

function createInitialCity() {
  game.buildings = [];
  game.roads = [];

  /*
    Wohngebiet
  */

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      game.buildings.push({
        id: crypto.randomUUID(),
        type: "house",
        x: 290 + col * 58,
        y: 250 + row * 55,
        level: 1
      });
    }
  }

  /*
    Ausgangsinfrastruktur
  */

  game.buildings.push({
    id: crypto.randomUUID(),
    type: "school",
    x: 800,
    y: 250,
    level: 1
  });

  game.buildings.push({
    id: crypto.randomUUID(),
    type: "hospital",
    x: 820,
    y: 500,
    level: 1
  });

  game.buildings.push({
    id: crypto.randomUUID(),
    type: "station",
    x: 470,
    y: 560,
    level: 1
  });

  /*
    Hauptstraßen
  */

  game.roads.push({
    x1: 100,
    y1: 500,
    x2: 1100,
    y2: 500
  });

  game.roads.push({
    x1: 500,
    y1: 100,
    x2: 500,
    y2: 800
  });

  game.roads.push({
    x1: 200,
    y1: 250,
    x2: 900,
    y2: 250
  });
}

/* =========================
   MAIN UI
========================= */

function renderGame() {
  app.innerHTML = `
    <div class="game">

      <header class="topbar">

        <div class="brand">
          VOM NICHTS ZUR METROPOLE
          <small>${game.city}</small>
        </div>

        <div class="top-stats">

          <div class="top-stat">
            <small>Einwohner</small>
            <strong>${number(game.population)}</strong>
          </div>

          <div class="top-stat">
            <small>BIP</small>
            <strong>${euro(game.gdp)}</strong>
          </div>

          <div class="top-stat">
            <small>Geld</small>
            <strong>${euro(game.money)}</strong>
          </div>

          <div class="top-stat">
            <small>Zufriedenheit</small>
            <strong>${game.satisfaction.toFixed(0)}%</strong>
          </div>

        </div>

        <div class="year-controls">

          <button
            class="icon-btn"
            id="pauseButton">
            ▶
          </button>

          <div class="year">
            ${game.year}
          </div>

          <button
            class="speed-btn"
            id="nextYearButton">
            Nächstes Jahr
          </button>

        </div>

      </header>

      <div class="game-body">

        <aside class="sidebar">

          ${navItems()}

        </aside>

        <main class="main-area">

          <canvas id="cityMap"></canvas>

          <div class="map-label">
            <h1>${game.city}</h1>
            <span>Stadtgebiet · Jahr ${game.year}</span>
          </div>

          <div class="map-controls">

            <button
              class="map-control"
              id="zoomIn">
              +
            </button>

            <button
              class="map-control"
              id="zoomOut">
              −
            </button>

            <button
              class="map-control"
              id="resetCamera">
              ⌂
            </button>

          </div>

          <div
            id="inspector"
            class="inspector">
          </div>

          <div
            id="notifications"
            class="notifications">
          </div>

          <div class="build-menu">
            ${buildTools()}
          </div>

        </main>

      </div>

    </div>
  `;

  canvas =
    document.querySelector("#cityMap");

  ctx =
    canvas.getContext("2d");

  setupEvents();
  resizeCanvas();
  drawMap();
  renderNotifications();
}

/* =========================
   NAV
========================= */

function navItems() {
  const items = [
    ["🏙️", "Übersicht"],
    ["👥", "Bevölkerung"],
    ["💶", "Finanzen"],
    ["🏭", "Wirtschaft"],
    ["🚧", "Bauen"],
    ["🚇", "Verkehr"],
    ["⚡", "Energie"],
    ["🎓", "Bildung"],
    ["🏥", "Gesundheit"],
    ["🔬", "Forschung"],
    ["🗺️", "Karte"]
  ];

  return items
    .map(
      ([icon, label], index) => `
        <button
          class="nav-item ${index === 0 ? "active" : ""}"
          title="${label}">
          <span class="nav-icon">${icon}</span>
          ${label}
        </button>
      `
    )
    .join("");
}

/* =========================
   BUILD TOOLS
========================= */

function buildTools() {
  const types = [
    "house",
    "industry",
    "school",
    "hospital",
    "station",
    "energy",
    "research",
    "road"
  ];

  return types
    .map(type => {
      const b = BUILDINGS[type];

      return `
        <button
          class="build-tool"
          data-tool="${type}">

          <span>${b.icon}</span>

          ${b.name}

          <div class="tool-price">
            ${euro(b.cost)}
          </div>

        </button>
      `;
    })
    .join("");
}

/* =========================
   EVENTS
========================= */

function setupEvents() {

  window.addEventListener(
    "resize",
    resizeCanvas
  );

  document
    .querySelector("#zoomIn")
    .addEventListener(
      "click",
      () => {
        game.camera.zoom =
          Math.min(
            3,
            game.camera.zoom + 0.2
          );

        drawMap();
      }
    );

  document
    .querySelector("#zoomOut")
    .addEventListener(
      "click",
      () => {
        game.camera.zoom =
          Math.max(
            0.5,
            game.camera.zoom - 0.2
          );

        drawMap();
      }
    );

  document
    .querySelector("#resetCamera")
    .addEventListener(
      "click",
      () => {

        game.camera = {
          x: 0,
          y: 0,
          zoom: 1
        };

        drawMap();
      }
    );

  document
    .querySelector("#nextYearButton")
    .addEventListener(
      "click",
      nextYear
    );

  document
    .querySelectorAll("[data-tool]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          game.selectedTool =
            button.dataset.tool;

          document
            .querySelectorAll(
              ".build-tool"
            )
            .forEach(b =>
              b.classList.remove(
                "active"
              )
            );

          button.classList.add(
            "active"
          );
        }
      );
    });

  canvas.addEventListener(
    "mousedown",
    event => {

      game.dragging = true;

      game.lastMouseX =
        event.clientX;

      game.lastMouseY =
        event.clientY;
    }
  );

  window.addEventListener(
    "mouseup",
    () => {
      game.dragging = false;
    }
  );

  window.addEventListener(
    "mousemove",
    event => {

      if (!game.dragging)
        return;

      game.camera.x +=
        event.clientX -
        game.lastMouseX;

      game.camera.y +=
        event.clientY -
        game.lastMouseY;

      game.lastMouseX =
        event.clientX;

      game.lastMouseY =
        event.clientY;

      drawMap();
    }
  );

  canvas.addEventListener(
    "click",
    handleMapClick
  );
}

/* =========================
   CANVAS
========================= */

function resizeCanvas() {

  if (!canvas)
    return;

  const rect =
    canvas.getBoundingClientRect();

  canvas.width =
    Math.max(
      1,
      Math.floor(rect.width * devicePixelRatio)
    );

  canvas.height =
    Math.max(
      1,
      Math.floor(rect.height * devicePixelRatio)
    );

  ctx.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );

  drawMap();
}

/* =========================
   MAP
========================= */

function drawMap() {

  if (!canvas || !ctx)
    return;

  const width =
    canvas.clientWidth;

  const height =
    canvas.clientHeight;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  /*
    Landschaft
  */

  ctx.fillStyle = "#78966c";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  drawWater(
    width,
    height
  );

  ctx.save();

  ctx.translate(
    width / 2 + game.camera.x,
    height / 2 + game.camera.y
  );

  ctx.scale(
    game.camera.zoom,
    game.camera.zoom
  );

  ctx.translate(
    -600,
    -450
  );

  drawTerrain();
  drawRoads();
  drawBuildings();

  ctx.restore();

  drawScale(width, height);
}

/* =========================
   TERRAIN
========================= */

function drawTerrain() {

  /*
    dezentes Stadtgebiet
  */

  ctx.fillStyle =
    "rgba(220,220,190,.10)";

  ctx.fillRect(
    120,
    100,
    950,
    700
  );

  /*
    Straßenblöcke
  */

  ctx.strokeStyle =
    "rgba(255,255,255,.08)";

  ctx.lineWidth = 1;

  for (
    let x = 100;
    x < 1150;
    x += 50
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 100);
    ctx.lineTo(x, 800);

    ctx.stroke();
  }

  for (
    let y = 100;
    y < 800;
    y += 50
  ) {

    ctx.beginPath();

    ctx.moveTo(100, y);
    ctx.lineTo(1150, y);

    ctx.stroke();
  }
}

/* =========================
   WATER
========================= */

function drawWater(width, height) {

  ctx.save();

  ctx.fillStyle =
    "rgba(68,133,177,.9)";

  ctx.beginPath();

  ctx.moveTo(
    width * .76,
    0
  );

  ctx.bezierCurveTo(
    width * .62,
    height * .2,
    width * .85,
    height * .4,
    width * .69,
    height * .58
  );

  ctx.bezierCurveTo(
    width * .57,
    height * .75,
    width * .75,
    height * .87,
    width * .63,
    height
  );

  ctx.lineTo(
    width,
    height
  );

  ctx.lineTo(
    width,
    0
  );

  ctx.closePath();

  ctx.fill();

  ctx.restore();
}

/* =========================
   ROADS
========================= */

function drawRoads() {

  for (const road of game.roads) {

    ctx.lineCap = "round";

    ctx.strokeStyle =
      "#45484b";

    ctx.lineWidth = 28;

    ctx.beginPath();

    ctx.moveTo(
      road.x1,
      road.y1
    );

    ctx.lineTo(
      road.x2,
      road.y2
    );

    ctx.stroke();

    ctx.strokeStyle =
      "#c8c4a9";

    ctx.lineWidth = 2;

    ctx.setLineDash([
      12,
      10
    ]);

    ctx.beginPath();

    ctx.moveTo(
      road.x1,
      road.y1
    );

    ctx.lineTo(
      road.x2,
      road.y2
    );

    ctx.stroke();

    ctx.setLineDash([]);
  }
}

/* =========================
   BUILDINGS
========================= */

function drawBuildings() {

  for (const building of game.buildings) {

    const data =
      BUILDINGS[building.type];

    if (!data)
      continue;

    const size =
      data.size;

    /*
      Schatten
    */

    ctx.fillStyle =
      "rgba(0,0,0,.20)";

    ctx.fillRect(
      building.x + 7,
      building.y + 8,
      size,
      size
    );

    /*
      Gebäude
    */

    let buildingColor =
      "#c8c5bb";

    if (
      building.type === "house"
    )
      buildingColor =
        "#b99373";

    if (
      building.type === "industry"
    )
      buildingColor =
        "#686d72";

    if (
      building.type === "school"
    )
      buildingColor =
        "#d1b36c";

    if (
      building.type === "hospital"
    )
      buildingColor =
        "#d7d7d7";

    if (
      building.type === "station"
    )
      buildingColor =
        "#9a9da1";

    if (
      building.type === "energy"
    )
      buildingColor =
        "#d0b84d";

    if (
      building.type === "research"
    )
      buildingColor =
        "#a7c5d7";

    ctx.fillStyle =
      buildingColor;

    ctx.fillRect(
      building.x,
      building.y,
      size,
      size
    );

    /*
      Auswahl
    */

    if (
      game.selectedBuilding ===
      building.id
    ) {

      ctx.strokeStyle =
        "#ffffff";

      ctx.lineWidth = 3;

      ctx.strokeRect(
        building.x - 3,
        building.y - 3,
        size + 6,
        size + 6
      );
    }

    /*
      Icon
    */

    ctx.font =
      `${Math.max(
        18,
        size * .52
      )}px Arial`;

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      data.icon,
      building.x + size / 2,
      building.y + size / 2
    );

    ctx.textAlign =
      "left";

    ctx.textBaseline =
      "alphabetic";
  }
}

/* =========================
   SCALE
========================= */

function drawScale() {

  const width =
    canvas.clientWidth;

  const height =
    canvas.clientHeight;

  ctx.fillStyle =
    "rgba(15,20,24,.75)";

  ctx.fillRect(
    width - 120,
    height - 35,
    95,
    22
  );

  ctx.fillStyle =
    "white";

  ctx.font =
    "11px sans-serif";

  ctx.fillText(
    "1 km",
    width - 80,
    height - 20
  );
}

/* =========================
   COORDINATES
========================= */

function screenToWorld(event) {

  const rect =
    canvas.getBoundingClientRect();

  const screenX =
    event.clientX -
    rect.left;

  const screenY =
    event.clientY -
    rect.top;

  return {
    x:
      (
        screenX -
        canvas.clientWidth / 2 -
        game.camera.x
      ) /
        game.camera.zoom +
      600,

    y:
      (
        screenY -
        canvas.clientHeight / 2 -
        game.camera.y
      ) /
        game.camera.zoom +
      450
  };
}

/* =========================
   MAP CLICK
========================= */

function handleMapClick(event) {

  /*
    Nicht bauen, wenn gerade
    die Karte verschoben wurde.
  */

  if (
    Math.abs(
      event.clientX -
      game.lastMouseX
    ) > 5
  )
    return;

  if (
    Math.abs(
      event.clientY -
      game.lastMouseY
    ) > 5
  )
    return;

  const pos =
    screenToWorld(event);

  /*
    Auswahl
  */

  if (
    game.selectedTool ===
    "select"
  ) {

    let selected = null;

    for (
      let i =
        game.buildings.length - 1;
      i >= 0;
      i--
    ) {

      const b =
        game.buildings[i];

      const data =
        BUILDINGS[b.type];

      if (
        pos.x >= b.x &&
        pos.x <=
          b.x + data.size &&
        pos.y >= b.y &&
        pos.y <=
          b.y + data.size
      ) {

        selected = b;
        break;
      }
    }

    game.selectedBuilding =
      selected
        ? selected.id
        : null;

    renderInspector(
      selected
    );

    drawMap();

    return;
  }

  /*
    Bauen
  */

  buildAt(
    game.selectedTool,
    pos.x,
    pos.y
  );
}

/* =========================
   BUILD
========================= */

function buildAt(
  type,
  x,
  y
) {

  const data =
    BUILDINGS[type];

  if (!data)
    return;

  if (
    game.money <
    data.cost
  ) {

    notify(
      "Nicht genug Geld.",
      "error"
    );

    return;
  }

  game.money -=
    data.cost;

  /*
    Straße
  */

  if (type === "road") {

    game.roads.push({
      x1: x - 100,
      y1: y,
      x2: x + 100,
      y2: y
    });

    notify(
      "Straße gebaut.",
      "success"
    );

    renderGame();

    return;
  }

  /*
    Gebäude
  */

  const building = {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    level: 1
  };

  game.buildings.push(
    building
  );

  applyBuildingEffects(
    type
  );

  game.selectedBuilding =
    building.id;

  notify(
    `${data.name} gebaut.`,
    "success"
  );

  renderGame();

  renderInspector(
    building
  );
}

/* =========================
   EFFECTS
========================= */

function applyBuildingEffects(
  type
) {

  const data =
    BUILDINGS[type];

  if (data.housing)
    game.housing +=
      data.housing;

  if (data.population)
    game.population +=
      data.population;

  if (data.jobs)
    game.jobs +=
      data.jobs;

  if (data.gdp)
    game.gdp +=
      data.gdp;

  if (data.energy)
    game.energyConsumption +=
      data.energy;

  if (data.energyProduction)
    game.energyProduction +=
      data.energyProduction;

  if (data.transport)
    game.transport +=
      data.transport;

  if (data.education)
    game.education +=
      data.education;

  if (data.health)
    game.health +=
      data.health;

  game.education =
    Math.min(
      100,
      game.education
    );

  game.health =
    Math.min(
      100,
      game.health
    );

  game.transport =
    Math.max(
      0,
      Math.min(
        100,
        game.transport
      )
    );
}

/* =========================
   INSPECTOR
========================= */

function renderInspector(
  building
) {

  const panel =
    document.querySelector(
      "#inspector"
    );

  if (!panel)
    return;

  if (!building) {

    panel.classList.remove(
      "visible"
    );

    return;
  }

  const data =
    BUILDINGS[building.type];

  panel.classList.add(
    "visible"
  );

  panel.innerHTML = `
    <button
      class="inspector-close"
      id="closeInspector">
      ×
    </button>

    <h2>
      ${data.icon}
      ${data.name}
    </h2>

    <div class="inspector-sub">
      Stadtgebiet ${game.city}
    </div>

    <div class="inspector-row">
      <span>Stufe</span>
      <strong>${building.level}</strong>
    </div>

    <div class="inspector-row">
      <span>Baukosten</span>
      <strong>${euro(data.cost)}</strong>
    </div>

    ${
      data.jobs
        ? `
          <div class="inspector-row">
            <span>Arbeitsplätze</span>
            <strong>+${number(data.jobs)}</strong>
          </div>
        `
        : ""
    }

    ${
      data.housing
        ? `
          <div class="inspector-row">
            <span>Wohnraum</span>
            <strong>+${number(data.housing)}</strong>
          </div>
        `
        : ""
    }

    ${
      data.energyProduction
        ? `
          <div class="inspector-row">
            <span>Energieproduktion</span>
            <strong>
              +${data.energyProduction} TWh
            </strong>
          </div>
        `
        : ""
    }

    <div class="info-card">
      Dieses Gebäude beeinflusst die
      Entwicklung deiner Stadt.
      Seine Auswirkungen werden jedes
      Jahr in die Simulation übernommen.
    </div>
  `;

  document
    .querySelector("#closeInspector")
    .addEventListener(
      "click",
      () => {

        game.selectedBuilding =
          null;

        panel.classList.remove(
          "visible"
        );

        drawMap();
      }
    );
}

/* =========================
   YEAR
========================= */

function nextYear() {

  const taxRevenue =
    game.gdp * 0.012;

  const expenses =
    game.budget * 0.82;

  /*
    Wirtschaft
  */

  const economicGrowth =
    0.012 +
    (game.education - 60) /
      10000;

  game.gdp *=
    1 + economicGrowth;

  /*
    Finanzen
  */

  game.money +=
    taxRevenue -
    expenses;

  /*
    Bevölkerung
  */

  const housingPressure =
    game.housing /
    Math.max(
      1,
      game.population
    );

  const migration =
    (game.satisfaction - 70) /
      10000;

  game.population *=
    1 +
    0.004 +
    migration +
    (
      housingPressure < .5
        ? -.002
        : .001
    );

  /*
    Arbeitsplätze
  */

  game.jobs *=
    1.008;

  /*
    Arbeitslosigkeit
  */

  game.unemployment =
    Math.max(
      0.025,
      game.unemployment -
        0.001
    );

  /*
    Energie
  */

  game.energyConsumption *=
    1.01;

  if (
    game.energyProduction <
    game.energyConsumption
  ) {

    game.satisfaction -=
      2;

    game.gdp *=
      .995;

    notify(
      "Energieknappheit belastet die Wirtschaft.",
      "error"
    );

  } else {

    game.satisfaction +=
      .2;
  }

  /*
    Wohnraum
  */

  if (
    game.housing <
    game.population * .5
  ) {

    game.satisfaction -=
      1;

    notify(
      "Wohnraummangel steigt.",
      "warning"
    );
  }

  /*
    Lebensqualität
  */

  game.satisfaction +=
    (
      game.health -
      70
    ) / 1000;

  game.satisfaction +=
    (
      game.transport -
      60
    ) / 1000;

  game.satisfaction =
    Math.max(
      0,
      Math.min(
        100,
        game.satisfaction
      )
    );

  /*
    Jahr
  */

  game.year++;

  notify(
    `Das Jahr ${game.year} hat begonnen.`,
    "success"
  );

  renderGame();
}

/* =========================
   NOTIFICATIONS
========================= */

function notify(
  message,
  type = "info"
) {

  game.notifications.unshift({
    message,
    type
  });

  game.notifications =
    game.notifications.slice(
      0,
      5
    );

  renderNotifications();
}

function renderNotifications() {

  const container =
    document.querySelector(
      "#notifications"
    );

  if (!container)
    return;

  container.innerHTML =
    game.notifications
      .map(
        notification => `
          <div class="notification">
            ${notification.message}
          </div>
        `
      )
      .join("");
}

/* =========================
   START
========================= */

renderStart();
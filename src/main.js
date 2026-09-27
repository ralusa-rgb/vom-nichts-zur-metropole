const app = document.querySelector("#app");

const cities = {
  Berlin: { population: 3669000, area: 891, gdp: 180e9, unemployment: 0.09 },
  Hamburg: { population: 1900000, area: 755, gdp: 150e9, unemployment: 0.07 },
  München: { population: 1600000, area: 311, gdp: 130e9, unemployment: 0.04 },
  Köln: { population: 1100000, area: 405, gdp: 80e9, unemployment: 0.08 },
  Frankfurt: { population: 780000, area: 248, gdp: 85e9, unemployment: 0.06 },
  Stuttgart: { population: 640000, area: 207, gdp: 70e9, unemployment: 0.05 },
  Leipzig: { population: 630000, area: 298, gdp: 25e9, unemployment: 0.08 },
  Dresden: { population: 570000, area: 328, gdp: 24e9, unemployment: 0.07 },
  Nürnberg: { population: 530000, area: 186, gdp: 28e9, unemployment: 0.06 },
  Dortmund: { population: 610000, area: 281, gdp: 27e9, unemployment: 0.10 }
};

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

let game = null;

/* =========================
   START
========================= */

function startScreen() {
  app.innerHTML = `
    <div class="start">
      <h1>Vom Nichts zur Metropole</h1>

      <p>
        Baue eine deutsche Stadt über Jahrzehnte
        zu einer modernen Metropole aus.
      </p>

      <label>
        Startstadt
        <select id="city">
          ${Object.keys(cities)
            .map(c => `<option value="${c}">${c}</option>`)
            .join("")}
        </select>
      </label>

      <div id="cityInfo" class="panel"></div>

      <label>
        Privates Startvermögen
        <select id="capital">
          <option value="1000000000">1 Mrd. €</option>
          <option value="10000000000">10 Mrd. €</option>
          <option value="100000000000">100 Mrd. €</option>
          <option value="300000000000">300 Mrd. €</option>
        </select>
      </label>

      <label>
        Öffentliches Jahresbudget
        <select id="budget">
          <option value="500000000">500 Mio. €</option>
          <option value="2000000000">2 Mrd. €</option>
          <option value="5000000000">5 Mrd. €</option>
          <option value="10000000000">10 Mrd. €</option>
        </select>
      </label>

      <label>
        Schwierigkeit
        <select id="difficulty">
          <option value="normal">Normal</option>
          <option value="hard">Schwer</option>
          <option value="extreme">Extrem</option>
        </select>
      </label>

      <button id="startGame">
        Stadt gründen
      </button>
    </div>
  `;

  const updateCity = () => {
    const city = document.querySelector("#city").value;
    const c = cities[city];

    document.querySelector("#cityInfo").innerHTML = `
      <h3>Ausgangslage</h3>
      <p>Einwohner: <b>${num(c.population)}</b></p>
      <p>Fläche: <b>${num(c.area)} km²</b></p>
      <p>Wirtschaftsleistung: <b>${euro(c.gdp)}</b></p>
      <p>Arbeitslosigkeit: <b>${(c.unemployment * 100).toFixed(1)}%</b></p>
    `;
  };

  document
    .querySelector("#city")
    .addEventListener("change", updateCity);

  updateCity();

  document
    .querySelector("#startGame")
    .addEventListener("click", () => {

      const cityName =
        document.querySelector("#city").value;

      const c = cities[cityName];

      game = {
        city: cityName,
        year: 2026,

        population: c.population,
        gdp: c.gdp,
        unemployment: c.unemployment,

        money:
          Number(document.querySelector("#capital").value),

        budget:
          Number(document.querySelector("#budget").value),

        debt: 0,

        housing:
          Math.round(c.population * 0.52),

        satisfaction: 72,
        education: 65,
        health: 70,

        energyProduction: 12,
        energyConsumption: 10,

        transport: 60,

        jobs:
          Math.round(
            c.population *
            (1 - c.unemployment) *
            0.55
          ),

        buildings: [],
        roads: [],

        selectedTool: "select",

        camera: {
          x: 0,
          y: 0,
          zoom: 1
        }
      };

      createInitialCity();
      dashboard();
    });
}

/* =========================
   INITIAL CITY
========================= */

function createInitialCity() {

  game.buildings = [];

  /*
   Kleine Ausgangsstadt.
   Die Gebäude werden auf der Karte
   tatsächlich gezeichnet.
  */

  for (let i = 0; i < 25; i++) {

    game.buildings.push({
      id: crypto.randomUUID(),
      type: "house",
      x: 350 + (i % 5) * 70,
      y: 250 + Math.floor(i / 5) * 65,
      level: 1
    });
  }

  game.buildings.push({
    id: crypto.randomUUID(),
    type: "school",
    x: 700,
    y: 300,
    level: 1
  });

  game.buildings.push({
    id: crypto.randomUUID(),
    type: "hospital",
    x: 800,
    y: 450,
    level: 1
  });

  game.buildings.push({
    id: crypto.randomUUID(),
    type: "station",
    x: 500,
    y: 600,
    level: 1
  });

  game.roads = [
    {
      x1: 100,
      y1: 500,
      x2: 1100,
      y2: 500
    },
    {
      x1: 500,
      y1: 100,
      x2: 500,
      y2: 800
    }
  ];
}

/* =========================
   DASHBOARD
========================= */

function dashboard() {

  app.innerHTML = `
    <div class="game">

      <header class="topbar">

        <div>
          <strong>
            VOM NICHTS ZUR METROPOLE
          </strong>

          <span>
            ${game.city}
          </span>
        </div>

        <div class="year">
          Jahr ${game.year}
        </div>

        <button id="nextYear">
          Jahr abschließen →
        </button>

      </header>

      <div class="game-layout">

        <aside class="sidebar">

          ${[
            "Übersicht",
            "Bevölkerung",
            "Finanzen",
            "Wirtschaft",
            "Bauen",
            "Verkehr",
            "Energie",
            "Bildung",
            "Gesundheit",
            "Forschung",
            "Karte"
          ]
            .map(
              x =>
                `<button class="side-button">${x}</button>`
            )
            .join("")}

        </aside>

        <main class="main">

          <div class="stats">

            <div>
              <small>BEVÖLKERUNG</small>
              <b>${num(game.population)}</b>
            </div>

            <div>
              <small>BIP</small>
              <b>${euro(game.gdp)}</b>
            </div>

            <div>
              <small>BIP / KOPF</small>
              <b>${euro(game.gdp / game.population)}</b>
            </div>

            <div>
              <small>VERMÖGEN</small>
              <b>${euro(game.money)}</b>
            </div>

            <div>
              <small>SCHULDEN</small>
              <b>${euro(game.debt)}</b>
            </div>

            <div>
              <small>ARBEITSLOSIGKEIT</small>
              <b>
                ${(game.unemployment * 100).toFixed(1)}%
              </b>
            </div>

          </div>

          <div class="city-view">

            <div class="map-toolbar">

              <button data-tool="select">
                👆 Auswahl
              </button>

              <button data-tool="house">
                🏠 Wohngebiet
              </button>

              <button data-tool="industry">
                🏭 Industrie
              </button>

              <button data-tool="school">
                🏫 Schule
              </button>

              <button data-tool="hospital">
                🏥 Krankenhaus
              </button>

              <button data-tool="station">
                🚉 Bahnhof
              </button>

              <button data-tool="energy">
                ⚡ Kraftwerk
              </button>

              <button data-tool="research">
                🔬 Forschung
              </button>

              <button data-tool="road">
                🛣 Straße
              </button>

              <button id="zoomOut">
                −
              </button>

              <button id="zoomIn">
                +
              </button>

            </div>

            <canvas id="cityMap"></canvas>

            <div
              id="buildingInfo"
              class="building-info hidden">
            </div>

          </div>

        </main>

      </div>

    </div>
  `;

  document
    .querySelector("#nextYear")
    .addEventListener("click", nextYear);

  document
    .querySelectorAll("[data-tool]")
    .forEach(button => {

      button.addEventListener("click", () => {

        game.selectedTool =
          button.dataset.tool;

      });

    });

  document
    .querySelector("#zoomIn")
    .addEventListener("click", () => {

      game.camera.zoom =
        Math.min(
          3,
          game.camera.zoom + 0.2
        );

      drawMap();

    });

  document
    .querySelector("#zoomOut")
    .addEventListener("click", () => {

      game.camera.zoom =
        Math.max(
          0.5,
          game.camera.zoom - 0.2
        );

      drawMap();

    });

  setupCanvas();

  drawMap();
}

/* =========================
   CANVAS
========================= */

let canvas;
let ctx;

function setupCanvas() {

  canvas =
    document.querySelector("#cityMap");

  ctx =
    canvas.getContext("2d");

  resizeCanvas();

  window.addEventListener(
    "resize",
    resizeCanvas
  );

  canvas.addEventListener(
    "click",
    handleMapClick
  );

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener(
    "mousedown",
    e => {

      dragging = true;

      lastX = e.clientX;
      lastY = e.clientY;
    }
  );

  window.addEventListener(
    "mouseup",
    () => {
      dragging = false;
    }
  );

  window.addEventListener(
    "mousemove",
    e => {

      if (!dragging)
        return;

      game.camera.x +=
        e.clientX - lastX;

      game.camera.y +=
        e.clientY - lastY;

      lastX = e.clientX;
      lastY = e.clientY;

      drawMap();
    }
  );
}

function resizeCanvas() {

  if (!canvas)
    return;

  canvas.width =
    canvas.clientWidth ||
    1000;

  canvas.height =
    canvas.clientHeight ||
    650;

  drawMap();
}

/* =========================
   MAP DRAWING
========================= */

function drawMap() {

  if (!canvas || !ctx)
    return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(
    0,
    0,
    w,
    h
  );

  /*
   Landschaft
  */

  ctx.fillStyle = "#7fa36d";

  ctx.fillRect(
    0,
    0,
    w,
    h
  );

  /*
   Wasser
  */

  ctx.fillStyle = "#5c91bd";

  ctx.beginPath();

  ctx.moveTo(
    w * 0.72,
    0
  );

  ctx.bezierCurveTo(
    w * 0.65,
    h * 0.2,
    w * 0.78,
    h * 0.35,
    w * 0.68,
    h * 0.55
  );

  ctx.bezierCurveTo(
    w * 0.58,
    h * 0.72,
    w * 0.72,
    h * 0.85,
    w * 0.63,
    h
  );

  ctx.lineTo(
    w,
    h
  );

  ctx.lineTo(
    w,
    0
  );

  ctx.closePath();

  ctx.fill();

  /*
   Kamera
  */

  ctx.save();

  ctx.translate(
    w / 2 + game.camera.x,
    h / 2 + game.camera.y
  );

  ctx.scale(
    game.camera.zoom,
    game.camera.zoom
  );

  ctx.translate(
    -600,
    -450
  );

  /*
   Grundstücksraster
  */

  ctx.strokeStyle =
    "rgba(255,255,255,.10)";

  ctx.lineWidth = 1;

  for (
    let x = 0;
    x < 1200;
    x += 50
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 0);
    ctx.lineTo(x, 900);

    ctx.stroke();
  }

  for (
    let y = 0;
    y < 900;
    y += 50
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);

    ctx.stroke();
  }

  /*
   Straßen
  */

  for (const road of game.roads) {

    ctx.strokeStyle = "#4b4b4b";
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

    ctx.strokeStyle = "#b9b9b9";
    ctx.lineWidth = 2;

    ctx.setLineDash([
      12,
      12
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

  /*
   Gebäude
  */

  for (
    const building of game.buildings
  ) {

    drawBuilding(building);
  }

  /*
   Stadtzentrum
  */

  ctx.fillStyle = "#eeeeee";

  ctx.font =
    "bold 24px Arial";

  ctx.fillText(
    game.city,
    520,
    80
  );

  ctx.restore();
}

/* =========================
   BUILDINGS
========================= */

function drawBuilding(building) {

  const sizes = {
    house: 35,
    school: 55,
    hospital: 65,
    industry: 75,
    station: 70,
    energy: 70,
    research: 60
  };

  const emojis = {
    house: "🏠",
    school: "🏫",
    hospital: "🏥",
    industry: "🏭",
    station: "🚉",
    energy: "⚡",
    research: "🔬"
  };

  const size =
    sizes[building.type] ||
    40;

  ctx.fillStyle =
    "rgba(0,0,0,.18)";

  ctx.fillRect(
    building.x + 6,
    building.y + 8,
    size,
    size
  );

  ctx.fillStyle =
    building.type === "industry"
      ? "#777"
      : building.type === "energy"
      ? "#d7b52d"
      : building.type === "house"
      ? "#c9a27e"
      : "#d5d5d5";

  ctx.fillRect(
    building.x,
    building.y,
    size,
    size
  );

  ctx.font =
    `${Math.max(20, size * .55)}px Arial`;

  ctx.fillText(
    emojis[building.type] || "🏢",
    building.x + 5,
    building.y + size - 10
  );
}

/* =========================
   MAP INTERACTION
========================= */

function mapCoordinates(event) {

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
        canvas.width / 2 -
        game.camera.x
      ) /
        game.camera.zoom +
      600,

    y:
      (
        screenY -
        canvas.height / 2 -
        game.camera.y
      ) /
        game.camera.zoom +
      450
  };
}

function handleMapClick(event) {

  const pos =
    mapCoordinates(event);

  /*
   Auswahl eines Gebäudes
  */

  if (
    game.selectedTool ===
    "select"
  ) {

    const building =
      game.buildings.find(
        b =>
          pos.x >= b.x &&
          pos.x <= b.x + 80 &&
          pos.y >= b.y &&
          pos.y <= b.y + 80
      );

    const info =
      document.querySelector(
        "#buildingInfo"
      );

    if (building) {

      info.classList.remove(
        "hidden"
      );

      info.innerHTML = `
        <strong>
          ${buildingName(building.type)}
        </strong>
        <br>
        Stufe: ${building.level}
        <br>
        Position:
        ${Math.round(building.x)},
        ${Math.round(building.y)}
      `;

    } else {

      info.classList.add(
        "hidden"
      );
    }

    return;
  }

  buildOnMap(
    game.selectedTool,
    pos.x,
    pos.y
  );
}

function buildingName(type) {

  const names = {
    house: "Wohngebäude",
    school: "Schule",
    hospital: "Krankenhaus",
    industry: "Industrieanlage",
    station: "Bahnhof",
    energy: "Kraftwerk",
    research: "Forschungszentrum"
  };

  return names[type] ||
    "Gebäude";
}

/* =========================
   BUILD ON MAP
========================= */

function buildOnMap(
  type,
  x,
  y
) {

  const costs = {

    house: 1000000,

    industry:
      1000000000,

    school:
      30000000,

    hospital:
      500000000,

    station:
      300000000,

    energy:
      1000000000,

    research:
      500000000,

    road:
      5000000
  };

  const cost =
    costs[type];

  if (
    game.money < cost
  ) {

    alert(
      "Nicht genug Geld."
    );

    return;
  }

  /*
   Straßen
  */

  if (type === "road") {

    game.roads.push({

      x1: x - 100,
      y1: y,

      x2: x + 100,
      y2: y

    });

    game.money -= cost;

    drawMap();

    return;
  }

  /*
   Gebäude
  */

  game.money -= cost;

  game.buildings.push({

    id: crypto.randomUUID(),

    type,

    x,
    y,

    level: 1

  });

  /*
   Auswirkungen
  */

  if (type === "house") {

    game.housing += 500;

    game.population += 150;

    game.satisfaction += 0.2;
  }

  if (type === "industry") {

    game.jobs += 1500;

    game.gdp += 120000000;

    game.energyConsumption += 0.2;

    game.transport -= 0.2;
  }

  if (type === "school") {

    game.education += 1;
  }

  if (type === "hospital") {

    game.health += 1;
  }

  if (type === "energy") {

    game.energyProduction += 0.3;
  }

  if (type === "research") {

    game.education += 1.5;

    game.gdp += 30000000;
  }

  if (type === "station") {

    game.transport += 2;
  }

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

  game.satisfaction =
    Math.min(
      100,
      game.satisfaction
    );

  drawMap();

  updateStats();
}

/* =========================
   UPDATE STATS
========================= */

function updateStats() {

  /*
   Für den Anfang wird das
   Dashboard neu gerendert.
   */

  dashboard();
}

/* =========================
   NEXT YEAR
========================= */

function nextYear() {

  const taxRevenue =
    game.gdp * 0.012;

  const operatingCosts =
    game.budget * 0.82;

  /*
   Wirtschaft
  */

  const growth =
    0.012 +
    (game.education - 60) /
      10000;

  game.gdp *=
    1 + growth;

  /*
   Finanzen
  */

  game.money +=
    taxRevenue -
    operatingCosts;

  /*
   Bevölkerung
  */

  const migration =
    (game.satisfaction - 70) /
    10000;

  game.population *=
    1 +
    0.004 +
    migration;

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

  /*
   Zufriedenheit
  */

  if (
    game.energyProduction <
    game.energyConsumption
  ) {

    game.satisfaction -= 2;

  } else {

    game.satisfaction += 0.2;
  }

  if (
    game.housing <
    game.population * 0.5
  ) {

    game.satisfaction -= 1;
  }

  /*
   Grenzen
  */

  game.satisfaction =
    Math.max(
      0,
      Math.min(
        100,
        game.satisfaction
      )
    );

  game.year++;

  dashboard();
}

/* =========================
   START
========================= */

startScreen();
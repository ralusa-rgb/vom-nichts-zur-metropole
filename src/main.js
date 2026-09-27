const world = document.querySelector("#world");
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

const icons = {
  housing: "🏘",
  industry: "🏭",
  school: "🏫",
  hospital: "🏥",
  research: "🔬",
  energy: "⚡"
};

const names = {
  housing: "Wohnviertel",
  industry: "Industrie",
  school: "Schule",
  hospital: "Krankenhaus",
  research: "Forschungszentrum",
  energy: "Solarkraftwerk"
};

const costs = {
  housing: 500000000,
  industry: 1000000000,
  school: 30000000,
  hospital: 500000000,
  research: 500000000,
  energy: 1000000000
};

const districtInfo = {
  Zentrum: "Dicht bebautes Zentrum mit Verwaltung, Handel und Dienstleistungen.",
  Nord: "Große Wohngebiete und zukünftige Erweiterungsflächen.",
  West: "Universitäten, Forschung und wissensintensive Unternehmen.",
  Ost: "Neues Entwicklungsgebiet mit Platz für zukünftige Stadtteile.",
  Süd: "Industrie, Logistik, Energie und große Gewerbeflächen."
};

let game = {
  year: 2026,
  city: "Berlin",

  money: 10000000000,
  population: 3669000,
  gdp: 180000000000,

  unemployment: .09,
  satisfaction: 72,
  education: 65,
  health: 70,
  transport: 60,

  energyProduction: 12,
  energyConsumption: 10,

  buildings: [
    { type:"housing", x:850, y:520, district:"Zentrum" },
    { type:"housing", x:920, y:540, district:"Zentrum" },
    { type:"housing", x:1090, y:520, district:"Zentrum" },
    { type:"housing", x:1160, y:710, district:"Zentrum" },

    { type:"industry", x:760, y:1140, district:"Süd" },
    { type:"industry", x:910, y:1160, district:"Süd" },

    { type:"school", x:360, y:570, district:"West" },
    { type:"research", x:480, y:720, district:"West" },

    { type:"hospital", x:1250, y:660, district:"Zentrum" },

    { type:"energy", x:1570, y:790, district:"Ost" }
  ]
};

let selectedBuilding = null;
let selectedBuildType = null;

/* --------------------------
   KAMERA
-------------------------- */

let camera = {
  x: 0,
  y: 0,
  zoom: .72
};

let pointerState = {
  dragging: false,
  startX: 0,
  startY: 0,
  cameraX: 0,
  cameraY: 0
};

let pinchStartDistance = null;
let pinchStartZoom = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function applyCamera() {

  map.style.transform =
    `translate(calc(-50% + ${camera.x}px), calc(-50% + ${camera.y}px)) scale(${camera.zoom})`;
}

function centerMap() {

  camera.x = 0;
  camera.y = 0;
  camera.zoom = .72;

  applyCamera();
}

document.querySelector("#centerMap")
  .addEventListener("click", centerMap);

document.querySelector("#zoomIn")
  .addEventListener("click", () => {

    camera.zoom = clamp(
      camera.zoom + .12,
      .45,
      2.2
    );

    applyCamera();
  });

document.querySelector("#zoomOut")
  .addEventListener("click", () => {

    camera.zoom = clamp(
      camera.zoom - .12,
      .45,
      2.2
    );

    applyCamera();
  });

/* --------------------------
   MOUSE + TOUCH PAN
-------------------------- */

function pointerDown(e) {

  if (e.pointerType === "touch") return;

  pointerState.dragging = true;
  pointerState.startX = e.clientX;
  pointerState.startY = e.clientY;

  pointerState.cameraX = camera.x;
  pointerState.cameraY = camera.y;

  world.classList.add("dragging");
}

function pointerMove(e) {

  if (!pointerState.dragging) return;

  camera.x =
    pointerState.cameraX +
    (e.clientX - pointerState.startX);

  camera.y =
    pointerState.cameraY +
    (e.clientY - pointerState.startY);

  camera.x = clamp(camera.x, -950, 950);
  camera.y = clamp(camera.y, -650, 650);

  applyCamera();
}

function pointerUp() {

  pointerState.dragging = false;
  world.classList.remove("dragging");
}

world.addEventListener("pointerdown", pointerDown);
world.addEventListener("pointermove", pointerMove);
world.addEventListener("pointerup", pointerUp);
world.addEventListener("pointercancel", pointerUp);

/* --------------------------
   TOUCH
-------------------------- */

let touchStart = null;
let touchMoved = false;

function distance(a, b) {

  return Math.hypot(
    a.clientX - b.clientX,
    a.clientY - b.clientY
  );
}

world.addEventListener(
  "touchstart",
  e => {

    if (e.touches.length === 1) {

      const t = e.touches[0];

      touchStart = {
        x: t.clientX,
        y: t.clientY,
        cameraX: camera.x,
        cameraY: camera.y
      };

      touchMoved = false;
    }

    if (e.touches.length === 2) {

      pinchStartDistance =
        distance(
          e.touches[0],
          e.touches[1]
        );

      pinchStartZoom = camera.zoom;
    }

  },
  { passive:false }
);

world.addEventListener(
  "touchmove",
  e => {

    e.preventDefault();

    if (e.touches.length === 1 && touchStart) {

      const t = e.touches[0];

      const dx =
        t.clientX - touchStart.x;

      const dy =
        t.clientY - touchStart.y;

      if (Math.abs(dx) > 4 ||
          Math.abs(dy) > 4) {

        touchMoved = true;
      }

      camera.x =
        clamp(
          touchStart.cameraX + dx,
          -1000,
          1000
        );

      camera.y =
        clamp(
          touchStart.cameraY + dy,
          -700,
          700
        );

      applyCamera();
    }

    if (e.touches.length === 2 &&
        pinchStartDistance) {

      const current =
        distance(
          e.touches[0],
          e.touches[1]
        );

      const ratio =
        current / pinchStartDistance;

      camera.zoom =
        clamp(
          pinchStartZoom * ratio,
          .45,
          2.2
        );

      applyCamera();
    }

  },
  { passive:false }
);

world.addEventListener(
  "touchend",
  () => {

    touchStart = null;
    pinchStartDistance = null;
  }
);

/* --------------------------
   UI
-------------------------- */

function updateUI() {

  document.querySelector("#year").textContent =
    game.year;

  document.querySelector("#money").textContent =
    euro(game.money);

  document.querySelector("#population").textContent =
    num(game.population);

  document.querySelector("#gdp").textContent =
    euro(game.gdp);

  document.querySelector("#energy").textContent =
    `${game.energyProduction.toFixed(1)} / ${game.energyConsumption.toFixed(1)} TWh`;

  document.querySelector("#unemployment").textContent =
    `${(game.unemployment * 100).toFixed(1)}%`;

  document.querySelector("#satisfaction").textContent =
    `${game.satisfaction.toFixed(0)}%`;

  document.querySelector("#education").textContent =
    game.education.toFixed(0);

  document.querySelector("#education2").textContent =
    game.education.toFixed(0);

  document.querySelector("#health").textContent =
    game.health.toFixed(0);

  document.querySelector("#health2").textContent =
    game.health.toFixed(0);

  document.querySelector("#transport").textContent =
    game.transport.toFixed(0);

  document.querySelector("#transportBar").style.width =
    `${game.transport}%`;

  document.querySelector("#educationBar").style.width =
    `${game.education}%`;

  document.querySelector("#healthBar").style.width =
    `${game.health}%`;

  renderBuildings();
  renderProjects();
}

/* --------------------------
   GEBÄUDE
-------------------------- */

function renderBuildings() {

  buildingsLayer.innerHTML = "";

  game.buildings.forEach((building, index) => {

    const el =
      document.createElement("button");

    el.className =
      `building ${building.type}`;

    el.style.left =
      `${building.x}px`;

    el.style.top =
      `${building.y}px`;

    el.textContent =
      icons[building.type];

    el.dataset.index = index;

    el.addEventListener(
      "click",
      e => {

        e.stopPropagation();

        openBuilding(index);
      }
    );

    buildingsLayer.appendChild(el);
  });
}

function openBuilding(index) {

  selectedBuilding =
    game.buildings[index];

  document.querySelector("#overview")
    .classList.add("hidden");

  document.querySelector("#districtPanel")
    .classList.add("hidden");

  document.querySelector("#buildingPanel")
    .classList.remove("hidden");

  document.querySelector("#selectedIcon")
    .textContent =
    icons[selectedBuilding.type];

  document.querySelector("#selectedName")
    .textContent =
    names[selectedBuilding.type];

  document.querySelector("#selectedDistrict")
    .textContent =
    `Bezirk: ${selectedBuilding.district}`;

  const details =
    document.querySelector("#buildingDetails");

  let rows = "";

  if (selectedBuilding.type === "housing") {

    rows = `
      <div class="detailRow">
        <span>Einwohner</span>
        <b>+3.000</b>
      </div>
      <div class="detailRow">
        <span>Zufriedenheit</span>
        <b>+2</b>
      </div>
    `;
  }

  if (selectedBuilding.type === "industry") {

    rows = `
      <div class="detailRow">
        <span>Arbeitsplätze</span>
        <b>+8.000</b>
      </div>
      <div class="detailRow">
        <span>BIP</span>
        <b>+800 Mio. €</b>
      </div>
      <div class="detailRow">
        <span>Energieverbrauch</span>
        <b>+0,8 TWh</b>
      </div>
    `;
  }

  if (selectedBuilding.type === "school") {

    rows = `
      <div class="detailRow">
        <span>Bildung</span>
        <b>+2</b>
      </div>
    `;
  }

  if (selectedBuilding.type === "hospital") {

    rows = `
      <div class="detailRow">
        <span>Gesundheit</span>
        <b>+3</b>
      </div>
    `;
  }

  if (selectedBuilding.type === "research") {

    rows = `
      <div class="detailRow">
        <span>Bildung</span>
        <b>+3</b>
      </div>
      <div class="detailRow">
        <span>BIP</span>
        <b>+250 Mio. €</b>
      </div>
    `;
  }

  if (selectedBuilding.type === "energy") {

    rows = `
      <div class="detailRow">
        <span>Energieproduktion</span>
        <b>+1,5 TWh</b>
      </div>
    `;
  }

  details.innerHTML = rows;
}

document.querySelector("#backFromBuilding")
  .addEventListener("click", () => {

    document.querySelector("#buildingPanel")
      .classList.add("hidden");

    document.querySelector("#overview")
      .classList.remove("hidden");
  });

/* --------------------------
   BEZIRKE
-------------------------- */

document.querySelectorAll(".district")
  .forEach(district => {

    district.addEventListener("click", () => {

      const name =
        district.dataset.district;

      openDistrict(name);
    });
  });

function openDistrict(name) {

  const buildings =
    game.buildings.filter(
      b => b.district === name
    );

  document.querySelector("#overview")
    .classList.add("hidden");

  document.querySelector("#buildingPanel")
    .classList.add("hidden");

  document.querySelector("#districtPanel")
    .classList.remove("hidden");

  document.querySelector("#districtName")
    .textContent = name;

  document.querySelector("#districtDescription")
    .textContent =
    districtInfo[name];

  document.querySelector("#districtBuildings")
    .textContent =
    buildings.length;

  document.querySelector("#districtPopulation")
    .textContent =
    num(Math.round(game.population / 5));

  document.querySelector("#districtJobs")
    .textContent =
    num(
      buildings.filter(
        b => b.type === "industry"
      ).length * 8000
    );
}

document.querySelector("#backOverview")
  .addEventListener("click", () => {

    document.querySelector("#districtPanel")
      .classList.add("hidden");

    document.querySelector("#overview")
      .classList.remove("hidden");
  });

/* --------------------------
   BAUEN
-------------------------- */

const buildMenu =
  document.querySelector("#buildMenu");

document.querySelector("#buildButton")
  .addEventListener("click", () => {

    buildMenu.classList.toggle("hidden");
  });

document.querySelector("#closeBuild")
  .addEventListener("click", () => {

    buildMenu.classList.add("hidden");
    selectedBuildType = null;
  });

document.querySelectorAll(".buildCard")
  .forEach(card => {

    card.addEventListener("click", () => {

      selectedBuildType =
        card.dataset.type;

      buildMenu.classList.add("hidden");

      showToast(
        `${names[selectedBuildType]} ausgewählt – tippe auf einen Bauplatz.`
      );
    });
  });

/*
  Gebäude platzieren.
  Wir benutzen die tatsächliche Position innerhalb
  der großen Karte, damit Gebäude beim Verschieben
  der Kamera korrekt mit der Stadt verbunden bleiben.
*/

map.addEventListener("click", e => {

  if (!selectedBuildType)
    return;

  if (
    e.target.closest(".building") ||
    e.target.closest(".district")
  )
    return;

  const rect =
    map.getBoundingClientRect();

  const x =
    (e.clientX - rect.left) /
    camera.zoom;

  const y =
    (e.clientY - rect.top) /
    camera.zoom;

  const cost =
    costs[selectedBuildType];

  if (game.money < cost) {

    showToast(
      "Nicht genug Geld für dieses Projekt."
    );

    return;
  }

  const district =
    determineDistrict(x, y);

  game.money -= cost;

  game.buildings.push({
    type: selectedBuildType,
    x: x - 25,
    y: y - 25,
    district
  });

  applyBuildingEffect(
    selectedBuildType
  );

  showToast(
    `${names[selectedBuildType]} wurde in ${district} gebaut.`
  );

  selectedBuildType = null;

  updateUI();
});

function determineDistrict(x, y) {

  if (x < 680)
    return "West";

  if (x > 1450)
    return "Ost";

  if (y < 480)
    return "Nord";

  if (y > 1050)
    return "Süd";

  return "Zentrum";
}

function applyBuildingEffect(type) {

  if (type === "housing") {

    game.population += 3000;
    game.satisfaction += 2;
  }

  if (type === "industry") {

    game.gdp += 800000000;
    game.energyConsumption += .8;
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

  game.education =
    Math.min(100, game.education);

  game.health =
    Math.min(100, game.health);

  game.satisfaction =
    Math.min(100, game.satisfaction);

  game.transport =
    Math.max(0, Math.min(100, game.transport));
}

/* --------------------------
   PROJEKTLISTE
-------------------------- */

function renderProjects() {

  const list =
    document.querySelector("#projectList");

  const recent =
    game.buildings.slice(-5).reverse();

  if (!recent.length) {

    list.innerHTML =
      "<small>Noch keine Projekte.</small>";

    return;
  }

  list.innerHTML =
    recent.map(b => `
      <div class="project">
        <b>${icons[b.type]} ${names[b.type]}</b>
        <small>${b.district}</small>
      </div>
    `).join("");
}

/* --------------------------
   JAHR
-------------------------- */

document.querySelector("#advance")
  .addEventListener("click", advanceYear);

function advanceYear() {

  const tax =
    game.gdp * .012;

  const expenses =
    game.gdp * .006;

  game.year++;

  game.gdp *=
    1.012 +
    ((game.education - 60) / 10000);

  game.money +=
    tax - expenses;

  game.population *=
    1.004 +
    ((game.satisfaction - 70) / 10000);

  game.unemployment =
    Math.max(
      .025,
      game.unemployment - .001
    );

  game.energyConsumption *=
    1.01;

  if (
    game.energyProduction >=
    game.energyConsumption
  ) {

    game.satisfaction += .5;

  } else {

    game.satisfaction -= .8;
  }

  game.transport += .15;

  game.satisfaction =
    clamp(
      game.satisfaction,
      0,
      100
    );

  game.transport =
    clamp(
      game.transport,
      0,
      100
    );

  updateUI();

  showToast(
    `Jahr ${game.year} begonnen`
  );
}

/* --------------------------
   KARTENMODI
-------------------------- */

function setLayer(layer) {

  document.body.classList.remove(
    "mode-population",
    "mode-economy",
    "mode-transport",
    "mode-energy"
  );

  if (layer !== "political") {

    document.body.classList.add(
      `mode-${layer}`
    );
  }

  document.querySelectorAll(
    ".sideButton[data-layer]"
  ).forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.layer === layer
    );
  });

  document.querySelectorAll(
    ".mapMode"
  ).forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.layer === layer
    );
  });
}

document.querySelectorAll(
  "[data-layer]"
).forEach(button => {

  button.addEventListener(
    "click",
    () => setLayer(button.dataset.layer)
  );
});

/* --------------------------
   MOBILE PANELS
-------------------------- */

document.querySelector("#mobileInfo")
  .addEventListener("click", () => {

    document.querySelector("#rightPanel")
      .classList.toggle("open");

    document.querySelector("#leftPanel")
      .classList.remove("open");
  });

/* --------------------------
   TOAST
-------------------------- */

let toastTimer;

function showToast(text) {

  const toast =
    document.querySelector("#toast");

  toast.textContent = text;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2300);
}

/* --------------------------
   START
-------------------------- */

centerMap();
updateUI();
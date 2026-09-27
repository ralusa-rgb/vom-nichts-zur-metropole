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

const euro = n => new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
}).format(n);

const num = n => new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0
}).format(n);

let game;

function startScreen() {
  app.innerHTML = `
    <div class="start">
      <h1>Vom Nichts zur Metropole</h1>

      <p>
        Baue eine deutsche Stadt über Jahrzehnte
        zu einer leistungsfähigen Metropole aus.
      </p>

      <label>
        Startstadt
        <select id="city">
          ${Object.keys(cities)
            .map(c => `<option>${c}</option>`)
            .join("")}
        </select>
      </label>

      <div id="cityInfo" class="panel"></div>

      <label>
        Privates Startvermögen
        <select id="capital">
          <option value="1e9">1 Mrd. €</option>
          <option value="1e10">10 Mrd. €</option>
          <option value="1e11">100 Mrd. €</option>
          <option value="3e11">300 Mrd. €</option>
        </select>
      </label>

      <label>
        Jährliches öffentliches Budget
        <select id="budget">
          <option value="5e8">500 Mio. €</option>
          <option value="2e9">2 Mrd. €</option>
          <option value="5e9">5 Mrd. €</option>
          <option value="1e10">10 Mrd. €</option>
        </select>
      </label>

      <label>
        Schwierigkeit
        <select id="difficulty">
          <option>Normal</option>
          <option>Schwer</option>
          <option>Extrem</option>
        </select>
      </label>

      <button id="startGame">
        Stadt gründen
      </button>
    </div>
  `;

  const info = () => {
    const c = cities[city.value];

    cityInfo.innerHTML = `
      <h3>Ausgangslage</h3>
      <p>Einwohner: <b>${num(c.population)}</b></p>
      <p>Fläche: <b>${c.area} km²</b></p>
      <p>Wirtschaftsleistung: <b>${euro(c.gdp)}</b></p>
      <p>Arbeitslosigkeit: <b>${(c.unemployment * 100).toFixed(1)}%</b></p>
    `;
  };

  city.addEventListener("change", info);
  info();

  startGame.addEventListener("click", () => {
    const c = cities[city.value];

    game = {
      city: city.value,
      year: 2026,
      population: c.population,
      gdp: c.gdp,
      unemployment: c.unemployment,
      money: +capital.value,
      budget: +budget.value,
      debt: 0,
      housing: Math.round(c.population * 0.52),
      satisfaction: 72,
      education: 65,
      health: 70,
      energyProduction: 12,
      energyConsumption: 10,
      transport: 60,
      jobs: Math.round(c.population * (1 - c.unemployment) * 0.55)
    };

    dashboard();
  });
}

function dashboard() {
  app.innerHTML = `
    <header>
      <b>VOM NICHTS ZUR METROPOLE</b>
      <button id="nextYear">
        Jahr abschließen →
      </button>
    </header>

    <div class="layout">

      <nav>
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
        ].map(x => `<button class="nav">${x}</button>`).join("")}
      </nav>

      <main class="content">

        <h2>${game.city} — ${game.year}</h2>

        <div class="grid">

          <article>
            <small>BEVÖLKERUNG</small>
            <strong>${num(game.population)}</strong>
          </article>

          <article>
            <small>BIP</small>
            <strong>${euro(game.gdp)}</strong>
          </article>

          <article>
            <small>BIP / KOPF</small>
            <strong>${euro(game.gdp / game.population)}</strong>
          </article>

          <article>
            <small>VERMÖGEN</small>
            <strong>${euro(game.money)}</strong>
          </article>

          <article>
            <small>SCHULDEN</small>
            <strong>${euro(game.debt)}</strong>
          </article>

          <article>
            <small>ARBEITSLOSIGKEIT</small>
            <strong>${(game.unemployment * 100).toFixed(1)}%</strong>
          </article>

        </div>

        <section class="panel">

          <h3>Stadtentwicklung</h3>

          <p>
            Wohnraum:
            <b>${num(game.housing)}</b> Wohnungen
          </p>

          <p>
            Arbeitsplätze:
            <b>${num(game.jobs)}</b>
          </p>

          <p>
            Energie:
            <b>
              ${game.energyProduction.toFixed(1)}
              /
              ${game.energyConsumption.toFixed(1)}
              TWh
            </b>
          </p>

          <p>
            Zufriedenheit:
            <b>${game.satisfaction.toFixed(0)}%</b>
          </p>

          <p>
            Bildungsniveau:
            <b>${game.education.toFixed(0)}</b>
          </p>

          <p>
            Gesundheitsversorgung:
            <b>${game.health.toFixed(0)}</b>
          </p>

          <p>
            Verkehrsqualität:
            <b>${game.transport.toFixed(0)}</b>
          </p>

        </section>

        <section class="panel">

          <h3>Schnell bauen</h3>

          <div class="projects">

            <button class="project"
              data-cost="3e7"
              data-type="school">
              🏫 Schule<br>
              30 Mio. €
            </button>

            <button class="project"
              data-cost="5e8"
              data-type="hospital">
              🏥 Krankenhaus<br>
              500 Mio. €
            </button>

            <button class="project"
              data-cost="1e9"
              data-type="industry">
              🏭 Industriepark<br>
              1 Mrd. €
            </button>

            <button class="project"
              data-cost="5e8"
              data-type="housing">
              🏠 Wohnviertel<br>
              500 Mio. €
            </button>

            <button class="project"
              data-cost="5e8"
              data-type="research">
              🔬 Forschungszentrum<br>
              500 Mio. €
            </button>

            <button class="project"
              data-cost="1e9"
              data-type="energy">
              ☀️ Solarkraftwerk<br>
              1 Mrd. €
            </button>

          </div>

        </section>

        <section class="panel">

          <h3>Jahresbudget</h3>

          <p>
            Öffentliches Budget:
            <b>${euro(game.budget)}</b>
          </p>

          <p>
            Steuereinnahmen:
            <b>${euro(game.gdp * 0.012)}</b>
          </p>

          <p>
            Geplante Ausgaben:
            <b>${euro(game.budget * 0.82)}</b>
          </p>

        </section>

      </main>
    </div>
  `;

  nextYear.addEventListener("click", advance);

  document.querySelectorAll(".project").forEach(button => {
    button.addEventListener("click", () => {
      build(
        button.dataset.type,
        +button.dataset.cost
      );
    });
  });
}

function build(type, cost) {

  if (game.money < cost) {
    alert("Nicht genug Startvermögen.");
    return;
  }

  game.money -= cost;

  if (type === "school")
    game.education += 2;

  if (type === "hospital")
    game.health += 3;

  if (type === "industry") {
    game.jobs += 8000;
    game.gdp += 800e6;
    game.energyConsumption += 0.8;
    game.transport -= 1;
  }

  if (type === "housing") {
    game.housing += 10000;
    game.population += 3000;
    game.satisfaction += 2;
  }

  if (type === "research")
    game.education += 3;

  if (type === "energy")
    game.energyProduction += 1.5;

  game.satisfaction =
    Math.min(100, game.satisfaction);

  game.education =
    Math.min(100, game.education);

  game.health =
    Math.min(100, game.health);

  dashboard();
}

function advance() {

  const tax = game.gdp * 0.012;
  const costs = game.budget * 0.82;

  game.year++;

  game.gdp *=
    1 +
    0.012 +
    (game.education - 60) / 10000;

  game.money += tax - costs;

  game.population *=
    1 +
    0.004 +
    (game.satisfaction - 70) / 10000;

  game.jobs *= 1.008;

  game.unemployment =
    Math.max(
      0.025,
      game.unemployment - 0.001
    );

  game.energyConsumption *= 1.01;

  game.satisfaction +=
    game.housing / game.population > 0.5
      ? 0.4
      : -0.5;

  game.satisfaction =
    Math.max(
      0,
      Math.min(100, game.satisfaction)
    );

  dashboard();
}

startScreen();

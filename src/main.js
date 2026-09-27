import { CITIES, PROJECTS } from "./data.js";
import { Game } from "./sim.js";

let game = null;

const app = document.querySelector("#app");

const money = value =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

const number = value =>
  new Intl.NumberFormat("de-DE").format(
    Math.round(value)
  );

function startScreen() {
  app.innerHTML = `
    <section class="start">

      <h1>Vom Nichts zur Metropole</h1>

      <p>
        Baue deine Stadt über Jahrzehnte
        zu einer modernen Metropole aus.
      </p>

      <label>
        Stadt
        <select id="city">
          ${Object.keys(CITIES)
            .map(
              city =>
                `<option value="${city}">
                  ${city}
                </option>`
            )
            .join("")}
        </select>
      </label>

      <label>
        Startkapital
        <select id="capital">
          <option value="1e9">1 Mrd. €</option>
          <option value="1e10">10 Mrd. €</option>
          <option value="1e11">100 Mrd. €</option>
          <option value="3e11">300 Mrd. €</option>
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

    </section>
  `;

  document
    .querySelector("#startGame")
    .addEventListener("click", () => {
      const city =
        CITIES[
          document.querySelector("#city").value
        ];

      const capital =
        Number(
          document.querySelector("#capital").value
        );

      const difficulty =
        document.querySelector("#difficulty").value;

      game = new Game(
        city,
        capital,
        difficulty
      );

      render();
    });
}

function render() {
  app.innerHTML = `
    <header>

      <div>
        <b>VOM NICHTS ZUR METROPOLE</b>
      </div>

      <button id="nextYear">
        Jahr ${game.year}
        → Nächstes Jahr
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
          "Transport",
          "Energie",
          "Bildung",
          "Gesundheit",
          "Forschung"
        ]
          .map(
            item =>
              `<button class="nav">
                ${item}
              </button>`
          )
          .join("")}
      </nav>

      <section class="content">

        <h2>${game.year}</h2>

        <div class="grid">

          <article>
            <small>BEVÖLKERUNG</small>
            <strong>
              ${number(game.population)}
            </strong>
          </article>

          <article>
            <small>BIP</small>
            <strong>
              ${money(game.gdp)}
            </strong>
          </article>

          <article>
            <small>VERMÖGEN</small>
            <strong>
              ${money(game.money)}
            </strong>
          </article>

          <article>
            <small>SCHULDEN</small>
            <strong>
              ${money(game.debt)}
            </strong>
          </article>

          <article>
            <small>ARBEITSLOSIGKEIT</small>
            <strong>
              ${(game.unemployment * 100).toFixed(1)}%
            </strong>
          </article>

          <article>
            <small>ZUFRIEDENHEIT</small>
            <strong>
              ${game.satisfaction.toFixed(0)}%
            </strong>
          </article>

        </div>

        <div class="panel">

          <h3>Bauen</h3>

          <div class="projects">

            ${Object.entries(PROJECTS)
              .map(
                ([key, project]) => `
                  <button
                    class="project"
                    data-project="${key}"
                  >
                    <b>${project.name}</b>
                    <span>
                      ${money(project.cost)}
                    </span>
                  </button>
                `
              )
              .join("")}

          </div>

        </div>

        <div class="panel">

          <h3>Stadtstatus</h3>

          <p>
            Wohnraum:
            ${number(game.housing)}
          </p>

          <p>
            Energieproduktion:
            ${(game.energyProduction / 1e9).toFixed(1)}
            Mrd. kWh
          </p>

          <p>
            Bildung:
            ${game.education.toFixed(0)}
          </p>

          <p>
            Gesundheit:
            ${game.health.toFixed(0)}
          </p>

          <p>
            Forschung:
            ${game.research.toFixed(0)}
          </p>

          <p>
            Verkehr:
            ${game.transport.toFixed(0)}
          </p>

        </div>

        <div class="panel">

          <h3>Ereignisse</h3>

          ${
            game.events.length
              ? game.events
                  .map(
                    event =>
                      `<p>⚠️ ${event}</p>`
                  )
                  .join("")
              : "<p>Keine aktuellen Ereignisse.</p>"
          }

        </div>

      </section>

    </div>
  `;

  document
    .querySelector("#nextYear")
    .addEventListener("click", () => {
      game.nextYear();
      render();
    });

  document
    .querySelectorAll(".project")
    .forEach(button => {
      button.addEventListener("click", () => {

        const success =
          game.build(
            button.dataset.project
          );

        if (!success) {
          alert(
            "Nicht genug Geld für dieses Projekt."
          );

          return;
        }

        render();
      });
    });
}

startScreen();
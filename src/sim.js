import { PROJECTS } from "./data.js";

export class Game {
  constructor(city, capital, difficulty) {
    this.year = 2026;

    this.city = city;
    this.money = capital;
    this.debt = 0;

    this.population = city.population;
    this.gdp = city.gdp;
    this.unemployment = city.unemployment;

    this.housing = city.housing;

    this.energyProduction = city.energy;
    this.energyUse = Math.round(city.population * 4000);

    this.taxRate = 0.30;

    this.jobs = Math.round(
      this.population * (1 - this.unemployment)
    );

    this.education = 50;
    this.health = 60;
    this.transport = 45;
    this.research = 10;

    this.satisfaction = 60;

    this.projects = [];
    this.events = [];

    this.difficulty = difficulty;
  }

  build(key) {
    const project = PROJECTS[key];

    if (!project) return false;

    if (this.money < project.cost) {
      return false;
    }

    this.money -= project.cost;

    this.projects.push(key);

    this.jobs += project.jobs || 0;
    this.housing += project.housing || 0;
    this.gdp += project.gdp || 0;

    this.energyProduction += project.energy || 0;

    this.education += project.education || 0;
    this.health += project.health || 0;
    this.transport += project.transport || 0;
    this.research += project.research || 0;

    this.satisfaction = Math.min(
      100,
      this.satisfaction + 1
    );

    return true;
  }

  nextYear() {
    const wageEffect = Math.max(
      0,
      (this.gdp / this.population / 60000) - 1
    ) * 0.003;

    const housingPressure = Math.max(
      0,
      (this.population / Math.max(1, this.housing)) - 1.7
    );

    const migration =
      0.006 +
      wageEffect -
      housingPressure * 0.01 +
      (this.satisfaction - 60) * 0.00003;

    const births = this.population * 0.0095;
    const deaths = this.population * 0.0105;

    this.population = Math.max(
      1000,
      Math.round(
        this.population +
        births -
        deaths +
        this.population * migration
      )
    );

    this.jobs = Math.max(
      0,
      Math.round(
        this.jobs +
        (this.gdp / 1e9) * 0.8
      )
    );

    this.unemployment = Math.max(
      0.025,
      Math.min(
        0.20,
        1 -
          this.jobs /
            Math.max(
              1,
              this.population * 0.65
            )
      )
    );

    const productivity =
      1 +
      0.012 +
      (this.education - 50) * 0.00008 +
      (this.research - 10) * 0.00005;

    const energyShortage = Math.max(
      0,
      this.energyUse - this.energyProduction
    );

    const energyPenalty =
      energyShortage /
      Math.max(1, this.energyUse);

    this.gdp *=
      productivity *
      (1 - energyPenalty * 0.04);

    this.energyUse =
      this.population * 4000 +
      this.gdp * 0.015;

    this.energyProduction *= 1.01;

    const taxRevenue =
      this.gdp *
      this.taxRate *
      0.35;

    const expenses =
      this.population * 4200 +
      this.projects.length * 15e6;

    const balance =
      taxRevenue - expenses;

    this.money += balance;

    if (this.money < 0) {
      this.debt += -this.money;
      this.money = 0;
    }

    const energyRatio =
      this.energyProduction /
      Math.max(1, this.energyUse);

    if (energyRatio < 0.9) {
      this.satisfaction -= 4;
    }

    if (energyRatio > 1.15) {
      this.satisfaction += 1;
    }

    if (this.unemployment < 0.06) {
      this.satisfaction += 1;
    } else {
      this.satisfaction -= 1;
    }

    this.satisfaction -=
      housingPressure * 2;

    this.satisfaction = Math.max(
      0,
      Math.min(100, this.satisfaction)
    );

    this.events = [];

    if (housingPressure > 0.4) {
      this.events.push(
        "Wohnungsmangel: Mieten steigen."
      );
    }

    if (energyRatio < 0.85) {
      this.events.push(
        "Energieknappheit belastet die Wirtschaft."
      );
    }

    if (this.unemployment > 0.12) {
      this.events.push(
        "Hohe Arbeitslosigkeit belastet die Stadt."
      );
    }

    if (this.satisfaction > 80) {
      this.events.push(
        "Die Lebensqualität ist sehr hoch."
      );
    }

    this.year++;

    return {
      taxRevenue,
      expenses,
      balance
    };
  }
}
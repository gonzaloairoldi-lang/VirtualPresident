import type { Country } from "../types.js";

/**
 * Set inicial de países para el escenario de arranque (junio 1990),
 * el mismo punto de partida que el Shadow President original.
 *
 * Los valores son aproximaciones de diseño de juego, no datos históricos
 * precisos — están pensados para generar un punto de partida jugable e
 * interesante, no para ser una fuente histórica.
 */
export const INITIAL_COUNTRIES: Record<string, Country> = {
  USA: {
    id: "USA",
    name: "Estados Unidos",
    region: "north_america",
    isPlayer: true,
    stats: {
      qualityOfLife: 85,
      stability: 90,
      economy: 95,
      militaryStrength: 100,
      relationToUS: 100,
    },
  },
  IRQ: {
    id: "IRQ",
    name: "Irak",
    region: "middle_east",
    stats: {
      qualityOfLife: 40,
      stability: 55,
      economy: 45,
      militaryStrength: 70,
      relationToUS: 20,
    },
  },
  KWT: {
    id: "KWT",
    name: "Kuwait",
    region: "middle_east",
    stats: {
      qualityOfLife: 75,
      stability: 50,
      economy: 80,
      militaryStrength: 15,
      relationToUS: 70,
    },
  },
  SAU: {
    id: "SAU",
    name: "Arabia Saudita",
    region: "middle_east",
    stats: {
      qualityOfLife: 65,
      stability: 70,
      economy: 75,
      militaryStrength: 50,
      relationToUS: 75,
    },
  },
  RUS: {
    id: "RUS",
    name: "Unión Soviética",
    region: "europe",
    stats: {
      qualityOfLife: 45,
      stability: 35,
      economy: 40,
      militaryStrength: 95,
      relationToUS: 40,
    },
  },
  CHN: {
    id: "CHN",
    name: "China",
    region: "asia",
    stats: {
      qualityOfLife: 40,
      stability: 75,
      economy: 50,
      militaryStrength: 80,
      relationToUS: 45,
    },
  },
  GBR: {
    id: "GBR",
    name: "Reino Unido",
    region: "europe",
    stats: {
      qualityOfLife: 80,
      stability: 90,
      economy: 80,
      militaryStrength: 70,
      relationToUS: 90,
    },
  },
  DEU: {
    id: "DEU",
    name: "Alemania",
    region: "europe",
    stats: {
      qualityOfLife: 82,
      stability: 88,
      economy: 85,
      militaryStrength: 55,
      relationToUS: 85,
    },
  },
  ISR: {
    id: "ISR",
    name: "Israel",
    region: "middle_east",
    stats: {
      qualityOfLife: 75,
      stability: 70,
      economy: 65,
      militaryStrength: 75,
      relationToUS: 90,
    },
  },
  IRN: {
    id: "IRN",
    name: "Irán",
    region: "middle_east",
    stats: {
      qualityOfLife: 45,
      stability: 50,
      economy: 40,
      militaryStrength: 55,
      relationToUS: 10,
    },
  },
  CUB: {
    id: "CUB",
    name: "Cuba",
    region: "north_america",
    stats: {
      qualityOfLife: 55,
      stability: 70,
      economy: 30,
      militaryStrength: 25,
      relationToUS: 15,
    },
  },
  MEX: {
    id: "MEX",
    name: "México",
    region: "north_america",
    stats: {
      qualityOfLife: 55,
      stability: 65,
      economy: 50,
      militaryStrength: 20,
      relationToUS: 70,
    },
  },
  BRA: {
    id: "BRA",
    name: "Brasil",
    region: "south_america",
    stats: {
      qualityOfLife: 50,
      stability: 60,
      economy: 55,
      militaryStrength: 35,
      relationToUS: 65,
    },
  },
  ZAF: {
    id: "ZAF",
    name: "Sudáfrica",
    region: "africa",
    stats: {
      qualityOfLife: 45,
      stability: 40,
      economy: 50,
      militaryStrength: 40,
      relationToUS: 50,
    },
  },
  ETH: {
    id: "ETH",
    name: "Etiopía",
    region: "africa",
    stats: {
      qualityOfLife: 20,
      stability: 25,
      economy: 15,
      militaryStrength: 30,
      relationToUS: 35,
    },
  },
  SOM: {
    id: "SOM",
    name: "Somalia",
    region: "africa",
    stats: {
      qualityOfLife: 15,
      stability: 15,
      economy: 10,
      militaryStrength: 20,
      relationToUS: 30,
    },
  },
  JPN: {
    id: "JPN",
    name: "Japón",
    region: "asia",
    stats: {
      qualityOfLife: 85,
      stability: 90,
      economy: 90,
      militaryStrength: 45,
      relationToUS: 85,
    },
  },
  IND: {
    id: "IND",
    name: "India",
    region: "asia",
    stats: {
      qualityOfLife: 35,
      stability: 60,
      economy: 35,
      militaryStrength: 60,
      relationToUS: 50,
    },
  },
  FRA: {
    id: "FRA",
    name: "Francia",
    region: "europe",
    stats: {
      qualityOfLife: 80,
      stability: 85,
      economy: 80,
      militaryStrength: 65,
      relationToUS: 75,
    },
  },
  CAN: {
    id: "CAN",
    name: "Canadá",
    region: "north_america",
    stats: {
      qualityOfLife: 85,
      stability: 95,
      economy: 75,
      militaryStrength: 40,
      relationToUS: 95,
    },
  },
};

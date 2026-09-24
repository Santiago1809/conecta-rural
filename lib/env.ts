// Central environment constants. No secrets: every live source works without a key.

/** Fixed trip origin for all route estimates. */
export const MEDELLIN_ORIGIN = { lat: 6.2442, lon: -75.5812, label: "Punto de partida" } as const;

/** Nominatim requires a descriptive User-Agent. */
export const NOMINATIM_USER_AGENT = "MiRuta/0.1 (contacto@miruta.co)";

/** Socrata dataset for RNT lookup on datos.gov.co (overridable via env). */
export const RNT_DATASET_ID =
  process.env.RNT_DATASET_ID ?? "gt2j-8ykr";

/** localStorage key for the travel plan. */
export const PLAN_STORAGE_KEY = "conecta_rural_plan";

// Open-Meteo helpers: Spanish labels for WMO weather codes + packing advice.

export function openMeteoUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,precipitation,weather_code,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    timezone: "America/Bogota",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

/** Short Spanish label for a WMO weather code. */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return "Despejado";
  if (code === 1) return "Mayormente despejado";
  if (code === 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Niebla";
  if (code >= 51 && code <= 57) return "Llovizna";
  if (code >= 61 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Granizo suave";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code >= 95 && code <= 99) return "Tormenta eléctrica";
  return "Variable";
}

/** Practical packing advice from current conditions (Spanish UI copy). */
export function consejoClima(tempC: number, precipMm: number, windKmh: number): string {
  const tips: string[] = [];
  if (precipMm > 0.5) tips.push("lleva impermeable y calzado antideslizante");
  else if (precipMm > 0) tips.push("empaca una chaqueta ligera por si llueve");
  if (tempC <= 14) tips.push("abrígate bien: hace frío de páramo");
  else if (tempC <= 19) tips.push("una chaqueta ligera será suficiente");
  else if (tempC >= 27) tips.push("usa bloqueador, gorra e hidrátate");
  if (windKmh >= 25) tips.push("el viento es fuerte en miradores");
  if (tips.length === 0) return "Clima agradable: ropa cómoda y bloqueador.";
  return `Hoy ${tips.join(", ")}.`;
}

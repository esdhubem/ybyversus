/**
 * SunCalc v1.9.0 (adaptado para ES Modules)
 * Biblioteca leve para cálculo de posições e fases do Sol e da Lua.
 * Licença: MIT - Copyright (c) 2011-2015, Vladimir Agafonkin
 * https://github.com/mourner/suncalc
 */

const PI = Math.PI,
  sin = Math.sin,
  cos = Math.cos,
  tan = Math.tan,
  asin = Math.asin,
  atan = Math.atan2,
  acos = Math.acos,
  rad = PI / 180;

const dayMs = 1000 * 60 * 60 * 24,
  J1970 = 2440588,
  J2000 = 2451545;

function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j) { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date) { return toJulian(date) - J2000; }

const e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b) { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

function azimuth(H, phi, dec) { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

function eclipticLongitude(M) {
  const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)),
    P = rad * 102.9372;
  return M + C + P + PI;
}

function sunCoords(d) {
  const M = solarMeanAnomaly(d),
    L = eclipticLongitude(M);
  return {
    dec: declination(L, 0),
    ra: rightAscension(L, 0)
  };
}

const times = [
  [-0.833, 'sunrise', 'sunset'],
  [-0.3, 'sunriseEnd', 'sunsetStart'],
  [-6, 'dawn', 'dusk'],
  [-12, 'nauticalDawn', 'nauticalDusk'],
  [-18, 'nightEnd', 'night'],
  [6, 'goldenHourEnd', 'goldenHour']
];

const J0 = 0.0009;

function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
function solarTransitJ(ds, M, L) { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

function hourAngle(h, phi, dec) {
  const cosH = (sin(h) - sin(phi) * sin(dec)) / (cos(phi) * cos(dec));
  return acos(Math.min(Math.max(cosH, -1), 1));
}

function getSetJ(h, lw, phi, dec, n, M, L) {
  const w = hourAngle(h, phi, dec),
    a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}

export function getSunTimes(date, lat, lng) {
  const lw = rad * -lng,
    phi = rad * lat,
    d = toDays(date),
    n = julianCycle(d, lw),
    ds = approxTransit(0, lw, n),
    M = solarMeanAnomaly(ds),
    L = eclipticLongitude(M),
    dec = declination(L, 0),
    Jnoon = solarTransitJ(ds, M, L);

  const result = {
    solarNoon: fromJulian(Jnoon),
    nadir: fromJulian(Jnoon - 0.5)
  };

  for (let i = 0; i < times.length; i += 1) {
    const time = times[i],
      h0 = (time[0] + 0.833) * rad;

    const Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
    const Jrise = Jnoon - (Jset - Jnoon);

    result[time[1]] = fromJulian(Jrise);
    result[time[2]] = fromJulian(Jset);
  }

  return result;
}

// Cálculo da Posição e Iluminação da Lua
function moonCoords(d) {
  const L = rad * (218.316 + 13.176396 * d),
    M = rad * (134.963 + 13.064993 * d),
    F = rad * (93.272 + 13.229350 * d),
    l = L + rad * 6.289 * sin(M),
    b = rad * 5.128 * sin(F),
    dt = 385001 - 20905 * cos(M);

  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
    dist: dt
  };
}

export function getMoonPosition(date, lat, lng) {
  const lw = rad * -lng,
    phi = rad * lat,
    d = toDays(date),
    c = moonCoords(d),
    H = siderealTime(d, lw) - c.ra,
    h = altitude(H, phi, c.dec);

  return {
    azimuth: azimuth(H, phi, c.dec),
    altitude: h,
    distance: c.dist
  };
}

export function getMoonIllumination(date) {
  const d = toDays(date || new Date()),
    s = sunCoords(d),
    m = moonCoords(d);

  const sdist = 149598000; // distância média Terra-Sol em km

  const phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
    inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
    angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

  return {
    fraction: (1 + cos(inc)) / 2,
    phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / PI,
    angle: angle
  };
}

export function getMoonTimes(date, lat, lng) {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);

  const hc = 0.133 * rad;
  let h0 = getMoonPosition(t, lat, lng).altitude - hc,
    rise = null,
    set = null,
    ye;

  for (let i = 1; i <= 24; i += 2) {
    const d1 = new Date(t.getTime() + i * 3600000);
    const d2 = new Date(t.getTime() + (i + 1) * 3600000);
    const h1 = getMoonPosition(d1, lat, lng).altitude - hc;
    const h2 = getMoonPosition(d2, lat, lng).altitude - hc;

    const a = (h0 + h2) / 2 - h1,
      b = (h2 - h0) / 2,
      xe = -b / (2 * a),
      discr = b * b - 4 * a * (h1 - hc);

    if (discr >= 0) {
      const dx = Math.sqrt(discr) / (Math.abs(a) * 2);
      let r1 = xe - dx;
      let r2 = xe + dx;
      if (Math.abs(r1) <= 1) {
        const time = new Date(t.getTime() + (i + r1) * 3600000);
        if (h1 < 0 && !rise) rise = time;
      }
      if (Math.abs(r2) <= 1) {
        const time = new Date(t.getTime() + (i + r2) * 3600000);
        if (h1 > 0 && !set) set = time;
      }
    }
    h0 = h2;
  }

  return { rise, set };
}


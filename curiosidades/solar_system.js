/**
 * Mini Atlas do Sistema Solar (Canvas 2D Interativo)
 * - Cálculo local da posição aproximada dos planetas na data atual
 * - Alternância entre "Tamanho Relativo" e "Distância Relativa"
 * - Ficha técnica acessível com dados científicos verificados
 */

export const PLANETS_DATA = [
  {
    id: 'mercurio',
    name: 'Mercúrio',
    color: '#B5A7A7',
    diameterKm: 4879,
    distAU: 0.39,
    orbitalPeriodDays: 87.97,
    rotationHours: 1407.6,
    moons: 0,
    curiosity: 'Não possui atmosfera significativa para reter calor: as temperaturas oscilam entre 430°C de dia e -180°C à noite.'
  },
  {
    id: 'venus',
    name: 'Vênus',
    color: '#E3BB76',
    diameterKm: 12104,
    distAU: 0.72,
    orbitalPeriodDays: 224.70,
    rotationHours: -5832.5, // Retrógrada
    moons: 0,
    curiosity: 'Gira no sentido horário (rotação retrógrada). Sua densa atmosfera de CO2 cria o efeito estufa mais intenso do Sistema Solar, com 465°C constantes.'
  },
  {
    id: 'terra',
    name: 'Terra',
    color: '#4B9CD3',
    diameterKm: 12742,
    distAU: 1.00,
    orbitalPeriodDays: 365.256,
    rotationHours: 23.93,
    moons: 1,
    curiosity: 'Único corpo celeste conhecido com água líquida estável em sua superfície e biosfera rica e diversa.'
  },
  {
    id: 'marte',
    name: 'Marte',
    color: '#D15838',
    diameterKm: 6779,
    distAU: 1.52,
    orbitalPeriodDays: 686.98,
    rotationHours: 24.62,
    moons: 2,
    curiosity: 'Abriga o Monte Olimpo, o maior vulcão do Sistema Solar, com 22 km de altitude (quase 3 vezes o Everest).'
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    color: '#C88B58',
    diameterKm: 139820,
    distAU: 5.20,
    orbitalPeriodDays: 4332.59,
    rotationHours: 9.93,
    moons: 95,
    curiosity: 'Mais massivo que todos os outros planetas reunidos. Sua famosa Grande Mancha Vermelha é uma tempestade anticiclônica maior que a Terra.'
  },
  {
    id: 'saturno',
    name: 'Saturno',
    color: '#E2C17D',
    diameterKm: 116460,
    distAU: 9.58,
    orbitalPeriodDays: 10759.22,
    rotationHours: 10.7,
    moons: 146,
    curiosity: 'Seus anéis espetaculares são formados por bilhões de fragmentos de gelo e rocha, variando de grãos de poeira a pedregulhos de vários metros.'
  },
  {
    id: 'urano',
    name: 'Urano',
    color: '#65C2C4',
    diameterKm: 50724,
    distAU: 19.22,
    orbitalPeriodDays: 30685.4,
    rotationHours: -17.2,
    moons: 28,
    curiosity: 'Gira praticamente "deitado" de lado, com uma inclinação axial extrema de 98°, causando estações do ano que duram 21 anos terrestres cada.'
  },
  {
    id: 'netuno',
    name: 'Netuno',
    color: '#3466CE',
    diameterKm: 49244,
    distAU: 30.05,
    orbitalPeriodDays: 60189.0,
    rotationHours: 16.1,
    moons: 16,
    curiosity: 'O planeta mais distante do Sol. Possui os ventos mais velozes do Sistema Solar, ultrapassando 2.000 km/h na alta atmosfera.'
  }
];

export function calculatePlanetAngles(date = new Date()) {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const diffDays = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);

  return PLANETS_DATA.map(p => {
    // Ângulo orbital em radianos (aproximação heliocêntrica circular)
    const angle = (2 * Math.PI * (diffDays / p.orbitalPeriodDays)) % (2 * Math.PI);
    return {
      ...p,
      angle: angle < 0 ? angle + 2 * Math.PI : angle
    };
  });
}

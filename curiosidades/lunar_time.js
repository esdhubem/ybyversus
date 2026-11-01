/**
 * Cartão Educativo: Que horas são na Lua? (Tempo Lunar Coordenado - LTC)
 * Dados verificados com fontes oficiais da NASA, NIST e ESA.
 */

export function getLunarTimeInfo() {
  const now = new Date();
  
  // Cálculo pedagógico de defasagem acumulada aproximada em relação a um relógio na Terra
  // A cada dia terrestre (86.400 segundos), o relógio na Lua avança ~56 microssegundos a mais.
  const microsecondsPerDay = 56;
  const hoursToday = now.getHours() + now.getMinutes() / 60;
  const driftMicrosecondsToday = Math.round((hoursToday / 24) * microsecondsPerDay * 10) / 10;

  return {
    title: 'Que horas são na Lua? (Tempo Lunar Coordenado)',
    gainPerDayMicroseconds: 56,
    driftToday: driftMicrosecondsToday,
    scientificExplanation: `
      De acordo com a <strong>Teoria da Relatividade Geral de Einstein</strong>, a gravidade curva o espaço-tempo: quanto mais fraco o campo gravitacional de um corpo celeste, mais rápido os relógios funcionam em sua superfície.
      Como a gravidade na superfície lunar equivale a apenas <strong>1/6 da gravidade terrestre</strong>, o tempo passa ligeiramente mais rápido na Lua do que na Terra.
    `,
    verifiedNumber: `
      Cálculos oficiais realizados por pesquisadores da <strong>NASA</strong> e do <strong>NIST</strong> (National Institute of Standards and Technology) comprovaram que um relógio atômico na superfície da Lua avança aproximadamente <strong>56 microssegundos (56 µs = 0,000056 s) mais rápido a cada dia terrestre</strong>.
    `,
    whyItMatters: `
      Embora pareça minúsculo aos sentidos humanos, 56 microssegundos por dia descalibram sistemas de navegação espacial de alta precisão (como o futuro GPS lunar), transferências orbitais e telecomunicações seguras.
      Por isso, a NASA, a ESA (Agência Espacial Europeia) e a União Astronômica Internacional (IAU) estão padronizando o <strong>Tempo Lunar Coordenado (LTC - Coordinated Lunar Time)</strong> para dar à Lua seu próprio fuso horário soberano.
    `,
    sources: [
      'NASA - National Aeronautics and Space Administration (2024)',
      'NIST - National Institute of Standards and Technology (2024)',
      'OSTP - White House Office of Science and Technology Policy (Memorandum on Celestial Time Standardization, 2024)',
      'ESA - European Space Agency (Moonlight Navigation Program)'
    ]
  };
}

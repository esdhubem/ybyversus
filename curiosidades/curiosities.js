/**
 * Gerador de Curiosidades do Dia
 * - Textos informativos, rigorosos e educativos
 * - Distinção nítida entre dado científico e tradição cultural
 * - Proibição explícita de previsões supersticiosas ou conselhos de saúde/plantio/finanças
 */

export function generateDailyCuriosity(moon, celestial, weather) {
  const curiosities = [];

  // 1. Curiosidade sobre a Lua
  if (moon.percentage >= 95) {
    curiosities.push({
      category: 'Ciência & Astronomia',
      title: 'Plenilúnio: A Face Totalmente Refletora',
      text: `Hoje a Lua está com ${moon.percentage}% de sua face visível iluminada pelo Sol. Na Lua Cheia, Terra, Sol e Lua estão quase alinhados (oposição solar), e ela nasce praticamente no momento em que o Sol se põe.`,
      tag: 'Astronomia Observacional'
    });
  } else if (moon.percentage <= 5) {
    curiosities.push({
      category: 'Ciência & Astronomia',
      title: 'Novilúnio: O Céu Mais Escuro do Mês',
      text: `Hoje a Lua está em conjunção com o Sol (apenas ${moon.percentage}% de iluminação). É a melhor época do mês lunar para observação astronômica de estrelas tênues, nebulosas e a Via Láctea, pois não há brilho lunar ofuscante.`,
      tag: 'Observação Estelar'
    });
  } else {
    curiosities.push({
      category: 'Ciência & Astronomia',
      title: `Ciclo Sinódico da Lua: ${moon.name}`,
      text: `A Lua leva em média 29 dias e 12 horas (um mês sinódico) para completar todas as suas fases vistas da Terra. Hoje, sua iluminação aparente é de ${moon.percentage}%.`,
      tag: 'Mecânica Celeste'
    });
  }

  // 2. Curiosidade sobre o Sol e a Luz do Dia
  if (celestial && celestial.dayLength) {
    curiosities.push({
      category: 'Física da Atmosfera',
      title: 'Fotoperíodo Diário',
      text: `Nesta latitude, a duração total da luz solar hoje é de ${celestial.dayLength.formatted}. O meio-dia solar verdadeiro (zênite, momento em que o Sol atinge sua altura máxima) ocorre às ${formatTime(celestial.solarNoon)}.`,
      tag: 'Ciclos Solares'
    });
  }

  // 3. Curiosidade de Tradição Cultural (Rigorosamente rotulado)
  curiosities.push({
    category: 'Cultura & Saberes Populares',
    title: 'A Lua e as Civilizações Ancestrais',
    text: `Povos ancestrais de diversas regiões do mundo utilizavam os ciclos visíveis da Lua para medir a passagem dos meses e organizar seus calendários de festas comunitárias e encontros da praça pública.`,
    tag: 'História das Civilizações',
    isTradition: true,
    disclaimer: 'Tradição e cultura, sem comprovação científica.'
  });

  // Retorna a lista completa para alternância ou destaque
  return curiosities;
}

function formatTime(date) {
  if (!date || isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}


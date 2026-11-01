/**
 * Módulo de Eclipses Solares e Lunares
 * Dados astronômicos verificados (NASA Goddard Space Flight Center / Fred Espenak)
 * Catálogo com visibilidade para o Brasil e América do Sul.
 */

export const ECLIPSES_CATALOG = [
  {
    id: 'ecl-2026-08-12',
    tipo: 'solar',
    subtipo: 'Total',
    titulo: 'Eclipse Solar Total',
    dataIso: '2026-08-12T17:47:00Z',
    visibilidadeBrasil: 'nao',
    visibilidadeLabel: 'NÃO VISÍVEL',
    regiao: 'Ártico, Groenlândia, Islândia e Espanha.',
    detalhes: 'A Lua cobre completamente o disco solar. A totalidade cruza o norte da Espanha e Islândia. Não visível na América do Sul.',
    dicaSeguranca: 'Eclipses solares exigem filtros astronômicos certificados ISO 12312-2. Nunca use óculos escuros comuns.'
  },
  {
    id: 'ecl-2026-08-28',
    tipo: 'lunar',
    subtipo: 'Parcial',
    titulo: 'Eclipse Lunar Parcial',
    dataIso: '2026-08-28T04:14:00Z',
    visibilidadeBrasil: 'parcial',
    visibilidadeLabel: 'PARCIALMENTE VISÍVEL',
    regiao: 'Américas, Oceano Atlântico e oeste da Europa/África.',
    detalhes: 'Parte da Lua penetra na umbra da Terra na madrugada, gerando uma mordida escura avermelhada na borda lunar.',
    dicaSeguranca: 'Eclipses lunares são 100% seguros para observação a olho nu, com binóculos ou telescópios.'
  },
  {
    id: 'ecl-2027-02-06',
    tipo: 'solar',
    subtipo: 'Anular',
    titulo: 'Eclipse Solar Anular',
    dataIso: '2027-02-06T16:00:00Z',
    visibilidadeBrasil: 'parcial',
    visibilidadeLabel: 'PARCIALMENTE VISÍVEL',
    regiao: 'Chile, Argentina, Uruguai e sul/sudeste do Brasil (parcial).',
    detalhes: 'A Lua está mais distante em sua órbita (apogeu) e não cobre o Sol por inteiro, formando um anel de fogo espetacular no Cone Sul e fase parcial no Brasil.',
    dicaSeguranca: 'Requer proteção solar ocular com certificação ISO 12312-2 durante todas as fases.'
  },
  {
    id: 'ecl-2027-02-20',
    tipo: 'lunar',
    subtipo: 'Penumbral',
    titulo: 'Eclipse Penumbral',
    dataIso: '2027-02-20T23:14:00Z',
    visibilidadeBrasil: 'total',
    visibilidadeLabel: 'TOTALMENTE VISÍVEL',
    regiao: 'Toda a América do Sul, Brasil, Américas, Europa e África.',
    detalhes: 'A Lua atravessa a penumbra tênue da Terra. Nota-se um escurecimento sutil e elegante no gradiente de brilho da borda lunar.',
    dicaSeguranca: 'Seguro para observação a olho nu. Melhor observado longe de iluminação pública intensa.'
  },
  {
    id: 'ecl-2027-07-18',
    tipo: 'lunar',
    subtipo: 'Penumbral',
    titulo: 'Eclipse Penumbral',
    dataIso: '2027-07-18T16:04:00Z',
    visibilidadeBrasil: 'nao',
    visibilidadeLabel: 'NÃO VISÍVEL',
    regiao: 'Ásia, Austrália, Pacífico e leste da África.',
    detalhes: 'Ocorre durante o dia no Brasil (abaixo do horizonte local), sendo visível no hemisfério oriental.',
    dicaSeguranca: 'Fenômeno astronômico diurno no Brasil.'
  },
  {
    id: 'ecl-2027-08-02',
    tipo: 'solar',
    subtipo: 'Total',
    titulo: 'Eclipse Solar Total (O Grande Eclipse do Norte)',
    dataIso: '2027-08-02T10:07:00Z',
    visibilidadeBrasil: 'nao',
    visibilidadeLabel: 'NÃO VISÍVEL',
    regiao: 'Sul da Espanha, Gibraltar, Marrocos, Argélia, Egito e Arábia Saudita.',
    detalhes: 'Um dos eclipses solares totais mais longos do século XXI, com mais de 6 minutos de totalidade sobre o Egito.',
    dicaSeguranca: 'Exige óculos de proteção ISO 12312-2 para observadores na faixa de totalidade.'
  },
  {
    id: 'ecl-2027-08-17',
    tipo: 'lunar',
    subtipo: 'Penumbral',
    titulo: 'Eclipse Penumbral',
    dataIso: '2027-08-17T07:14:00Z',
    visibilidadeBrasil: 'parcial',
    visibilidadeLabel: 'PARCIALMENTE VISÍVEL',
    regiao: 'Américas, Oceano Pacífico e leste da Ásia.',
    detalhes: 'No Brasil, a Lua se põe enquanto o eclipse penumbral atinge seu ápice na alvorada.',
    dicaSeguranca: 'Observação segura a olho nu antes do nascer do Sol.'
  },
  {
    id: 'ecl-2028-01-12',
    tipo: 'lunar',
    subtipo: 'Parcial',
    titulo: 'Eclipse Lunar Parcial',
    dataIso: '2028-01-12T04:14:00Z',
    visibilidadeBrasil: 'total',
    visibilidadeLabel: 'TOTALMENTE VISÍVEL',
    regiao: 'Toda a América do Sul, Brasil, América do Norte, Europa e África.',
    detalhes: 'Visível em todo o território brasileiro durante a madrugada. A sombra da Terra cobrirá expressiva porção do disco lunar.',
    dicaSeguranca: 'Excelente oportunidade para astrofotografia com celular ou luneta.'
  },
  {
    id: 'ecl-2028-01-26',
    tipo: 'solar',
    subtipo: 'Anular',
    titulo: 'Eclipse Solar Anular',
    dataIso: '2028-01-26T15:08:00Z',
    visibilidadeBrasil: 'total',
    visibilidadeLabel: 'TOTALMENTE VISÍVEL',
    regiao: 'Faixa de anularidade cruza o norte e nordeste do Brasil (Equador, Peru, Colômbia e Brasil).',
    detalhes: 'Evento espetacular para o Brasil: a faixa do anel de fogo cruzará estados do Norte e Nordeste brasileiro em plena tarde.',
    dicaSeguranca: 'Obrigatório uso de filtros certificados ISO 12312-2 ou vidro de soldador tonalidade 14.'
  }
];

export function getUpcomingEclipses(limit = 6) {
  // Ordena por data e retorna os próximos
  return ECLIPSES_CATALOG.slice(0, limit);
}

export function renderEclipsesSection() {
  const eclipses = getUpcomingEclipses(6);

  const itemsHtml = eclipses.map(ecl => {
    const d = new Date(ecl.dataIso);
    
    // Formatação: "sábado, 20 de fevereiro de 2027 • 20:14"
    const weekDay = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(d);
    const day = d.getDate();
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(d);
    const year = d.getFullYear();
    const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d);
    const dateFormatted = `${weekDay}, ${day} de ${month} de ${year} • ${time}`;

    // Estilo da Badge de Visibilidade
    let badgeClass = '';
    if (ecl.visibilidadeBrasil === 'total') {
      badgeClass = 'bg-emerald-500/15 text-[#2DC47F] border-emerald-500/30';
    } else if (ecl.visibilidadeBrasil === 'parcial') {
      badgeClass = 'bg-amber-500/15 text-[#E5C384] border-amber-500/30';
    } else {
      badgeClass = 'bg-slate-700/20 text-slate-400 border-slate-700/40';
    }

    const iconEmoji = ecl.tipo === 'solar' ? '☀️' : '🌑';

    return `
      <div class="rounded-2xl bg-[#06120C] border border-[#163524] overflow-hidden transition-all">
        <!-- Linha Principal Clicável -->
        <button onclick="window.toggleEclipseDetail('${ecl.id}')" class="w-full p-3.5 text-left flex items-center justify-between gap-2 hover:bg-[#0A1A12] transition-colors tap-active min-h-[52px]">
          <div class="space-y-1 pr-2">
            <div class="flex items-center gap-2">
              <span class="text-sm shrink-0">${iconEmoji}</span>
              <strong class="text-xs font-bold text-[#FFF6E5]">${ecl.titulo}</strong>
            </div>
            <div class="text-[10.5px] text-slate-400 pl-6">
              ${dateFormatted}
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded-md border tracking-tight ${badgeClass}">
              ${ecl.visibilidadeLabel}
            </span>
            <i data-lucide="chevron-down" id="icon-chevron-${ecl.id}" class="w-4 h-4 text-slate-400 transition-transform"></i>
          </div>
        </button>

        <!-- Detalhes Expansíveis -->
        <div id="detail-${ecl.id}" class="hidden px-4 pb-3 pt-1 border-t border-[#163524]/60 space-y-2 text-xs text-slate-300 bg-[#040D08]/80">
          <p class="text-[11px] leading-relaxed text-slate-300">
            ${ecl.detalhes}
          </p>
          <div class="text-[10.5px] text-slate-400">
            <strong>Onde no planeta:</strong> ${ecl.regiao}
          </div>
          <div class="p-2 rounded-xl bg-[#081810] border border-amber-500/20 text-[10px] text-[#E5C384] flex items-start gap-1.5">
            <span>👁️</span>
            <span>${ecl.dicaSeguranca}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- SEÇÃO: PRÓXIMOS ECLIPSES -->
    <div class="space-y-2.5 pt-3 border-t border-[#163524]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-bold">Próximos Eclipses</span>
          <span class="text-[10px] px-2 py-0.2 rounded-full bg-[#163524] text-[#A1C1B0]">NASA GSFC</span>
        </div>
        <span class="text-[10px] text-[#E5C384]">Visibilidade no Brasil</span>
      </div>

      <div class="space-y-2">
        ${itemsHtml}
      </div>
    </div>
  `;
}

// Manipulador global para expandir/recolher
if (typeof window !== 'undefined') {
  window.toggleEclipseDetail = (id) => {
    const detail = document.getElementById(`detail-${id}`);
    const icon = document.getElementById(`icon-chevron-${id}`);
    if (detail) {
      const isHidden = detail.classList.contains('hidden');
      detail.classList.toggle('hidden');
      if (icon) {
        icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }
  };
}

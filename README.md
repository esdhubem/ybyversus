# YBY • Conectando Saberes e Vidas

> **"Uma infraestrutura de circulação pública de conhecimentos, culturas, expressões e oportunidades."**  
> *Identidade visual em verde floresta e esmeralda com grade 4x2 de ícones 3D em degradê luminoso.*

---

## 📱 Estrutura Visual da Interface

```
┌──────────────────────────────────────────────┐
│  9:41                             📶 🛜 🔋   │
├──────────────────────────────────────────────┤
│  YBY 🌿                          🔍 ✨ ═     │
│  Conectando Saberes e Vidas                  │
├──────────────────────────────────────────────┤
│  🌿 Pessoas que você segue                   │
│  (+) Seu saber  ◯ Benvinda  ◯ Tiago          │
│  ◯ Mariana      ◯ Carlos                     │
├──────────────────────────────────────────────┤
│  [📖 Saberes] [🎬 Curtos] [▶️ Longos] [🎵 Som] │
│  [🎧 Podcast] [💬 Fórum]  [📰 Notícia][📡 Live]│
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │ 🌿 Preparo da Espiral de Ervas e Solo  │  │
│  │    Vivo                          03:10 │  │
│  │ Visualizações comunitárias             │  │
│  │ 2450 💚         ( ▶ )          🤍 🔖   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 👤 Saberes • Terra Viva                │  │
│  │ "O conhecimento circula livremente..." │  │
│  │ 🎵 Música  /  📹 Vídeo  /  📝 Saber   │  │
│  │ 💬 12          ❤️ 48        ↗️ Compartilhar│
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 🔍 Pesquisar saberes...          ( 🔍 )│  │
│  └────────────────────────────────────────┘  │
│                                              │
│      ◯ Recentes           ✅ [Aleatórios]   │
└──────────────────────────────────────────────┘
```

---

## ✨ Os 8 Formatos da Praça (Carrossel Horizontal Deslizante)

Em fila única com rolagem horizontal suave (*swipe* no celular e arraste com mouse no desktop), ícones coloridos expressivos, halo celestial ao passar o mouse e texto dourado ancestral (`#E5C384`):

1. **Saberes:** 📖 Livro aberto.
2. **Vídeos Curtos:** 🎬 Claquete de cinema.
3. **Vídeos Longos:** 📺 Televisor clássico.
4. **Música:** 🎵 Nota musical.
5. **Podcasts:** 🎧 Fone de ouvido.
6. **Fórum:** 💬 Balão de diálogo.
7. **Notícias:** 📰 Folha de jornal.
8. **Trilha de Saberes:** 🧭 Bússola cósmica.

---

## 🌍 Por trás de Yby Versus: O movimento que nos conecta

Nossos passos ganham força quando entendemos de onde viemos e para onde estamos nos movendo. O nome do nosso ecossistema nasce do encontro poético entre dois mundos, duas línguas e uma única verdade: **nada permanece estático**.

- **Yby**, no Tupi-Guarani, é a nossa raiz. Significa a Terra sob nossos pés, o solo sagrado, a ancestralidade e a base de tudo o que construímos.
- **Versus**, em sua essência latina original (da raiz *vertere*), não significa rivalidade, mas sim movimento. É o ato de virar, transformar e mudar de direção.

Ao unir esses dois horizontes, damos vida a um conceito poderoso: **Yby Versus é o movimento constante do nosso planeta**. Significa, em nossa própria tradução de mundo, que **a Terra gira**. Ela gira para renovar ciclos, para transformar realidades e para nos lembrar de que a evolução é inevitável. Nós somos a força que acompanha esse giro.

---

## 📜 Documentos Institucionais, Ética & Pesquisa

- **[O Manifesto YBY VersuS: O Giro que Transforma a Terra (Eixos de Pesquisa)](MANIFESTO_TEMAS_PESQUISA.md)** (Página: [`manifesto_temas_pesquisa.html`](manifesto_temas_pesquisa.html))
- **[Economia do Bem Viver: Indicadores Além do PIB](bemviver.html)** (Página: [`bemviver.html`](bemviver.html))
- **[Carta Aberta ao Público: O Manifesto de Nascimento](CARTA_ABERTA_MANIFESTO.md)**
- **[Termos de Uso, Conduta & Soberania Digital](TERMOS_DE_USO_E_CONDUTA.md)**
- **[Política de Privacidade & Proteção de Dados (LGPD)](POLITICA_DE_PRIVACIDADE.md)**
- **[Direitos Autorais, Terceiros & Recados](termos_direitos_recados.html)**
- **[Direitos Autorais: Fediverso & Música](termos_fediverso_musica.html)**

---

## 📊 Economia do Bem Viver: Indicadores Além do PIB (`bemviver.html`)

A página **Economia do Bem Viver** apresenta uma perspectiva com dados de fontes públicas oficiais de que a economia deve ser avaliada também pela qualidade de vida das pessoas, regeneração ecológica e bem-estar coletivo, e não exclusivamente pelo PIB.

### 📐 Arquitetura Front-end & Dados
- **Zero Requisições Externas / CDN Zero:** Todo o runtime (Chart.js local em `assets/vendor/chart.umd.min.js`, Lucide local ou inline) roda sem envio de telemetria ou rastreamento.
- **Repository Pattern:** Camada de acesso desacoplada em `data/bemviver/repository.js`, pronta para substituir leituras de arquivos estáticos por banco de dados ou backend federado sem alterar a interface.
- **Validação com JSON Schema:** Contrato em `data/bemviver/indicadores.schema.json` que valida os 14 campos obrigatórios de cada indicador (`id`, `nome`, `bloco`, `oQueNaoMede`, `unidade`, `periodicidade`, `serie`, `anoMaisRecente`, `fonteNome`, `fonteUrl`, `licenca`, `dataDeColeta`).
- **Acessibilidade Completa (WCAG 2.2 AA):**
  - Gráficos acompanhados de botões para exibição de **tabelas de dados equivalentes** legíveis por leitores de tela (`aria-expanded`, `role="region"`).
  - Modal "Como Citar" com formatação automática ABNT (NBR 6023) e APA 7th.
  - Alvos de toque >= 44x44px e contorno de foco visível dourado (`#E5C384`).
- **Interatividade & Análise Temporal:**
  - Filtro dinâmico por intervalo de anos (2018 a 2024).
  - Opção de **Normalização Base 100** (`ano inicial = 100`) para comparar grandezas de unidades distintas no mesmo plano visual.
  - Filtro por blocos temáticos: Economia, Distribuição, Pessoas, Ambiente e Percepção.

### 📝 Regras Editoriais para a Curadora
1. **Neutralidade e Transparência Epistêmica:**
   - Nenhum título ou cabeçalho deve trazer conclusões prontas ou viés valorativo.
   - O aviso institucional inicial no topo é obrigatório.
2. **Proibição Estrita de Dados Inventados:**
   - Todos os dados devem provir de fontes oficiais documentadas (IBGE, PNUD, Global Footprint Network, World Happiness Report, Ipsos).
   - Se uma série tiver lacuna ou não estiver consolidada, deve ser marcada como `"dados a preencher"`, jamais estimada por intuição.
3. **Obrigatoriedade do Campo "O que este número não mede":**
   - Todo cartão de indicador deve explicitar de forma clara e honesta as limitações intrínsecas da métrica.
4. **Respeito aos Conceitos Originários (Buen Vivir / Teko Porã / Ubuntu):**
   - Não homogeneizar tradições distintas como se fossem uma só.
   - Não transformar cosmovisões ancestrais em índices numéricos ou pontuações quantitativas.
   - Textos conceituais e a seção "Outros Olhares" mantêm o rótulo explícito de **RASCUNHO** para permanente revisão comunitária.
5. **Debate Público Convivial:**
   - A área de debate apresenta perguntas reflexivas sem comentários simulados; o formulário permanece como `"Comentários em breve"` até a ativação do backend seguro e moderado.

---

## 🚀 Como Executar

Execute o servidor local:
```powershell
node _serve.js
```
Acesse em: **[http://localhost:3333](http://localhost:3333)**

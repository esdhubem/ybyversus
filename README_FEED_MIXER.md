# ⚖️ Módulo de Distribuição Justa de Conteúdo ("Feed Mixer") • YBY versus

Documentação técnica, formulação matemática, diretrizes de privacidade e guia de manutenção do algoritmo ético sem bolhas do ecossistema YBY versus.

---

## 1. Filosofia & Princípios Éticos

Ao contrário das redes comerciais que leiloam a atenção humana através de algoritmos viciosos de engajamento (curtidas, comentários polarizados e retenção extrema), o **YBY versus** adota o modelo de **Distribuição Justa Sem Bolhas**:

1. **Sem Impulsionamento Pago:** O alcance não pode ser comprado por dinheiro ou publicidade.
2. **Sem Perfilamento Centralizado:** O histórico temático é calculado **exclusivamente no aparelho do usuário** (`localStorage`), sem telemetria para servidores.
3. **Pluralidade Garantida:** Criadores de pequeno, médio e grande porte compartilham o mesmo espaço com equidade.
4. **Fura-Bolhas Sistêmico:** 20% de cada página é deliberadamente reservado para saberes fora do histórico recente do usuário.
5. **Transparência Absoluta:** Todo item carrega o botão *"Por que estou vendo isso?"*, explicando abertamente qual cota o posicionou ali.

---

## 2. As 5 Cotas Equitativas por Página

A composição de cada página do feed é calculada com rigor matemático:

| Cota | % Peso | Descrição | Rótulo no Card |
| :--- | :---: | :--- | :--- |
| **Novidades** | **25%** | Itens mais recentes publicados na praça | `Chegou agora` |
| **Vozes Plurais** | **25%** | Representação equilibrada entre criadores de pequeno (<1k), médio (1k–10k) e grande porte (>10k) | `Vozes diversas` |
| **Diversidade Temática** | **20%** | Temas e tags que o usuário ainda não explorou nesta sessão | `Fora da bolha` |
| **Novos Integrantes** | **15%** | Criadores cuja conta tem menos de 30 dias | `Boas-vindas` |
| **Sorteio Justo** | **15%** | Amostra uniforme aleatória entre todos os elegíveis, embaralhada com Fisher-Yates | `Surpresa` |

---

## 3. Formulação Matemática: Método do Maior Resto

Para um tamanho de página de $N = 20$ itens:

1. **Cota Exata Decimal:** $q_i = \frac{w_i \times N}{100}$
   - Novidades ($25\%$): $0.25 \times 20 = 5.0$
   - Vozes Plurais ($25\%$): $0.25 \times 20 = 5.0$
   - Diversidade Temática ($20\%$): $0.20 \times 20 = 4.0$
   - Novos Integrantes ($15\%$): $0.15 \times 20 = 3.0$
   - Sorteio Justo ($15\%$): $0.15 \times 20 = 3.0$
2. **Cotas Inteiras:** $\mathbf{5, 5, 4, 3, 3}$ (somam exatamente 20).
3. **Desempate Determinístico:** Caso o tamanho de página gere restos decimais (ex.: páginas de 15 itens), os restos são ordenados do maior para o menor com desempate determinístico pela ordem de prioridade:
   $$\text{Novidades} \rightarrow \text{Vozes Plurais} \rightarrow \text{Diversidade Temática} \rightarrow \text{Novos Integrantes} \rightarrow \text{Sorteio Justo}$$

---

## 4. Regras de Negócio e Salvaguardas

* **Teto por Criador:** No máximo **2 itens do mesmo criador por página**, evitando monopólio do feed.
* **Vaga Única:** Um item só ocupa uma vaga por página. O preenchimento ocorre em **ordem de escassez** (a categoria com menor número de itens elegíveis é atendida primeiro).
* **Redistribuição Proporcional:** Se uma categoria não possuir candidatos suficientes (ex: falta de criadores com menos de 30 dias), as vagas vagas são redistribuídas para o sorteio imparcial entre os demais elegíveis.
* **Reprodutibilidade por Semente (PRNG):** Usamos o gerador **Mulberry32** com seed por sessão, garantindo que testes automatizados sejam 100% determinísticos e auditáveis.

---

## 5. Como Substituir os Dados de Exemplo por Dados Reais

A camada de dados foi completamente isolada em [`feed/data.js`](feed/data.js).

Para conectar a uma API REST, GraphQL ou instância do Fediverso:
```javascript
// Em feed/data.js:
export async function fetchFeedPool(tabName = 'videos_curtos') {
  const res = await fetch(`https://api.seuservidor.org/v1/feed/${tabName}`);
  const data = await res.json();
  return data.items; // Cada item deve conter: id, title, theme, createdAt, creator: { id, name, followersCount, createdAt }
}
```

---

## 6. Como Ajustar Pesos ou Adicionar Novas Abas

Edite o arquivo central [`feed/config.js`](feed/config.js):
```javascript
export const feedMixConfig = {
  minha_nova_aba: {
    pageSize: 20,
    maxPerCreator: 2,
    weights: {
      novidades: 30,
      vozes_plurais: 20,
      diversidade_tematica: 20,
      novos_integrantes: 15,
      sorteio: 15
    },
    // ...
  }
};
```
*O validador embutido `validateConfig()` impedirá a execução se os pesos não somarem 100.*

---

## 7. Relatório de Execução dos Testes Automatizados

Para rodar a suíte completa:
```bash
node tests/test_feed_mixer.js
```

### Resultados Obtidos:
* **Simulação de 1.000 Páginas (20.000 itens analisados):**
  - Média de Novidades: **5.00** itens por página (Alvo: 5.00);
  - Média de Vozes Plurais: **5.00** itens por página (Alvo: 5.00);
  - Média de Diversidade Temática: **4.00** itens por página (Alvo: 4.00);
  - Média de Novos Integrantes: **3.00** itens por página (Alvo: 3.00);
  - Média de Sorteio Justo: **3.00** itens por página (Alvo: 3.00);
* **Teto por Criador:** 0 violações em 1.000 páginas simuladas (máximo mantido em $\le 2$ itens);
* **Reprodutibilidade:** A mesma semente gerou a mesma sequência idêntica;
* **Deduplicação:** 0 itens repetidos na mesma sessão;
* **Segurança e Moderação:** Itens ocultos/denunciados nunca chegam ao feed.
* **Total:** **22 passaram, 0 falharam.**


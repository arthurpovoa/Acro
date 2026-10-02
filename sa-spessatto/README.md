# Sá | Spessatto Arquitetura e Interiores: site

Landing page única em HTML, CSS e JS puros, sem frameworks nem dependências.

```
sa-spessatto/
├── index.html
├── README.md
└── assets/
    ├── css/style.css
    ├── js/main.js
    └── img/          logo, favicon e os slots de foto
```

Para testar localmente, sirva a pasta com qualquer servidor estático (por exemplo `npx serve sa-spessatto` ou `python3 -m http.server` dentro da pasta) e abra no navegador. Para publicar, suba a pasta inteira para a hospedagem.

---

## 1. Trocar o número do WhatsApp

Tudo fica em **`assets/js/main.js`**, no topo:

```js
const WHATSAPP_NUMBER = '5562997006848'; // só números: 55 + DDD + número
```

Essa constante alimenta todos os pontos de WhatsApp: header, hero, depois dos projetos, processo, contato, rodapé, formulário e botão flutuante. O número exibido na seção de contato também é gerado a partir dela.

Outras mensagens que você pode editar:

| O quê | Onde |
|---|---|
| Mensagem padrão dos botões | `WA_DEFAULT_TEXT` no `main.js` |
| Mensagem de um botão específico | atributo `data-wa-text="..."` no botão, no `index.html` |
| Respostas rápidas do painel flutuante | atributo `data-wa-quick="..."` em cada botão, no fim do `index.html` |
| Texto montado pelo formulário | função `buildMessage()` no `main.js` |

**Horário de atendimento:** `BUSINESS_HOURS` no `main.js`. Ele controla o indicador "online" do painel (fuso America/Sao_Paulo) e os textos de horário da página. Se mudar o horário, ajuste também o `openingHoursSpecification` do JSON-LD no `<head>` do `index.html`. Feriados não são considerados.

---

## 2. Fotos: o que vai em cada slot

Todos os arquivos atuais em `assets/img/` são **placeholders** cor de areia, com o nome e a proporção escritos. Basta substituir cada um por uma foto **com o mesmo nome e a mesma proporção**. Se a proporção for diferente, a foto é recortada pelo centro (o layout não quebra).

| Arquivo | Proporção | Tamanho sugerido | Onde aparece | Sugestão de foto |
|---|---|---|---|---|
| `hero.jpg` | 3:2 horizontal | 2400 × 1600 | Fundo do topo, tela cheia | Melhor foto de obra, ambiente amplo e com luz. O texto fica sobre o terço inferior esquerdo, então evite detalhes importantes ali |
| `manifesto.jpg` | 2:3 vertical | 1200 × 1800 | Ao lado do manifesto | Detalhe: marcenaria, textura, encontro de materiais |
| `residencial-01.jpg` | 4:3 | 2000 × 1500 | Projetos, 1º item (grande) | Residencial |
| `office-01.jpg` | 4:5 vertical | 1200 × 1500 | Projetos, 2º item | Corporativo / clínica |
| `store-01.jpg` | 3:4 vertical | 1200 × 1600 | Projetos, 3º item | Loja |
| `residencial-02.jpg` | 16:10 | 2000 × 1250 | Projetos, 4º item | Residencial |
| `decorado-01.jpg` | 1:1 | 1500 × 1500 | Projetos, 5º item | Decorado |
| `office-02.jpg` | 3:2 | 2000 × 1333 | Projetos, 6º item | Corporativo / clínica |
| `mostra-01.jpg` | 4:5 vertical | 1200 × 1500 | Projetos, 7º item | Ambiente de mostra |
| `residencial-03.jpg` | 3:2 | 2000 × 1333 | Projetos, 8º item | Residencial |
| `andreia-spessatto.jpg` | 4:5 vertical | 1200 × 1500 | Escritório | Retrato da Andréia |
| `naira-sa.jpg` | 4:5 vertical | 1200 × 1500 | Escritório | Retrato da Náira (mesma luz e enquadramento do retrato da Andréia) |
| `instagram-01.jpg` a `instagram-04.jpg` | 4:5 vertical | 1080 × 1350 | Bloco do Instagram | Quatro posts recentes do perfil |
| `video-capa.jpg` | 16:9 | 1920 × 1080 | Capa do vídeo (antes do clique) | Capa do YouTube: baixe `https://i.ytimg.com/vi/qAH6bfe7d_4/maxresdefault.jpg` e salve com esse nome |
| `og-image.jpg` | 1200 × 630 | 1200 × 630 | Prévia ao compartilhar o link (WhatsApp, Instagram, Facebook) | Já vem pronta, com logo e nome. Pode trocar por uma foto com o logo aplicado |
| `logo.png`, `favicon-32.png` | 1:1 | 150 × 150 / 32 × 32 | Header, rodapé, painel, favicon | Logo enviado. Não trocar, a não ser por uma versão maior do mesmo arquivo |

**Depois de trocar a foto, atualize o `alt`** da `<img>` correspondente no `index.html` para descrever o que aparece de fato (ex.: "Cozinha integrada com ilha em pedra no Apartamento X").

**Peso e formato (para manter o Lighthouse acima de 90 no celular):**

- Exporte em JPG progressivo, qualidade 75–80%. Meta: `hero.jpg` até ~350 KB e as demais até ~250 KB. Squoosh (squoosh.app) resolve.
- Para usar WebP, salve com o mesmo nome e extensão `.webp` (ex.: `hero.webp`) e troque a extensão no `index.html`, inclusive no `<link rel="preload">` do hero, que fica no `<head>`. O `og-image` deve continuar em JPG.
- Para reposicionar o recorte do hero, adicione no `style.css`: `.hero { --hero-focus: 50% 70%; }` (horizontal, vertical).

---

## 3. Projetos

Cada projeto é um bloco `<article class="project">` dentro de `[data-projects]` no `index.html`:

- `data-category`: `residencial`, `corporativo`, `store`, `decorado`, `mostra` ou `food`.
- `--ratio`, no `style` do `<span class="media">`: proporção da foto (ex.: `4 / 5`).
- Nome no `<h3>`. Local e metragem: escreva dentro de `<span data-local></span>` e `<span data-area></span>` (ex.: `Setor Marista, Goiânia` e `180 m²`). Enquanto vazios, não aparecem.

O filtro é montado sozinho a partir das categorias presentes. **Categoria sem projeto não aparece**, então o item "food" (que era link morto no site anterior) só é exibido quando houver um projeto `food`. Já existe um modelo comentado no HTML: basta descomentar e colocar a foto `food-01.jpg`.

A grade assimétrica segue a ordem dos projetos visíveis (ciclo de 8 posições) e se reorganiza ao filtrar. Clicar numa foto abre a galeria: setas do teclado navegam e Esc fecha.

---

## 4. Analytics

No topo do `main.js`:

```js
const GA_MEASUREMENT_ID = ''; // cole o ID do GA4, ex.: 'G-ABC123XYZ'
```

- **Com o ID preenchido**, o script do GA4 é carregado e os eventos vão por `gtag`.
- **Com o ID vazio**, os eventos vão para `window.dataLayer`, para quem usa Google Tag Manager. Nesse caso, instale o snippet do GTM no `<head>` e crie gatilhos de evento personalizado com os nomes abaixo.
- O ID antigo (Universal Analytics, `UA-…`) foi descontinuado pelo Google e não deve ser usado.

| Evento | Quando | Parâmetros |
|---|---|---|
| `whatsapp_click` | Clique em qualquer botão de WhatsApp | `placement`: header, hero, projetos, processo, contato, footer, menu, widget_…, form_fallback |
| `whatsapp_widget_open` | Painel flutuante aberto | `source`: click ou auto |
| `generate_lead` | Envio válido do formulário | `method`, `project_type`, `project_phase` |
| `project_filter` | Uso do filtro de projetos | `category` |
| `video_play` | Clique no vídeo | `video_id` |

No GA4, marque `generate_lead` e `whatsapp_click` como **eventos-chave** (conversões). Pela LGPD, avalie incluir um aviso de cookies ao ativar o Analytics.

---

## 5. Depoimentos

Na seção de avaliações há um bloco de depoimentos **comentado e vazio**. Para publicar, descomente e repita o `<figure>` para cada depoimento, sempre com texto real e autorização do cliente. O estilo já está pronto no CSS.

---

## 6. Pendências antes de publicar

- [ ] **Ano de fundação**: há um `TODO` no hero. Quando confirmar, troque "Goiânia Setor Bueno" por "Goiânia, desde AAAA". Listagens de terceiros citam 2011, mas isso não foi confirmado com o escritório.
- [ ] **Horário de abertura**: o site sabe que fecha às 18h. A abertura às 8h é suposição (`BUSINESS_HOURS.open` e JSON-LD).
- [ ] **Domínio**: `canonical`, `og:url`, `og:image` e o JSON-LD usam `https://saspessatto.com/`. Confirme o domínio final.
- [ ] **Fotos e alts**: substituir os placeholders (seção 2) e revisar os `alt`.
- [ ] **Projetos**: nomes reais, local e metragem (seção 3).
- [ ] **Crédito no rodapé**: "Site por Acro Web Design" é opcional. Apague a linha se não quiser.

---

## 7. Notas técnicas

- **Correções em relação ao site anterior:** a viewport não bloqueia o zoom (sem `maximum-scale`). Há um único `h1` e nenhum `id` duplicado. O texto corrido usa o tom escuro (contraste acima de 4,5:1), sem dourado sobre creme. O texto é alinhado à esquerda, sem justificar. O link "food" não fica mais morto, e não há jQuery, WPBakery nem Revolution Slider.
- **Dados estruturados:** o schema.org não tem um tipo "ArchitecturalService". Por isso o JSON-LD usa `ProfessionalService` (subtipo de `LocalBusiness`) com nota 4,9 / 11 avaliações, sem nenhuma avaliação inventada. O Google costuma não exibir estrelas para notas publicadas pelo próprio negócio, mas os dados continuam válidos.
- **Fontes:** Cormorant Garamond (títulos), Jost (texto) e Roboto Mono (rótulos), via Google Fonts com `display=swap`, carregadas sem bloquear a renderização.
- **Vídeo:** o player do YouTube (`youtube-nocookie.com`) só carrega depois do clique.
- **Painel flutuante:** abre sozinho uma vez por sessão (25 s ou 50% de rolagem). Não abre com o menu aberto, com a galeria aberta, com alguém digitando ou com o formulário de contato na tela. O botão se recolhe quando o formulário aparece, para não cobrir os campos.
- **Movimento:** com `prefers-reduced-motion`, as animações e o zoom do hero ficam desligados e todo o conteúdo aparece direto.
- **Medição local (Lighthouse 12, com placeholders):** celular com Performance 100, Acessibilidade 100, Boas práticas 96 e SEO 100. Os 96 vêm só da falha de certificado do Google Fonts no ambiente de teste. Com as fotos reais o peso aumenta, por isso vale seguir os limites da seção 2.

# SEEKRA

> **Find anything. Your way.**
> *Encontre qualquer coisa. Do seu jeito.*

App WebView para o Tasker: busca de arquivos nos modos simples, regex e IA, mais um explorador de pastas, com o shell do Tasker como backend.

## Comandos

```
npm install          # instala tudo que está no package.json (use `npm ci` para seguir o lockfile à risca)
npm run dev          # ambiente web (dados de demonstração); roda `npm run icons` antes
npm run build        # dist/index.html (arquivo único, ambiente Tasker); roda `npm run icons` antes
npm run build:web    # dist/index.html (arquivo único, ambiente web); roda `npm run icons` antes
npm run preview      # serve o build web localmente
npm run icons        # regenera icon.config.js a partir do HTML e do JS (ver "Ícones")
```

Requer Node `^20.19.0 || >=22.12.0` (exigência do Vite 8).
Os dois builds gravam em `dist/` e cada um apaga o anterior: gere o de Tasker por último (ou copie o arquivo antes de rodar o outro).

## Ambientes

O alias `@env` é resolvido em `vite.config.js` pelo modo de build:

| modo    | arquivo                                  |
|---------|------------------------------------------|
| `web`   | `src/core/env/web.environment.js`        |
| `tasker`| `src/core/env/tasker.environment.js`     |

Contrato dos dois arquivos: `name`, `read`, `write`, `execute`, `notify`, `exit`, `getVariable`, `clear`, `size`.
`web.mock.js` (dados de demonstração) só entra no build web.

## Estrutura

```
index.html
src/core/app.css             entrada única do CSS (ordem do cascade), carregada por <link> no index.html
src/
  main.js
  core/                      app, event-bus, router, modal-manager, i18n, storage, api-adapter, execution-queue, env/
  features/<nome>/           <nome>.model.js, .view.js, .controller.js e, quando a feature precisa, .config.js e .css
  shared/utils|components|styles
  locales/                   pt.json, en.json, es.json
scripts/                     generate-icons.mjs (npm run icons) e icon-sprite.plugin.js (plugin do Vite)
tasker/                      exec.bsh, seekra.sh e SETUP.md
```

Features: `search`, `ai`, `results`, `explorer`, `saved`, `settings`, `file-sheet`.

## Convenções de marcação

- HTML semântico: `header`, `main`, `nav`, `section`, `h1`–`h3`, `ul`/`li`, `dl`/`dt`/`dd`, `label[for]`, `button[type="button"]`, `strong`, `time`, `output`. Elemento clicável é `button`; `div` e `span` só quando não há elemento semântico melhor.
- Classes em kebab-case, sem BEM (nada de `__` ou `--`): o nome diz o papel do elemento (`app-shell`, `section-heading`, `detail-row`), não a aparência.
- Ids em kebab-case, sempre no formato `<contexto>-<papel>` (`search-input`, `clear-scope-button`, `file-sheet`). As views seguem `<nome>-view` (`search-view`, `results-view`…), e o router monta o id assim.
- Classes de estado: `active` (aba, view, modo, chip ligado), `open` (overlay e sheet), `visible` (toast), `running` (barra de progresso) e `hidden` (utilitário).

## Renderização

Todo o markup estático (views, sheet, toast, labels, ícones fixos, selects com opções) vive em `index.html`.
O JS só atualiza dados dinâmicos, sempre por seletor de `id` (kebab-case):

- `*.view.js` exporta apenas `update.*` (mais `templates`/`helpers` quando a feature tem itens repetidos); não existe `render.page`.
- Valores simples: `textContent`, `classList`, `value` em elementos já existentes no HTML (ex.: `#volume-free`, `#sheet-path`, `#results-count-value`).
- Listas (arquivos, pastas, chips, stats, crumbs, opções de modelo…): o container já está no HTML (`#results-list`, `#explorer-list`, `#overview-stats`…) e o `view.js` só gera os itens e os injeta nele.
- Ícones que mudam em runtime: o `<svg data-icon-slot><use href="#i-…"/></svg>` fica no HTML e `setIcon(container, nome)` troca só o `href` (ver "Ícones").

## Primeiro paint

O `index.html` já nasce completo: texto em `pt` escrito dentro de cada `data-i18n`, `placeholder` escrito junto de `data-i18n-placeholder`, cards da visão geral (`#stat-volumes`, `#stat-free`, `#stat-last-search`) e ícones já expandidos pelo plugin (sprite inline injetado no build). Nada disso espera o JS nem a leitura do `settings.json`.

O `init()` é síncrono: renderiza com os padrões (`pt`, tema escuro) e dispara a carga inicial sem `await`. Cada carga é independente e atualiza só a sua parte da tela quando termina: o `storage.init()` aplica o que difere (idioma salvo, tema, API key e modelo, via evento `storage:ready`) e o `explorer.loadVolumes()` atualiza visão geral, header do explorer e raízes em Ajustes. O último resultado de `volumes` fica em `localStorage` (`seekra_volumes`): no próximo início o `explorer.restoreVolumes()` preenche visão geral, escopo e Ajustes na hora, e o `loadVolumes()` atualiza quando o Tasker responde. Se o `localStorage` estiver indisponível no WebView, tudo segue como antes. Tema e idioma seguem o mesmo caminho: o `storage` espelha só `theme`, `language` e `favorites` em `localStorage` (`seekra_preferences`, nunca a chave da API), o `app.js` aplica o idioma antes do `initChain` e um `<script>` no `<head>` define o `data-theme` antes do primeiro paint. Quando o `settings.json` termina de ler, o valor do arquivo prevalece e o espelho é atualizado. O `storage` mescla o que o usuário alterou durante a leitura e só grava depois que ela termina, para não sobrescrever o `settings.json`.

## Favoritos

A lista de pastas favoritas (caminhos absolutos) vive no `storage`, na chave `favorites`, e portanto no `settings.json`. Quem manda nela é a feature `saved` (`saved.model.js`: `getFolders`, `isFavorite`, `toggleFavorite`); nenhuma outra feature grava a lista.

- Alterar: qualquer tela emite `favorite:toggle { path }`. O `saved.controller` alterna no model, redesenha a página Salvas, emite `favorites:changed { path, added }` e mostra o toast.
- Ler: o Explorer consulta `isFavorite(caminhoAtual)` a cada render do header, em `favorites:changed` e em `storage:ready`, e o botão `#favorite-button` ganha a classe `active` e o rótulo "Favoritada" (estrela preenchida). A página Salvas redesenha em `favorites:changed`, `storage:ready` e `language:changed`.
- Enquanto o usuário nunca favoritou nem desfavoritou nada, vale a lista inicial de `FAVORITE_FOLDERS` (`saved.config.js`); na primeira alteração a lista completa é gravada e passa a valer só ela (lista vazia continua vazia).
- Favorita de um volume que não está montado (cartão SD removido) continua listada; tocar nela mostra o toast `explorer.unavailable`.

## Ícones

Os desenhos vêm do lucide, mas só em tempo de desenvolvimento: `lucide` é `devDependency` e nada dele entra no bundle.

- `src/shared/components/icon.config.js` (gerado, não edite à mão) guarda o miolo do `<svg>` de cada ícone usado: `ICONS = { 'search': '<path …/>', … }`.
- No HTML você escreve `<i data-icon="search" class="icon-sm"></i>`. No dev e no build, `scripts/icon-sprite.plugin.js` expande cada uma em `<svg class="icon-sm" aria-hidden="true"><use href="#i-search"/></svg>` e troca o marcador `<!-- icon-sprite -->` por um sprite com um `<symbol id="i-<nome>">` por ícone. O primeiro paint já sai com tudo, sem esperar JS (aberto sem o Vite, o `index.html` fica sem ícones).
- No JS, `icon('search', 'icon-sm')` devolve o mesmo `<svg><use>` já expandido. Cor e traço ficam no `<symbol>`; o preenchimento também, mas lê a variável `--icon-fill` (padrão `none`): para um ícone preenchido, o CSS só declara `--icon-fill: currentColor` no `svg` (é o que `.button.active svg` e `.icon-button.active svg` fazem na estrela de favorito). O tamanho vem das classes `icon-*` ou do CSS do contêiner.
- Slot que muda em runtime: `<i data-icon-slot data-icon="search" class="icon-sm"></i>` no HTML e `setIcon(container, nome)`, que troca só o `href`. Não existe mais `refreshIcons()`.

Ícone novo (ou removido): use `data-icon="nome"` no HTML ou o nome entre aspas no JS (`icon: 'bell'`) e rode `npm run icons`; o `npm run dev`, o `build` e o `build:web` já rodam sozinho. O comando refaz o config do zero a partir do `index.html` e de todo literal em `src/**/*.js` que seja nome de ícone do lucide, então ícone que deixou de ser usado sai sozinho. Palavra solta que por acaso é um ícone do lucide (ex.: `list`) entra no sprite sem necessidade, ~200 B cada.

Nome montado por concatenação não é visto pelo gerador: escreva o literal.

Se o HTML referenciar um ícone fora do config, o build falha dizendo o nome. O build também falha se sobrar alguma `<i data-icon>` sem expandir (autofechada, com conteúdo dentro ou sem `</i>`), listando os nomes; quebra de linha antes do `>` do fechamento (`</i⏎>`, formato do Prettier) é aceita. No JS, nome com erro de digitação ou não literal não falha o script: o dev avisa no console (`[icon] "x" não está no sprite`).

## Fila de execução

`createExecutionQueue(run, { concurrency })` executa até `concurrency` jobs ao mesmo tempo (`PARALLEL_JOBS = 3` nos dois ambientes; o padrão da função continua 1). Jobs com a mesma `key` formam uma pista e nunca se sobrepõem: buscas usam `query` (com `replace`) e leitura/escrita do mesmo arquivo usam `file:<caminho>`, então um `write` nunca passa na frente de um `read`/`write` anterior. Jobs sem `key` (volumes, list, hash, ping…) rodam em paralelo.

No Tasker, a task `SK 02 - EXEC` precisa estar com *Collision Handling* = **Run Both Together**; no padrão (*Abort New Task*), chamadas simultâneas seriam abortadas.

## Traduções

Texto fixo usa `data-i18n="chave"` e placeholder usa `data-i18n-placeholder="chave"`, sempre com o texto `pt` já escrito no HTML. `applyTranslations()` roda no `init()` (sem efeito visível quando o HTML está em dia) e a cada mudança de idioma.
Ao mudar uma string de `pt.json`, atualize também o texto correspondente no `index.html`.
Para estados que mudam a chave em runtime, use `translate(elemento, chave)` / `translatePlaceholder(elemento, chave)`; o idioma passa a acompanhar a nova chave.
Textos com parâmetros (`{{size}}`, `{{count}}`…) continuam via `t()` no `view.js`. Trechos em negrito são elementos `<strong data-i18n>` no HTML (a string é dividida em chaves).

## Protocolo JS → Tasker

Sem base64. A variável `%args` leva texto cru: 1ª linha = operação, demais linhas = `chave=valor`
(valor com quebra de linha vira chave repetida). O texto **não** passa pela linha de comando do shell:
o `exec.bsh` (ação Java Code) executa `ping`, `volumes`, `list`, `hash`, `read` e `write` em Java e, para `search`, `ia`,
`open` e `share`, grava `%args` num arquivo `.in.<rid>` na pasta de arquivos do Tasker e chama o `seekra.sh` com o caminho dele.
O retorno (`%renv`) continua sendo um envelope JSON em base64.

## Tasker

Veja `tasker/SETUP.md`.

# NEXUS

App WebView para o Tasker: busca e exploração de arquivos (simples, regex e IA) com o shell do Tasker como backend.

## Comandos

```
npm install          # instala tudo que está no package.json (use `npm ci` para seguir o lockfile à risca)
npm run dev          # ambiente web (dados de demonstração)
npm run build        # dist/index.html (arquivo único, ambiente Tasker)
npm run build:web    # dist/index.html (arquivo único, ambiente web)
npm run preview      # serve o build web localmente
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
style.css                    tokens e base (ITCSS)
src/
  main.js
  core/                      app, event-bus, router, modal-manager, i18n, storage, api-adapter, execution-queue, env/
  features/<nome>/           <nome>.model.js, .view.js, .controller.js e, quando a feature precisa, .config.js e .css
  shared/utils|components|styles
  locales/                   pt.json, en.json, es.json
tasker/                      exec.bsh, nexus.sh e SETUP.md
```

Features: `search`, `ai`, `results`, `explorer`, `saved`, `settings`, `file-sheet`.

## Protocolo JS → Tasker

Sem base64. A variável `%args` leva texto cru: 1ª linha = operação, demais linhas = `chave=valor`
(valor com quebra de linha vira chave repetida). O texto **não** passa pela linha de comando do shell:
o `exec.bsh` (ação Java Code) executa `ping`, `volumes`, `list`, `hash`, `read` e `write` em Java e, para `search`, `ia`,
`open` e `share`, grava `%args` num arquivo `.in.<rid>` na pasta de arquivos do Tasker e chama o `nexus.sh` com o caminho dele.
O retorno (`%renv`) continua sendo um envelope JSON em base64.

## Tasker

Veja `tasker/SETUP.md`.

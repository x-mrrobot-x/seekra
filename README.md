# SEEKRA

> **Find anything. Your way.**
> *Encontre qualquer coisa. Do seu jeito.*

Seekra é um aplicativo de busca e navegação de arquivos para Android. A interface é uma página web que roda em um WebView do [Tasker](https://tasker.joaoapps.com/), e as buscas são executadas pelo shell do aparelho, direto no armazenamento, sem indexação prévia.

## Recursos

- **Três modos de busca**
  - **Simples:** o nome contém o texto, sem diferenciar maiúsculas de minúsculas.
  - **Regex:** expressão regular estendida (ERE) aplicada ao nome do arquivo.
  - **IA:** descreva o que procura em linguagem natural; o Gemini converte o pedido em um comando `find` somente leitura, que é validado antes de rodar.
- **Filtros:** tipo de arquivo (imagem, vídeo, áudio, documento ou código), tamanho mínimo (1, 100 ou 500 MB), período (últimos 7 ou 30 dias) e busca recursiva ou apenas na pasta.
- **Escopo:** todos os volumes (memória interna e cartão SD) ou uma pasta específica escolhida no Explorar.
- **Explorar:** navegação por pastas com trilha de caminho, alternância entre memória interna e cartão SD e espaço livre de cada volume.
- **Salvas:** atalhos de consulta e pastas favoritas. Basta tocar em **Favoritar** no Explorar; a lista é gravada em `settings.json`.
- **Ficha do arquivo:** caminho, tamanho, data, tipo, hash SHA-256 sob demanda, abrir com outro app, compartilhar e copiar o caminho.
- **Ajustes:** tema claro ou escuro, idioma (Português, English, Español), chave e modelo do Gemini com teste de conexão, teste de execução do backend e volumes detectados.

## Como funciona

```
WebView (HTML + JS)
      │  window.Tasker.runTask
      ▼
Tasker · SK 02 - EXEC
      ├── exec.bsh   (Java)  ping, volumes, read, write, hash, open, share
      └── seekra.sh  (shell) search, ia, list
      │
      ▼  envelope JSON em base64 (%renv)
WebView
```

O JavaScript não monta comandos de shell. Ele envia à task `SK 02 - EXEC` um pedido simples (a operação na primeira linha e os parâmetros em linhas `chave=valor`) e recebe um envelope JSON de volta. Operações do sistema rodam em Java, no `exec.bsh`. Buscas e listagens rodam no `seekra.sh`, que recebe o pedido por um arquivo temporário, nunca pela linha de comando.

## Requisitos

- Android com [Tasker](https://tasker.joaoapps.com/) e acesso ao armazenamento do aparelho.
- Node.js `^20.19.0 || >=22.12.0` e npm, para gerar o build.
- Opcional: chave de API do Google Gemini, para o modo IA.

## Instalação

```bash
npm ci
npm run build
```

O comando gera `dist/index.html`, um arquivo único com CSS, JavaScript e ícones embutidos.

### Configuração do Tasker

1. Copie para o aparelho o `dist/index.html` e a pasta `tasker/scripts/` (`seekra.sh` e `exec.bsh`).
2. Importe o projeto `tasker/project/SEEKRA.prj.xml` no Tasker.
3. Em **SK 01 - MAIN**, ajuste o caminho do arquivo lido para `%html` para onde está o seu `dist/index.html`.
4. Em **SK 02 - EXEC**, ajuste a variável `%SEEKRA_DIR` para a pasta `tasker/scripts` do aparelho e cole o conteúdo de `exec.bsh` na ação *Java Code*. O código embutido no projeto exportado pode estar desatualizado em relação ao arquivo.
5. Confira que **SK 02 - EXEC** está com *Collision Handling* = **Run Both Together**. O app dispara até 3 chamadas em paralelo e, no padrão (*Abort New Task*), as simultâneas seriam abortadas.
6. Execute **SK 01 - MAIN**, abra **Ajustes** e toque em **Testar execução** para validar a comunicação com o Tasker.

A task **SK 01 - MAIN** inclui uma ação de depuração que injeta o console Eruda (carregado de um CDN) no WebView. Remova-a para o uso diário.

### Modo IA

Em **Ajustes**, informe a chave de API do Gemini, escolha o modelo e use **Testar** e **Salvar**. A chave fica apenas no `settings.json` do aparelho, na pasta `data/` dentro de `%SEEKRA_DIR`.

## Desenvolvimento

`npm run dev` abre o app no navegador com dados de demonstração, sem precisar do Tasker.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento, ambiente web (dados de demonstração). |
| `npm run build` | Gera `dist/index.html` para o Tasker. |
| `npm run build:web` | Gera `dist/index.html` para o ambiente web. |
| `npm run preview` | Serve localmente o build web. |
| `npm run icons` | Regenera `icon.config.js` a partir do HTML e do JS. Os demais comandos já o executam antes. |

Os dois builds gravam em `dist/` e o segundo apaga o primeiro. Gere o de Tasker por último, ou copie o arquivo antes.

### Estrutura

```
index.html
src/
  main.js
  core/           app, router, event bus, i18n, storage, fila de execução e ambientes (env/)
  features/       search, ai, results, explorer, saved, settings, file-sheet
  shared/         componentes, utilitários e estilos
  locales/        pt.json, en.json, es.json
scripts/          gerador de ícones e plugin de sprite do Vite
tasker/           projeto Tasker, exec.bsh e seekra.sh
```

Cada feature fica em `src/features/<nome>/` e separa `model`, `view` e `controller` (com `config` e `css` quando precisa). As features se comunicam por eventos, e o acesso ao Tasker passa por um adaptador de ambiente: o alias `@env` aponta para `src/core/env/tasker.environment.js` no build `tasker` e para `src/core/env/web.environment.js` no build `web`.

### Stack

JavaScript (módulos ES) sem framework, [Vite](https://vite.dev/) com `vite-plugin-singlefile` e ícones do [Lucide](https://lucide.dev/), usados apenas em tempo de desenvolvimento.

## Segurança e privacidade

- Toda busca e listagem fica restrita aos volumes autorizados; caminhos com `..` e pastas fora das raízes são recusados.
- Comandos gerados pela IA passam por duas validações, no app e no `seekra.sh`: só `find` com opções de leitura, terminado em `-print`, sem caracteres de shell e sem `-exec` ou `-delete`.
- A única comunicação externa do app é com a API do Gemini, e só no modo IA. Ela leva o texto do pedido e os caminhos das raízes autorizadas, junto com a chave.
- A chave do Gemini é gravada em texto simples no `settings.json`, no armazenamento do aparelho.

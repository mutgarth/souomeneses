# souomeneses

Página pessoal de projetos e redes sociais, feita com Astro. A versão orbital com planeta pixelado é a página inicial.

## Editar os links

Edite **src/content.json**: nome, frase, projetos, redes sociais e comunidade. A ordem de cada lista define a ordem na página. Para adicionar um projeto, duplique um item e preencha `name`, `url`, `logo` e `label`. Use URLs HTTPS completas. Coloque novas logos em `public/logos/`.

## Desenvolvimento

Node.js 22.12 ou superior.

```sh
npm ci
npm run dev
```

Para gerar e verificar o site:

```sh
npm run build
npm test
```

O site estático fica em `dist/`, sem servidor de aplicação ou banco. Apenas o planeta usa JavaScript, com redução de movimento e pausa fora da tela.

## Publicação

Cloudflare Pages: comando `npm run build && npm test`, saída `dist`, Node.js 22. A integração com GitHub publica novos commits automaticamente. Também é possível enviar a pasta `dist` via Wrangler.

A página principal está em `/`; os estudos anteriores ficam em `/station/`, `/terminal/` e `/concepts/`. `/orbit/` mantém acesso à versão escolhida.

## Créditos

Fonte Silkscreen com licença em `public/fonts/OFL.txt`. Ícones sociais do Simple Icons. Logos dos próprios projetos: Memory Module, Glifo e MCPocket. Arte do planeta e renderer adaptados do frontend do Memory Module.

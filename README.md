# FGV Quant — site

Site da **FGV Quant**, a Liga de Finanças Quantitativas da FGV-SP: [ligafgvquant.vercel.app](https://ligafgvquant.vercel.app).

O site é bilíngue (português por padrão, inglês em `/en`) e escuro por padrão, com um tema claro. A maior parte do conteúdo vem da planilha da liga no Google, então os membros conseguem atualizar o site sem mexer em código.

## Atualizando o conteúdo (sem código)

Equipe, eventos, projetos, competições, parceiros, depoimentos, números do fundo e dados da liga ficam na planilha **"FGV Quant - Site"**. Fotos e logos ficam na pasta **"Fotos do site"**, ao lado dela, no Drive da liga.

1. Edite a linha na planilha. Para uma imagem, suba o arquivo em "Fotos do site" e escreva o nome exato do arquivo na linha.
2. Atualize o site: use **Site → Atualizar o site agora** na planilha ou faça um redeploy no Vercel. Qualquer push na `main` também atualiza. O menu vem de [scripts/apps-script/atualizar-site.gs](scripts/apps-script/atualizar-site.gs), e o cabeçalho do arquivo explica como instalá-lo.
3. Se alguma linha estiver inválida (coluna obrigatória vazia, parceiro que não existe na aba Parceiros, arquivo que não está na pasta), o build para e o site no ar continua como estava. O log do build no Vercel diz qual é a linha.

Bom saber:

- **A planilha guarda só fatos.** Ids, ordem, agrupamentos e ilustrações dos projetos são calculados por [scripts/sync-sheet.mjs](scripts/sync-sheet.mjs).
- **Parceiros ficam escondidos** até "Autorizou uso do nome?" estar como "sim".
- **Logos precisam de fundo transparente de verdade.** O ideal é SVG. O site desenha todas as logos numa cor só, então um fundo pintado vira um bloco sólido.
- **Projetos concluídos ganham uma ilustração do tema**, escolhida por palavras-chave do título e do resumo ([scripts/project-figure.mjs](scripts/project-figure.mjs)). Se nenhuma palavra bater, o projeto fica sem ilustração.

Newsletter, a página do Quant Connect e as áreas ainda são editadas em [`content/`](content) (veja [Conteúdo](#conteúdo), mais abaixo).

## Rodando localmente

Precisa de Node 24 (a versão em uso) e pnpm 10.

```bash
pnpm install
echo GOOGLE_API_KEY=... > .env.local   # chave do Google Cloud com as APIs do Drive e do Sheets ativadas
pnpm sync                              # baixa a planilha para content/sheet/ e public/sheet/
pnpm dev                               # http://localhost:3000
```

`content/sheet/` e `public/sheet/` estão no `.gitignore`, então um clone novo precisa rodar `pnpm sync` uma vez antes do `pnpm dev`. Rode de novo sempre que quiser os dados mais recentes da planilha localmente.

| Comando                           | O que faz                                                      |
| --------------------------------- | -------------------------------------------------------------- |
| `pnpm dev`                        | Servidor de desenvolvimento (conteúdo do Velite em modo watch) |
| `pnpm sync`                       | Baixa a planilha e as fotos (precisa de `GOOGLE_API_KEY`)      |
| `pnpm build && pnpm start`        | Sincroniza, gera o build de produção e sobe o servidor local   |
| `pnpm lint`                       | ESLint                                                         |
| `pnpm typecheck`                  | `tsc --noEmit`                                                 |
| `pnpm format`                     | Prettier (com o ordenador de classes do Tailwind)              |
| `pnpm content`                    | Gera só a camada de conteúdo (`content/` → `.velite/`)         |
| `pnpm check:messages`             | Confere se `messages/pt` e `messages/en` têm as mesmas chaves  |
| `node scripts/project-figure.mjs` | Teste das palavras-chave das ilustrações dos projetos          |

**Rode só um servidor de desenvolvimento por cópia do repositório.** Dois `next dev` na mesma pasta disputam os arquivos `.next/dev/*.json` e corrompem o cache, o que aparece como um erro 500 de JSON.parse em todas as páginas.

### Variáveis de ambiente

| Variável               | Onde                 | Para quê                                                                                                                                                                                  |
| ---------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_API_KEY`       | `.env.local`, Vercel | Leitura da planilha e da pasta de fotos, usada pelo `pnpm sync`                                                                                                                           |
| `NEXT_PUBLIC_SITE_URL` | opcional             | Endereço canônico para SEO, sitemap e imagens de compartilhamento. No Vercel usa o domínio de produção; localmente, `http://localhost:3000` ([src/lib/site-url.ts](src/lib/site-url.ts)). |

## Deploy

O Vercel faz o build a partir da `main` no GitHub (`FGVQuant/FGVQuant`). O `pnpm build` roda o `pnpm sync` antes, então todo deploy pega a planilha atual. A sincronização tenta de novo os downloads do Drive que falham por erro temporário. Se um download continuar falhando, o build falha e o deploy anterior continua no ar.

## Stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents`, `typedRoutes`), React 19.3, TypeScript.
- **Tailwind v4** via `@tailwindcss/turbopack`. Os tokens de design ficam em [src/app/globals.css](src/app/globals.css), com a nomenclatura do shadcn.
- **next-intl 4** para os idiomas, **next-themes** para o tema claro/escuro, **motion** para animações e **lucide-react** para ícones.
- **Velite** para conteúdo tipado em MDX/JSON, com KaTeX para fórmulas (remark-math + rehype-katex).

> ⚠️ O Next.js 16 tem mudanças incompatíveis com versões anteriores. Por exemplo, o `middleware.ts` agora é [src/proxy.ts](src/proxy.ts), o idioma vem de `next/root-params` e a configuração roda num processo separado. Antes de usar uma API de que não tenha certeza, leia a documentação que vem em `node_modules/next/dist/docs/`.

## Estrutura do projeto

```
content/
  sheet/               Gerado pelo `pnpm sync` a partir da planilha (no .gitignore; nunca edite à mão)
  newsletter/*.mdx     Um arquivo por edição da newsletter
  quant-connect.json   Página do evento Quant Connect
  areas.json           As áreas da liga
  events/photos/       Fotos de eventos guardadas no repositório
messages/{pt,en}/      Textos da interface por página (next-intl)
scripts/
  sync-sheet.mjs       Planilha + Drive → content/sheet/ e public/sheet/, com validação
  project-figure.mjs   Regras de palavras-chave das ilustrações dos projetos
  apps-script/         O menu "Site" da planilha
  check-messages.mjs   Paridade de chaves PT/EN
src/
  app/[locale]/        Uma pasta por página, com slugs em português (sobre, equipe, capital, eventos, projetos, …)
    */_components/     Componentes usados só naquela página
  app/                 Raiz: global-not-found, sitemap, robots, ícones, globals.css
  components/          Componentes compartilhados (layout, hero, sections, cards, data, mdx, terminal, ui)
  i18n/                Rotas do next-intl, configuração e helpers de navegação tipados
  lib/content.ts       TODO acesso ao conteúdo passa por aqui (ordenação, idioma, datas)
  lib/quant/           Simulações e distribuições usadas no hero, no terminal e nas ilustrações
  proxy.ts             Rotas por idioma e 404 de verdade para edições da newsletter que não existem
assets/brand/          Fontes da logo; as cópias públicas ficam em public/brand/
docs/                  Documentos de planejamento: PLAN, DECISIONS, BRAND, RESEARCH, INPUTS, WALKTHROUGH
```

### Rotas e idiomas

- Os idiomas são `pt` (padrão, sem prefixo: `/sobre`) e `en` (`/en/sobre`), configurados em [src/i18n/routing.ts](src/i18n/routing.ts). Não há detecção automática de idioma nem cookie, para as respostas poderem continuar estáticas.
- Use os helpers `Link`/`useRouter` de [src/i18n/navigation.ts](src/i18n/navigation.ts), não o `next/link`, para os prefixos de idioma funcionarem.
- Em server components, pegue o idioma com `getPageLocale()`, de [src/lib/locale.ts](src/lib/locale.ts).
- Todo texto da interface vai **nos dois** arquivos, `messages/pt/<ns>.json` e `messages/en/<ns>.json`. Rode `pnpm check:messages` depois de editar.

### Conteúdo

- As páginas nunca importam `#site/content` diretamente. Elas usam os helpers de [src/lib/content.ts](src/lib/content.ts) (`getIssues`, `getEvents`, `getFund`, `tr()` para campos `{ pt, en }` etc.).
- O [velite.config.ts](velite.config.ts) valida tudo: tanto os arquivos de `content/` quanto o que a sincronização escreve.
- Campos bilíngues têm o formato `{ "pt": "...", "en": "..." }`. A newsletter é só em português, de propósito.
- As edições da newsletter ficam como `status: "summary"` (um resumo nosso com link para o LinkedIn) até a liga mandar o texto completo e a autorização; aí passam para `"full"`.
- Para adicionar uma edição, crie `content/newsletter/YYYY-MM-<mês>.mdx` com o frontmatter definido em [velite.config.ts](velite.config.ts). O slug vem do nome do arquivo.

### Páginas só de desenvolvimento

`/dev/components` e `/dev/content` são vitrines de componentes e de conteúdo. Em produção, dão 404.

## Regras

1. **Nunca invente fatos** sobre a liga (membros, datas, e-mails, resultados). O que não se sabe ganha um aviso visível e uma entrada em [docs/INPUTS.md](docs/INPUTS.md).
2. **O FGV Quant Capital é um fundo simulado.** Toda página que mostra retornos dele precisa da marcação "Fundo Fictício / Simulated fund" (veja `capital/_components/disclaimer.tsx`).
3. **Mantenha PT e EN iguais.** Rode `pnpm check:messages`.
4. **Edite os fatos na planilha**, não em `content/sheet/`: a próxima sincronização sobrescreve.
5. **Antes de dar push:** `pnpm lint && pnpm typecheck && pnpm build` devem passar.
6. **Nada de segredos no repositório.** Os arquivos `.env*` estão no `.gitignore`.

Mais contexto para agentes de IA está em [CLAUDE.md](CLAUDE.md) e [AGENTS.md](AGENTS.md). As decisões de design e de escopo estão em [docs/DECISIONS.md](docs/DECISIONS.md).

## Marca

- **Cores:** primária `#230042`; fundos `#130421`/`#170537`; destaque lavanda `#AE94D6`.
- **Tipografia:** Lora (títulos), Geist Sans (interface), Geist Mono (dados), todas servidas pelo próprio site via `next/font`.
- **Logo:** o touro é uma geometria traçada à mão em [assets/brand/src/bull_geometry.py](assets/brand/src/bull_geometry.py). Para gerar de novo os SVGs, PNGs e o `bull-geometry.json`, rode:

  ```bash
  cd assets/brand/src && python3 -I build_svgs.py
  ```

  O texto da logo é a Lora convertida em contornos, feita pelo `outline.mjs` (usa `opentype.js` e `@fontsource/lora`). As cópias que o site usa são `public/brand/*.svg`, `src/app/icon.svg`, `apple-icon.png` e `favicon.ico`.

Os detalhes completos estão em [docs/BRAND.md](docs/BRAND.md).

## Licença

O código-fonte está sob a [Licença MIT](LICENSE). O nome, a logo e os materiais de marca da FGV Quant (`assets/brand/`, `public/brand/`, os ícones do site), o conteúdo do site (`content/` e a planilha da liga) e os documentos em `docs/entregas/` **não** estão cobertos: pertencem à liga e/ou à FGV. Veja o [NOTICE](NOTICE).

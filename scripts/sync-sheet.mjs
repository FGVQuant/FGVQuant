// Pulls the league's admin spreadsheet and photo folder from Google Drive into content/sheet/
// (JSON + photos, read by velite) and public/sheet/ (logos, papers). Both are gitignored.
// The sheet holds facts only; everything about presentation (ids, order, groups, figures,
// links) is derived here. Any invalid row aborts the sync before anything is written.
// Usage: pnpm sync   (needs GOOGLE_API_KEY, from .env.local locally or the host's env)
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { figureFor } from "./project-figure.mjs";

/** "FGV Quant - site" folder on the league's Drive: the spreadsheet plus "Fotos do site". */
const FOLDER = "1CVmNj4WNtqLL5Ex-kre9tuqX52IzhCoa";
const KEY = process.env.GOOGLE_API_KEY;
const OUT = "content/sheet";
const PUB = "public/sheet";

// ── presentation, kept in code ────────────────────────────────────────────────

/** Team cards on /equipe, by sheet "Área". Unknown areas get a generic card after these. */
const GROUPS = {
  Presidência: {
    id: "presidencia",
    title: { pt: "Presidência", en: "Presidency" },
    featured: true,
  },
  Acadêmica: { id: "academica", title: { pt: "Equipe Acadêmica", en: "Academic team" } },
  "Pesquisas e Mídias": {
    id: "pesquisas-midias",
    title: { pt: "Equipe de Pesquisas e Mídias", en: "Research and media team" },
  },
  Institucional: {
    id: "institucional",
    title: { pt: "Equipe Institucional", en: "Institutional team" },
  },
  Projetos: { id: "projetos", title: { pt: "Equipe de Projetos", en: "Projects team" } },
};
/** Director titles, by area. */
const DIRECTOR = {
  Acadêmica: { pt: "Diretoria Acadêmica", en: "Head of Academics" },
  "Pesquisas e Mídias": { pt: "Diretoria de Pesquisas e Mídias", en: "Head of Research and Media" },
  Institucional: { pt: "Diretoria Institucional", en: "Head of Institutional Relations" },
  Projetos: { pt: "Diretoria de Projetos", en: "Head of Projects" },
};
const EVENT_KIND = {
  "Evento/palestra": "event",
  Aula: "class",
  Visita: "visit",
  Competição: "competition",
  Marco: "milestone",
};
const PROJECT_KIND = { Pesquisa: "research", Fundo: "fund", Trainee: "trainee" };
const STATUS = { Concluído: "done", "Em andamento": "in-progress" };
const STRATEGY = { "Pairs trading": "pairs", Momentum: "momentum", "Fundo (total)": "fund" };
const STRATEGY_STATUS = { Ativa: "active", Encerrada: "closed" };
const FUND = { name: "FGV Quant Capital", source: "https://www.linkedin.com/company/fgvquant" };

// ── Google APIs ───────────────────────────────────────────────────────────────

if (!KEY) fail(["GOOGLE_API_KEY não definida (.env.local ou variável de ambiente)."]);

async function api(url) {
  const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}key=${KEY}`);
  if (!res.ok) fail([`Google API ${res.status}: ${(await res.text()).slice(0, 300)}`]);
  return res;
}

async function list(folder) {
  const files = [];
  let page = "";
  do {
    const q = encodeURIComponent(`'${folder}' in parents and trashed = false`);
    const j = await (
      await api(
        `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=1000&fields=nextPageToken,files(id,name,mimeType,size)${page && `&pageToken=${page}`}`,
      )
    ).json();
    files.push(...j.files);
    page = j.nextPageToken ?? "";
  } while (page);
  return files;
}

const root = await list(FOLDER);
const sheetFile = root.find((f) => f.mimeType === "application/vnd.google-apps.spreadsheet");
const photoFolder = root.find((f) => f.mimeType === "application/vnd.google-apps.folder");
if (!sheetFile || !photoFolder)
  fail(["A pasta do Drive precisa ter uma planilha Google (não .xlsx) e a pasta 'Fotos do site'."]);
const files = new Map((await list(photoFolder.id)).map((f) => [f.name, f]));

const TABS = [
  "Membros",
  "Eventos",
  "Projetos",
  "Competições",
  "Equipes",
  "Parceiros",
  "Depoimentos",
  "Fundo mensal",
  "Fundo resumo",
  "Estratégias",
  "Entidade",
  "Newsletter",
  "Listas",
];
const ranges = TABS.map(
  (t) => `ranges=${encodeURIComponent(`'${t}'!A${t === "Listas" ? 1 : 4}:Z`)}`,
).join("&");
const { valueRanges } = await (
  await api(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetFile.id}/values:batchGet?${ranges}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`,
  )
).json();

// ── parsing helpers ───────────────────────────────────────────────────────────

const errors = [];
const sheet = {};
TABS.forEach((t, i) => {
  const [head = [], ...rows] = valueRanges[i].values ?? [];
  sheet[t] = rows
    .map((r, n) => ({
      ...Object.fromEntries(head.map((h, c) => [h, clean(r[c])])),
      _where: `${t}, linha ${n + 5}`,
    }))
    .filter((r) => r[head[0]] !== undefined);
});

function clean(v) {
  if (typeof v === "string") v = v.trim();
  return v === "" || v === null ? undefined : v;
}
function fail(msgs) {
  console.error(
    ["Sincronização cancelada; o conteúdo atual não foi alterado.", ...msgs].join("\n  • "),
  );
  process.exit(1);
}
const err = (row, msg) => errors.push(`${row._where}: ${msg}`);
const need = (row, ...cols) =>
  cols.forEach((c) => row[c] === undefined && err(row, `'${c}' está vazio`));
const slug = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const names = (v) =>
  v
    ? String(v)
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
const yes = (v) => (v === "Sim" ? true : v === "Não" ? false : undefined);
/** { pt, en } with the PT text standing in for a missing translation. */
const loc = (pt, en) => (pt === undefined ? undefined : { pt: String(pt), en: String(en ?? pt) });
const pick = (row, map, col) => {
  const v = map[row[col]];
  if (v === undefined && row[col] !== undefined) err(row, `'${col}' inválido: ${row[col]}`);
  return v;
};
function url(row, col) {
  const v = row[col];
  if (v !== undefined && !URL.canParse(v)) err(row, `'${col}' não é um link: ${v}`);
  return v;
}

/** Files to fetch from "Fotos do site": name → destination path. */
const wanted = new Map();
function file(row, col, dir, ref) {
  const name = row[col];
  if (name === undefined) return undefined;
  if (!files.has(name)) return err(row, `'${name}' não está na pasta 'Fotos do site'`);
  wanted.set(name, `${dir}/${name}`);
  return ref(name);
}
const photo = (row, col) => file(row, col, `${OUT}/fotos`, (n) => `./fotos/${n}`);
const asset = (row, col) => file(row, col, PUB, (n) => `/sheet/${n}`);

/** A sheet date: serial number (typed as a date), "2025.1" semester, "2024" year, or dd/mm/aaaa text. */
function when(row, col) {
  const v = row[col];
  const iso = (d) => d.toISOString().slice(0, 10);
  const semester = (d) => `${d.slice(0, 4)}.${Number(d.slice(5, 7)) <= 6 ? 1 : 2}`;
  if (typeof v === "number" && v > 3000) {
    const date = iso(new Date(Date.UTC(1899, 11, 30) + v * 864e5));
    return { date, datePrecision: "day", period: semester(date) };
  }
  const s = String(v ?? "");
  let m;
  if ((m = s.match(/^(\d{4})$/)))
    return { date: `${m[1]}-01-01`, datePrecision: "year", period: m[1] };
  if ((m = s.match(/^(\d{4})\.([12])$/)))
    return {
      date: `${m[1]}-${m[2] === "1" ? "01" : "07"}-01`,
      datePrecision: "semester",
      period: s,
    };
  if ((m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) {
    const date = `${m[3]}-${m[2]}-${m[1]}`;
    return { date, datePrecision: "day", period: semester(date) };
  }
  err(row, `'${col}' inválida: ${v ?? "(vazia)"}. Use dd/mm/aaaa, 2025.1 ou 2024`);
}
/** Month as "aaaa-mm", from a date serial or "mm/aaaa" text. */
function month(row, col) {
  const v = row[col];
  if (typeof v === "number" && v > 3000)
    return new Date(Date.UTC(1899, 11, 30) + v * 864e5).toISOString().slice(0, 7);
  const m = String(v ?? "").match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[2]}-${m[1].padStart(2, "0")}`;
  err(row, `'${col}' inválido: ${v ?? "(vazio)"}. Use mm/aaaa`);
}
const semesterOf = (row, col) => {
  const v = row[col] === undefined ? undefined : String(row[col]);
  if (v !== undefined && !/^\d{4}\.[12]$/.test(v)) err(row, `'${col}' inválido: ${v}. Use 2026.2`);
  return v;
};

// ── tabs → velite collections ─────────────────────────────────────────────────

const areaEn = Object.fromEntries(
  sheet.Listas.map((r) => [r["Área"], r["Área (inglês)"]]).filter(([a]) => a),
);
const roleEn = Object.fromEntries(
  sheet.Listas.map((r) => [r.Cargo, r["Cargo (inglês)"]]).filter(([c]) => c),
);
const courseEn = Object.fromEntries(
  sheet.Listas.map((r) => [r.Curso, r["Curso (inglês)"]]).filter(([c]) => c),
);

const active = sheet.Membros.filter((r) => r["Saída"] === undefined);
const groups = new Map();
const members = active.map((r, i) => {
  need(r, "Nome", "Área", "Cargo");
  if (r["Área"] && !(r["Área"] in areaEn)) err(r, `'Área' fora da lista: ${r["Área"]}`);
  if (r.Cargo && !(r.Cargo in roleEn)) err(r, `'Cargo' fora da lista: ${r.Cargo}`);
  const entrada = semesterOf(r, "Entrada"); // semestre em que entrou na liga (agrupa os trainees)
  semesterOf(r, "Saída");
  // Curso e semestre de ingresso na faculdade: opcionais; o site calcula o semestre atual.
  const ingresso = semesterOf(r, "Ingresso na FGV");
  if (r.Curso && !(r.Curso in courseEn)) err(r, `'Curso' fora da lista: ${r.Curso}`);
  let group;
  if (r.Cargo === "Trainee") {
    if (!entrada) err(r, "trainee precisa do semestre de 'Entrada'");
    group = {
      id: `trainees-${String(entrada).replace(".", "-")}`,
      title: { pt: `Trainees ${entrada}`, en: `Trainees ${entrada}` },
      wide: true,
      sort: 100 + Number(entrada),
    };
  } else {
    const known = Object.keys(GROUPS).indexOf(r["Área"]);
    group =
      known >= 0
        ? { ...GROUPS[r["Área"]], sort: known }
        : {
            id: slug(r["Área"]),
            title: { pt: `Equipe ${r["Área"]}`, en: `${areaEn[r["Área"]] ?? r["Área"]} team` },
            sort: 50,
          };
  }
  groups.set(group.id, group);
  const role =
    r.Cargo === "Presidente"
      ? { pt: "Presidência", en: "President" }
      : r.Cargo === "Diretor(a)"
        ? (DIRECTOR[r["Área"]] ?? {
            pt: `Diretoria de ${r["Área"]}`,
            en: `Head of ${areaEn[r["Área"]]}`,
          })
        : undefined;
  return {
    id: slug(r.Nome),
    name: r.Nome,
    ...(role && { role }),
    group: group.id,
    lead: r.Cargo === "Diretor(a)",
    ...(r.Curso && { course: { pt: r.Curso, en: courseEn[r.Curso] ?? r.Curso } }),
    ...(ingresso && { enrolled: ingresso }),
    photo: photo(r, "Foto"),
    linkedin: url(r, "LinkedIn"),
    order: i + 1,
  };
});
dupes(members, "Membros", (m) => m.id);

const teamGroups = [...groups.values()]
  .sort((a, b) => a.sort - b.sort)
  .map(({ id, title, featured, wide }, i) => ({ id, title, featured, wide, order: i + 1 }));

const partners = sheet.Parceiros.map((r) => {
  need(r, "Empresa", "O que fizemos juntos");
  return {
    id: slug(r.Empresa),
    name: r.Empresa,
    relation: loc(r["O que fizemos juntos"], r["O que fizemos juntos (inglês)"]),
    url: url(r, "Site"),
    logo: asset(r, "Logo"),
    permission: yes(r["Autorizou uso do nome?"]) ?? false,
  };
});
const partnerIds = new Set(partners.map((p) => p.id));

const events = sheet.Eventos.map((r) => {
  need(r, "Data", "Tipo", "Título");
  const kind = pick(r, EVENT_KIND, "Tipo");
  const ps = names(r.Parceiros).map((n) => {
    if (!partnerIds.has(slug(n))) err(r, `parceiro '${n}' não está na aba Parceiros`);
    return slug(n);
  });
  const d = when(r, "Data") ?? {};
  // ponytail: links derived from kind/title; give events a "Link" column if more cases appear.
  const href = /quant connect/i.test(r["Título"])
    ? "/eventos#quant-connect"
    : kind === "competition"
      ? "/projetos#competicoes"
      : undefined;
  return {
    id: `${d.period}-${slug(r["Título"])}`,
    ...d,
    kind,
    title: loc(r["Título"], r["Título (inglês)"]),
    description: loc(r["Descrição"], r["Descrição (inglês)"]),
    location: r.Local,
    href,
    partners: ps,
    source: url(r, "Fonte"),
    photo: photo(r, "Foto"),
  };
});
dupes(events, "Eventos", (e) => e.id);

const projects = sheet.Projetos.map((r) => {
  need(r, "Semestre", "Tipo", "Status", "Título", "Resumo");
  const period = semesterOf(r, "Semestre");
  const kind = pick(r, PROJECT_KIND, "Tipo");
  const status = pick(r, STATUS, "Status");
  const id = `${String(period).replace(".", "-")}-${slug(r["Título"])}`;
  return {
    id,
    period,
    kind,
    status,
    title: loc(r["Título"], r["Título (inglês)"]),
    summary: loc(r.Resumo, r["Resumo (inglês)"]),
    members: names(r.Membros),
    lead: r["Líder"],
    partner: r.Parceiro,
    mentor: r.Mentor,
    award: loc(r["Prêmio"], r["Prêmio (inglês)"]),
    figure:
      kind === "fund"
        ? "fund"
        : status === "in-progress"
          ? "ongoing"
          : figureFor(r["Título"], r.Resumo),
    photo: photo(r, "Foto"),
    paper: asset(r, "Artigo (PDF)"),
    link: url(r, "Link"),
    href: kind === "fund" ? "/capital" : undefined,
  };
});
dupes(projects, "Projetos", (p) => p.id);

const competitions = sheet["Competições"].map((r) => {
  need(r, "Competição", "Organizador", "Ano", "Resumo");
  return {
    id: slug(r["Competição"]),
    name: r["Competição"],
    organizer: r.Organizador,
    year: Number(r.Ano),
    summary: loc(r.Resumo, r["Resumo (inglês)"]),
    source: url(r, "Fonte"),
    // ponytail: results are the league's own posts for now; add a column once one is confirmed externally.
    selfReported: true,
    teams: [],
  };
});
const byComp = new Map(competitions.map((c) => [c.name, c]));
for (const r of sheet.Equipes) {
  need(r, "Competição", "Equipe", "Resultado");
  const c = byComp.get(r["Competição"]);
  if (!c) {
    err(r, `competição '${r["Competição"]}' não está na aba Competições`);
    continue;
  }
  const official = yes(r["Equipe da liga?"]) ?? true;
  c.teams.push({
    name: r.Equipe,
    result: loc(r.Resultado, r["Resultado (inglês)"]),
    strategy: loc(r["Estratégia"], r["Estratégia (inglês)"]),
    members: names(r.Membros),
    // a placed result by a league team counts in the home KPI
    ranked: official && !/particip/i.test(r.Resultado),
    official,
  });
}

const memberByName = new Map(members.map((m) => [m.name, m]));
const testimonials = sheet.Depoimentos.map((r, i) => {
  need(r, "Nome", "Depoimento");
  const own = photo(r, "Foto");
  return {
    id: slug(r.Nome),
    name: r.Nome,
    member: own ? undefined : memberByName.get(r.Nome)?.id,
    photo: own,
    context: loc(r["Quem é"], r["Quem é (inglês)"]),
    quote: { pt: r.Depoimento, en: r["Depoimento (inglês)"] },
    order: i + 1,
  };
});

const summary = Object.fromEntries(sheet["Fundo resumo"].map((r) => [r["Estratégia"], r]));
const info = (label) => sheet["Fundo resumo"].find((r) => r["Estratégia"] === label);
const num = (r, col) => (r?.[col] === undefined ? undefined : Number(r[col]));
const fundRows = Object.entries(summary)
  .filter(([label]) => STRATEGY[label] || label === "CDI")
  .map(([label, r]) => ({
    id: STRATEGY[label] ?? "benchmark",
    totalReturn: num(r, "Retorno total"),
    volatility: num(r, "Volatilidade"),
    sharpe: num(r, "Sharpe"),
    maxDrawdown: num(r, "Max drawdown"),
    positiveMonths: num(r, "Meses positivos"),
    negativeMonths: num(r, "Meses negativos"),
    monthsAboveBenchmark: num(r, "Meses acima do CDI"),
    monthsBelowBenchmark: num(r, "Meses abaixo do CDI"),
    bestMonth: num(r, "Melhor mês"),
    worstMonth: num(r, "Pior mês"),
  }));
// the info block sits under the table: label in column A, value in column C ("Volatilidade")
const infoRow = (label) => {
  const r = info(label);
  if (!r) errors.push(`Fundo resumo: falta a linha '${label}'`);
  return { ...r, _where: r?._where, [label]: r?.["Volatilidade"] };
};
const fund = {
  ...FUND,
  simulated: true,
  inception: month(infoRow("Início do fundo"), "Início do fundo"),
  cumulativeReturn: fundRows.find((r) => r.id === "fund")?.totalReturn,
  cumulativeAsOf: month(infoRow("Relatório de"), "Relatório de"),
  monthly: sheet["Fundo mensal"].map((r) => ({
    month: month(r, "Mês"),
    return: Number(r["Retorno (%)"]),
  })),
  overview: {
    benchmark: "CDI",
    benchmarkReturn: fundRows.find((r) => r.id === "benchmark")?.totalReturn,
    correlation: Number(
      infoRow("Correlação entre as estratégias")["Correlação entre as estratégias"],
    ),
    rows: fundRows,
  },
};

// Strategy descriptions on /capital. "Regras" holds one rule per line, "Título: texto"; the optional
// exposure columns (% of equity) draw the long/short bars. Known names keep the ids the fund tables use.
const rules = (row, col) =>
  row[col] === undefined
    ? undefined
    : String(row[col])
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const i = l.indexOf(":");
          if (i < 1) err(row, `'${col}': cada linha precisa ser "Título: texto" (linha: ${l})`);
          return { title: l.slice(0, i).trim(), body: l.slice(i + 1).trim() };
        });
const pct = (row, col) => {
  if (row[col] === undefined) return undefined;
  const v = Number(row[col]);
  if (!Number.isFinite(v) || v < 0) err(row, `'${col}' inválido: ${row[col]}`);
  return v;
};
const strategies = sheet["Estratégias"].map((r, i) => {
  need(r, "Estratégia", "Status", "Resumo", "Regras");
  const pt = rules(r, "Regras") ?? [];
  const en = rules(r, "Regras (inglês)");
  if (en && en.length !== pt.length)
    err(r, "'Regras (inglês)' precisa ter o mesmo número de linhas que 'Regras'");
  const long = pct(r, "Exposição comprada (%)");
  const short = pct(r, "Exposição vendida (%)");
  if ((long === undefined) !== (short === undefined))
    err(r, "preencha as duas colunas de exposição, ou nenhuma");
  return {
    id: STRATEGY[r["Estratégia"]] ?? slug(r["Estratégia"]),
    name: loc(r["Estratégia"], r["Estratégia (inglês)"]),
    status: pick(r, STRATEGY_STATUS, "Status"),
    summary: loc(r.Resumo, r["Resumo (inglês)"]),
    rules: pt.map((rule, j) => ({
      title: { pt: rule.title, en: en?.[j].title ?? rule.title },
      body: { pt: rule.body, en: en?.[j].body ?? rule.body },
    })),
    exposure: long === undefined ? undefined : { long, short },
    order: i + 1,
  };
});
dupes(strategies, "Estratégias", (x) => x.id);

// A row's summary (Resumo, Texto…) becomes content/sheet/newsletter/<aaaa-mm>-<mês>.mdx, read by velite
// like the hand-written ones in content/newsletter/, which it overrides. A row without one shows on
// the site as "resumo em breve" with the link.
const summaries = [];
const newsletter = sheet.Newsletter.map((r) => {
  need(r, "Edição", "Link");
  const issue = r["Nº"] === undefined ? undefined : Number(r["Nº"]);
  if (issue !== undefined && !(Number.isInteger(issue) && issue > 0))
    err(r, `'Nº' inválido: ${r["Nº"]}`);
  const edition = month(r, "Edição");
  if (r.Resumo === undefined) {
    if (r.Texto !== undefined) err(r, "tem 'Texto' mas 'Resumo' está vazio");
  } else if (edition) {
    const excerpt = String(r.Resumo);
    if (excerpt.length > 400) err(r, `'Resumo' passa de 400 caracteres (${excerpt.length})`);
    const name = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(
      new Date(`${edition}-01`),
    );
    const fm = {
      title:
        r["Título"] ??
        `FGV Quant Insights: ${name[0].toUpperCase()}${name.slice(1)} de ${edition.slice(0, 4)}`,
      edition,
      excerpt,
      tags: names(r.Tags),
      ...(r.Personalidade !== undefined && { personality: String(r.Personalidade) }),
      status: "summary",
    };
    // Texto is markdown, compiled as MDX: escape what MDX and KaTeX would read as code or maths.
    // Without it, the page shows the Resumo.
    const body = String(r.Texto ?? excerpt).replace(/[{}<$]/g, "\\$&");
    const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
    summaries.push([`${edition}-${slug(name)}.mdx`, `---\n${yaml.join("\n")}\n---\n\n${body}\n`]);
  }
  return { edition, url: url(r, "Link"), issue };
});
dupes(newsletter, "Newsletter", (n) => n.edition);

const entity = Object.fromEntries(sheet.Entidade.map((r) => [r.Campo, r.Valor]));
const formUrl = entity["Processo seletivo: link do formulário"];
const site = {
  founded: Number(entity["Ano de fundação"]),
  members: members.length,
  membersAsOf: new Date().toISOString().slice(0, 7),
  email: entity["E-mail de contato"],
  instagram: entity.Instagram,
  linkedin: entity.LinkedIn,
  newsletterUrl: entity["Newsletter (LinkedIn)"],
  recruitment: {
    open: yes(entity["Processo seletivo: inscrições abertas?"]),
    next: String(entity["Processo seletivo: próximo ciclo"] ?? ""),
    formUrl,
    placeholder: !formUrl,
  },
};

function dupes(list, tab, key) {
  const seen = new Set();
  for (const x of list) {
    if (seen.has(key(x))) errors.push(`${tab}: item repetido (${key(x)})`);
    seen.add(key(x));
  }
}

if (errors.length) fail(errors);

// ── write: files first, JSON last, so a failed download leaves the previous JSON (and its files) in place ──

mkdirSync(`${OUT}/fotos`, { recursive: true });
mkdirSync(PUB, { recursive: true });
for (const [name, dest] of wanted) {
  // ponytail: unchanged = same size; compare md5Checksum if a same-size swap ever slips through.
  const { id, size } = files.get(name);
  if (existsSync(dest) && statSync(dest).size === Number(size)) continue;
  // the public download host, not the API's alt=media, which Google throttles after a few dozen files.
  // Drive answers the odd 429/503 on a cold build that fetches everything: back off and retry.
  let res, body;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    res = await fetch(
      `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
    ).catch(() => null);
    body = res ? Buffer.from(await res.arrayBuffer()) : Buffer.alloc(0);
    if (body.length === Number(size)) break;
  }
  if (body.length !== Number(size))
    fail([
      `não consegui baixar '${name}' do Drive (${res ? `HTTP ${res.status}` : "erro de rede"}) após 5 tentativas. Tente de novo.`,
    ]);
  writeFileSync(dest, body);
}

const json = {
  members,
  groups: teamGroups,
  events,
  projects,
  competitions,
  partners,
  testimonials,
  fund,
  strategies,
  site,
  newsletter,
};
for (const [name, data] of Object.entries(json))
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 2) + "\n");
// regenerated on every sync, so a summary cleared in the sheet leaves the site too
rmSync(`${OUT}/newsletter`, { recursive: true, force: true });
mkdirSync(`${OUT}/newsletter`);
for (const [name, mdx] of summaries) writeFileSync(`${OUT}/newsletter/${name}`, mdx);

console.log(
  `Planilha sincronizada: ${members.length} membros, ${events.length} eventos, ${projects.length} projetos, ` +
    `${competitions.length} competições, ${partners.length} parceiros, ${newsletter.length} edições da newsletter (${summaries.length} com resumo na planilha), ${wanted.size} arquivos.`,
);

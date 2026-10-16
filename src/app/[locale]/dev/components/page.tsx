import { notFound } from "next/navigation";
import { ArrowRight, BrainCircuit, Code2, FlaskConical, LineChart, Sigma } from "lucide-react";
import { MonteCarloHero } from "@/components/hero/monte-carlo-hero";
import { TerminalPanel } from "@/components/terminal/terminal-panel";
import { KpiStrip } from "@/components/sections/kpi-strip";
import { DriftTimeline, type TimelineItem } from "@/components/sections/drift-timeline";
import {
  BentoCard,
  BentoGrid,
  CandlesBg,
  EquationBg,
  NodeGraphBg,
} from "@/components/sections/bento-grid";
import { LogoMarquee } from "@/components/sections/logo-marquee";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { MemberCard } from "@/components/cards/member-card";
import { EventCard } from "@/components/cards/event-card";

export const metadata = {
  title: "Componentes (dev)",
  robots: { index: false },
};

const SECTION_CLASS = "container-page py-20 border-t border-border";
const LABEL_CLASS = "mb-10 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase";

const TIMELINE: TimelineItem[] = [
  {
    id: "fundacao",
    date: "2021-01-01",
    dateLabel: "2021",
    period: "2021",
    kind: "milestone",
    title: "Fundação da liga",
    description: "A FGV Quant nasce na FGV-SP como Liga de Finanças Quantitativas.",
  },
  {
    id: "insights",
    date: "2026-03-31",
    dateLabel: "Mar 2026",
    period: "2026.1",
    kind: "milestone",
    title: "Primeira edição da FGV Quant Insights",
    description: "Lançamento da newsletter mensal com artigos técnicos e colunas convidadas.",
  },
  {
    id: "desafio",
    date: "2026-06-15",
    dateLabel: "Jun 2026",
    period: "2026.1",
    kind: "competition",
    title: "Desafio Quant AI 2026 — 2º lugar com a estratégia Augur",
    description:
      "Competição promovida pelo Itaú Asset. A equipe ficou em 2º lugar, à frente das demais equipes do top-10, incluindo Alpha Helix e El Dorado.",
  },
  {
    id: "vault",
    date: "2026-08-20",
    dateLabel: "Ago 2026",
    period: "2026.2",
    kind: "visit",
    title: "Visita à Vault Capital",
    description: "Visita técnica à gestora para conversar sobre a rotina de pesquisa e operações.",
  },
  {
    id: "aula-ia",
    date: "2026-09-10",
    dateLabel: "Set 2026",
    period: "2026.2",
    kind: "class",
    title: "Aula de IA aplicada a Finanças Quantitativas",
    description: "Com Rodrigo Togneri, em parceria com a GVTech.",
    tag: "GVTech",
  },
];

const LOGOS = [
  { name: "Itaú Asset Management" },
  { name: "Vault Capital" },
  { name: "GVTech" },
  { name: "FGV EAESP" },
  { name: "FGV EESP" },
];

export default async function ComponentsShowcase() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main id="content" className="flex flex-1 flex-col">
      {/* 1. Hero (full-bleed) */}
      <MonteCarloHero
        eyebrow="Liga de Finanças Quantitativas · FGV-SP"
        title={
          <>
            Finanças quantitativas, <Em>com rigor</Em>.
          </>
        }
        description="Pesquisa, estratégias sistemáticas e formação técnica para a próxima geração de quants do Brasil."
        actions={
          <>
            <ButtonLink href="/processo-seletivo" variant="primary" size="lg" arrow>
              Processo seletivo
            </ButtonLink>
            <ButtonLink href="/newsletter" variant="outline" size="lg">
              Ler a newsletter
            </ButtonLink>
          </>
        }
        legend="N = 128 trajetórias · μ = 8% · σ = 24% · banda p5–p95 · simulação"
      />

      {/* 2.1 KpiStrip */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.1 · KpiStrip</p>
        <KpiStrip
          locale="pt-BR"
          items={[
            { label: "Membros", value: 33 },
            { label: "Edições da newsletter", value: 7 },
            { label: "Times no top-10 · Desafio Quant AI", value: 3 },
            {
              label: "FGV Quant Capital",
              value: 18.34,
              prefix: "+",
              suffix: "%",
              decimals: 2,
              note: "Fundo fictício",
              spark: [
                100, 101.2, 100.4, 102.9, 104.1, 103.2, 106.8, 108.0, 110.5, 113.7, 114.0, 118.34,
              ],
            },
          ]}
        />
      </section>

      {/* 2.2 SectionHeader + BentoGrid */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.2 · SectionHeader · BentoGrid · BentoCard</p>
        <SectionHeader
          title="Cinco frentes, um mesmo rigor."
          description="Da modelagem de derivativos à programação de estratégias, cada frente combina matemática, estatística e código."
        />
        <div className="mt-12">
          <BentoGrid>
            <BentoCard
              title="Derivativos"
              description="Precificação, volatilidade implícita e estratégias com opções."
              icon={<Sigma />}
              className="lg:col-span-4"
              background={<CandlesBg />}
            />
            <BentoCard
              title="Machine Learning"
              description="Modelos preditivos aplicados a retornos, risco e sinais de mercado."
              icon={<BrainCircuit />}
              className="lg:col-span-2"
              background={<NodeGraphBg />}
            />
            <BentoCard
              title="Trading Algorítmico"
              description="Backtests, execução e controle de risco de estratégias sistemáticas."
              icon={<LineChart />}
              className="lg:col-span-2"
            />
            <BentoCard
              title="Pesquisa Quantitativa"
              description="Papers, replicações e novas hipóteses sobre fatores e anomalias."
              icon={<FlaskConical />}
              className="lg:col-span-2"
              background={<EquationBg />}
            />
            <BentoCard
              title="Python & Dados"
              description="Pipelines, bibliotecas científicas e ferramentas reprodutíveis."
              icon={<Code2 />}
              className="lg:col-span-2"
            />
          </BentoGrid>
        </div>
      </section>

      {/* 2.3 TerminalPanel */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.3 · TerminalPanel</p>
        <TerminalPanel
          className="mx-auto max-w-3xl"
          title="fgvquant@liga: ~"
          introCommand="cat missao.txt"
          introLines={[
            "A FGV Quant é a Liga de Finanças Quantitativas da FGV-SP, fundada em 2021.",
            "Aplicamos matemática, estatística e programação aos mercados financeiros —",
            "derivativos, machine learning, trading algorítmico e Python — com aprendizado baseado em problemas.",
          ]}
          commands={[
            { name: "join", description: "como entrar na liga", href: "/processo-seletivo" },
            { name: "newsletter", description: "FGV Quant Insights, mensal", href: "/newsletter" },
            { name: "capital", description: "fundo fictício da liga", href: "/capital" },
            { name: "team", description: "quem somos", href: "/time" },
            { name: "about", description: "missão e história", href: "/sobre" },
            {
              name: "motto",
              description: "nosso lema",
              output: ["Excelência. Inovação. Precisão."],
            },
          ]}
          labels={{
            hint: "Digite /help para ver os comandos.",
            helpHeading: "Comandos disponíveis:",
            notFound: "comando não encontrado: {cmd}",
            navigating: "abrindo {path}…",
            inputLabel: "Comando do terminal",
            chipsLabel: "Comandos rápidos",
          }}
        />
      </section>

      {/* 2.4 DriftTimeline */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.4 · DriftTimeline</p>
        <DriftTimeline
          items={TIMELINE}
          ariaLabel="Linha do tempo da liga"
          linkLabel="abrir"
          kindLabels={{
            event: "Evento",
            competition: "Competição",
            class: "Aula",
            visit: "Visita",
            milestone: "Marco",
          }}
        />
      </section>

      {/* 2.5 Cards */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.5 · NewsletterCard · MemberCard · EventCard</p>

        <div className="grid gap-6 lg:grid-cols-3">
          <NewsletterCard
            featured
            className="lg:col-span-2"
            href="/newsletter/setembro-2026"
            title="Risk is an estimate, not a number"
            dateLabel="Set 2026"
            issueLabel="Edição #7"
            excerpt="Coluna convidada de Bruno Drezza sobre Value at Risk e Expected Shortfall: por que medidas de risco são estimativas sujeitas a erro de modelo e como interpretá-las com cautela."
            tags={["Risco", "VaR", "Volatilidade"]}
            readLabel="Ler edição"
          />
          <NewsletterCard
            href="/newsletter/agosto-2026"
            title="Dados alternativos e imagens de satélite"
            dateLabel="Ago 2026"
            issueLabel="Edição #6"
            excerpt="Como sinais não tradicionais, de imagens de satélite a dados de tráfego, podem entrar em modelos de previsão de receita."
            tags={["Dados alternativos", "Satélite"]}
            readLabel="Ler edição"
          />
          <NewsletterCard
            href="/newsletter/julho-2026"
            title="Arbitragem em mercados de previsão"
            dateLabel="Jul 2026"
            issueLabel="Edição #5"
            excerpt="Oportunidades de arbitragem entre mercados de previsão e preços implícitos em derivativos."
            tags={["Arbitragem", "Previsão"]}
            readLabel="Ler edição"
          />
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <MemberCard
            name="Nome Sobrenome"
            role="Presidência"
            area="Liderança"
            linkedin="https://www.linkedin.com/"
            linkedinLabel="Nome Sobrenome no LinkedIn"
          />
          <MemberCard
            name="Nome Sobrenome"
            role="Pesquisa"
            area="Quant"
            linkedin="https://www.linkedin.com/"
            linkedinLabel="Nome Sobrenome no LinkedIn"
          />
          <MemberCard
            name="Nome Sobrenome"
            role="Trading"
            area="Execução"
            linkedin="https://www.linkedin.com/"
            linkedinLabel="Nome Sobrenome no LinkedIn"
          />
          <MemberCard
            name="Nome Sobrenome"
            role="Conteúdo"
            area="Newsletter"
            linkedin="https://www.linkedin.com/"
            linkedinLabel="Nome Sobrenome no LinkedIn"
          />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <EventCard
            title="Aula de IA aplicada a Finanças Quantitativas"
            dateLabel="10 Set"
            kind="class"
            kindLabel="Aula"
            location="Com Rodrigo Togneri · GVTech"
            description="Aplicações de inteligência artificial em finanças quantitativas."
          />
          <EventCard
            title="Visita à Vault Capital"
            dateLabel="20 Ago"
            kind="visit"
            kindLabel="Visita"
            location="São Paulo"
            description="Visita técnica para conhecer a rotina de pesquisa e operações da gestora."
          />
        </div>
      </section>

      {/* 2.6 LogoMarquee */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.6 · LogoMarquee</p>
        <p className="mb-6 font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Parceiros e colaboradores
        </p>
        <LogoMarquee label="Parceiros e colaboradores" items={LOGOS} />
      </section>

      {/* 2.7 Badges & Buttons */}
      <section className={SECTION_CLASS}>
        <p className={LABEL_CLASS}>2.7 · Badge · Button · ButtonLink · ButtonAnchor</p>

        <div className="space-y-10">
          <div>
            <p className="mb-4 font-mono text-xs text-muted-foreground">Badge</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">default</Badge>
              <Badge variant="outline">outline</Badge>
              <Badge variant="highlight">highlight</Badge>
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs text-muted-foreground">Button · variantes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">primary</Button>
              <Button variant="outline">outline</Button>
              <Button variant="ghost">ghost</Button>
              <Button variant="link">link</Button>
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs text-muted-foreground">Button · tamanhos</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
              <Button size="icon" aria-label="Próximo">
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs text-muted-foreground">Button com seta</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" arrow>
                primary
              </Button>
              <Button variant="outline" arrow>
                outline
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs text-muted-foreground">
              ButtonLink · ButtonAnchor
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/newsletter" variant="primary">
                ButtonLink primary
              </ButtonLink>
              <ButtonLink href="/newsletter" variant="ghost" arrow>
                ButtonLink ghost
              </ButtonLink>
              <ButtonAnchor href="https://www.fgv.br" variant="outline">
                ButtonAnchor externo
              </ButtonAnchor>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

# League walkthrough: sign-off checklist (Phase 6.7)

Run the site locally:

```bash
npm run dev
```

Open http://localhost:3000. Go through it with the league's president or diretoria on your machine, or by screen share. Nothing is online yet.

Tick each item. Anything marked ✏️ needs an answer or material from the league, and every one of those is tracked in [INPUTS.md](INPUTS.md). Once every box is ticked or consciously deferred, reply "approved to deploy" and Phase 7 can start.

## 1. Identity

- [ ] The **traced logo** (the bull plus the "FGV QUANT" wordmark in Lora) is approved as a faithful redraw. Files are in `assets/brand/`.
- [ ] **Colours:** deep purple (#230042) with a lavender accent, plus an optional light theme (the sun/moon toggle in the header).
- [ ] **Hero animation:** simulated price paths that flow around the bull. The caption labels it as a simulation.
- [ ] **Motto:** "Excelência. Inovação. Precisão." appears in the footer and in the terminal's `/motto` command.

## 2. Facts to confirm ✏️

Everything here comes from the league's public LinkedIn and Instagram.

- [ ] Founded in **2021**, at **FGV-SP**, with about **33 members**.
- [ ] The description "open to FGV students". Is it all schools, or EAESP only?
- [ ] **Desafio Quant AI 2026:** "Augur" (Hugo Villanova) placed 2nd, and "Alpha Helix" and "El Dorado" made the top 10. The site marks this as "divulgado pela liga" (reported by the league).
- [ ] **FGV Quant Capital:** +18.34% since inception (as of Aug/26), with Jul +0.29% and Aug +3.84%. Is it OK to publish? Can the league send the **full monthly history** and a short **methodology**?
- [ ] **Events:** the Vault Capital visit (Aug/26) and the AI class with Rodrigo Togneri and GVTech (2026.2). Exact dates are welcome.
- [ ] **Newsletter, September issue:** is "Merton" Robert C. Merton?

## 3. Copy written for the site (no source yet) ✏️

Approve or reword each:

- [ ] **Sobre, "Como trabalhamos":** the "Grupos de estudo" and "Pesquisa" tiles describe activities not confirmed by our sources.
- [ ] **Áreas de atuação:** Derivativos, Machine learning, Trading algorítmico, Pesquisa quantitativa, Python & dados. These were derived from the LinkedIn description.
- [ ] **Parceiros, "Seja parceiro":** the four "what companies get" points (contact with students, talks and classes, challenges, newsletter visibility).
- [ ] **Processo seletivo:** the four FAQ answers.

## 4. Missing material ✏️

The site shows a clear "A confirmar com a liga" note until each item arrives.

- [ ] **Contact email.** Currently "E-mail a confirmar" in the footer and on Contato.
- [ ] **Team:** names, roles, areas, photos (local files) and LinkedIn URLs, plus each person's **consent to be listed**.
- [ ] **Recruitment:** open or closed, dates, stages, eligibility and the form link. The "Inscrever-se" button appears automatically once a form link exists.
- [ ] **Partners:** written **permission** from Itaú Asset, Vault Capital and GVTech to show their names and logos, plus the logo files. They stay hidden until then.
- [ ] **Newsletter:** permission to **republish full issues** on the site, plus the text of each. Until then the site shows our summaries and links to LinkedIn.
- [ ] **"Projeto AvantGarde"** (from the Linktree): what it is, and whether it belongs on the site.

## 5. Experience check (5 minutes)

- [ ] **Desktop and phone:** both look right. Use a real phone on the same Wi-Fi, at http://<this-Mac's-IP>:3000.
- [ ] **PT ⇄ EN switch:** the English reads well. Newsletter issues stay in Portuguese by design.
- [ ] **Terminal on Home:** try `/help`, `/join` and `/motto`.
- [ ] **Light theme:** toggle it and check it.

## 6. Decisions needed before deploying (Phase 7)

- [ ] **Domain:** for example `fgvquant.com.br`. That needs a Registro.br holder with a CPF or CNPJ. Who owns it?
- [ ] **Vercel account owner:** this should be the league, so it isn't tied to one student. Also confirm the Hobby vs. Pro plan (Hobby is for non-commercial use).
- [ ] **Updates:** who updates the content (newsletter issues, fund returns, team)? `docs/CONTENT-GUIDE.md` will explain how in Phase 7.

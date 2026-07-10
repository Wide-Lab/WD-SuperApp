---
name: implementar-spec
description: Use when the user asks to implement, build, or continue work on a numbered spec from .claude/specs/ in the Central de Aplicações Widelab project — e.g. "implementa a spec 03", "continua a fundação do backend", "bora fazer a busca".
---

# Implementar spec

Executa uma spec existente em `.claude/specs/` até seus critérios de aceite passarem, de
verdade — não até "parece pronto".

## Passo a passo

1. **Leia a spec inteira antes de escrever código**, junto com toda spec listada em
   `Depende de:`. Se uma dependência ainda não está implementada no código atual (specs
   descrevem intenção, não necessariamente o estado do repo — confira com `git log` e
   lendo os arquivos, não só confiando no texto), pare e avise o usuário antes de
   prosseguir.
2. Releia a seção `Fora de escopo`. É tão vinculante quanto o resto da spec: não
   implemente nada que esteja listado ali, mesmo que pareça uma extensão natural do
   trabalho.
3. Implemente seguindo a convenção de estrutura de pastas do `CLAUDE.md` do repo
   (arquitetura hexagonal no backend, `features/<domínio>` no frontend). Onde a spec dá um
   trecho de código, esse trecho é o contrato — pode adaptar nomes locais, mas não a forma
   (assinatura de função, formato de payload, nome de campo).
4. Depois de implementar, **verifique cada item de `Critérios de aceite` individualmente**,
   nesta ordem de preferência:
   - Rodando o comando ou requisição que o critério descreve, e observando o resultado real
     (não assumindo que passa porque o código parece certo).
   - Para critérios de frontend que exigem interação visual (hover, foco, animação,
     responsividade), suba o dev server e confira no navegador — não declare esses
     critérios cumpridos só por leitura de código.
   - Para specs que citam testes (`vitest`, casos numerados), escreva os testes com os
     mesmos números/casos citados na spec antes de rodar `npm run test`.
5. Rode a skill `verify` do projeto (lint, typecheck, testes das duas pontas que se
   aplicam) antes de considerar a spec concluída.
6. Reporte ao usuário, critério por critério, quais passaram e como foram verificados. Se
   algum não passou ou não pôde ser verificado (ex.: sem ambiente de browser disponível),
   diga isso explicitamente — não declare sucesso genérico.

## Quando a spec está desatualizada em relação ao código

Algumas specs deste projeto já foram superadas pela implementação real (ex.: o índice de
fases em `00-visao-geral.md` não reflete que auth e login já existem). Se, ao ler a spec,
você perceber que o código já foi além dela ou diverge dela de propósito, pare e confirme
com o usuário antes de "corrigir" o código de volta para bater com o texto — a spec pode
estar desatualizada, não o código.

## Não faça

- Não expanda escopo "já que estou aqui" — um campo a mais no schema, uma opção de
  configuração não pedida. Se parecer necessário, é uma spec nova (skill `nova-spec`), não
  um adendo silencioso a esta.
- Não marque um critério de aceite como cumprido sem tê-lo observado rodando.

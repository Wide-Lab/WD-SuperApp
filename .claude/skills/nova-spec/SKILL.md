---
name: nova-spec
description: Use when the user asks to plan, spec out, or design a new piece of work for the Central de Aplicações Widelab project before writing code — e.g. "cria uma spec para X", "vamos planejar a fase 2", "como vamos especificar isso".
---

# Nova spec

Escreve uma spec nova em `.claude/specs/` para o projeto Central de Aplicações Widelab,
seguindo exatamente o formato já estabelecido pelas specs existentes. Leia
`.claude/specs/00-visao-geral.md` inteiro antes de escrever qualquer coisa — ele contém as
decisões já tomadas e adiadas que toda spec nova precisa respeitar ou justificar
explicitamente por que está mudando.

## Onde o arquivo vai

`.claude/specs/frontend/NN-nome-curto.md` ou `.claude/specs/backend/NN-nome-curto.md`. `NN`
é o próximo número livre naquela pasta, sequencial. Se a spec não pertence a nenhuma das
duas (ex.: infraestrutura, ambas as pontas), pergunte ao usuário onde ela deve morar antes
de criar o arquivo.

Depois de criar o arquivo, adicione uma linha no índice de `.claude/specs/00-visao-geral.md`
(seção "Índice de specs"), na posição certa da ordem de implementação — cada spec ali
declara suas dependências, então a ordem importa.

## Estrutura obrigatória

```markdown
# NN — Título curto

**Depende de:** outra(s) spec(s) por nome de arquivo, ou "nada".
**Entrega:** uma frase objetiva do artefato final — arquivo, endpoint, componente.

## Objetivo

1–3 frases. Qual pergunta do usuário essa spec responde, não uma lista de features.

## Fora de escopo

O que deliberadamente não entra, e por quê (ganha spec própria depois, ou foi decidido não
fazer — ver "Decisões adiadas" na visão geral). Toda spec do projeto tem essa seção; é o
que impede escopo de crescer silenciosamente durante a implementação.

## [corpo específico da spec]

Decisões técnicas com a razão junto, não só a conclusão. Trechos de código só quando o
formato exato importa (schema, assinatura de função, payload) — não pseudocódigo genérico.
Prefira tabela a prosa para: campos de um schema, escala tipográfica, mapeamento de estado.

## Critérios de aceite

Lista numerada, cada item verificável observando o sistema rodando (uma requisição, uma
tela, um output de comando) — não "o código está limpo" ou outros critérios subjetivos.
```

## Tom e nível de detalhe — copie das specs existentes

Leia pelo menos duas specs existentes (uma de frontend, uma de backend) antes de escrever,
para calibrar o tom. Características a reproduzir:

- **Toda decisão não óbvia tem o "porquê" ao lado**, não só o "o quê". Ex.: `backend/02-auth.md`
  não diz apenas "JWT RS256"; explica por que não é HS256 (chave privada só na central) e a
  consequência aceita (logout não invalida token).
- **Seções "Fora de escopo" e "Decisões adiadas" são citadas com nomes de arquivo**, para
  quem ler daqui a três semanas não precisar redescobrir o raciocínio.
- Escrita em português, direta, sem "provavelmente" ou "talvez" — a spec é uma decisão, não
  um brainstorm. Se algo genuinamente está em aberto, isso vira uma pergunta ao usuário
  antes de escrever a spec, não uma ambiguidade dentro dela.
- Números e limiares são explícitos e, quando aplicável, medidos (contraste de cor, TTL de
  token, tamanho de payload) — nunca "razoável" ou "adequado".

## Antes de terminar

Releia a seção "Decisões tomadas" de `00-visao-geral.md` e confirme que nada na spec nova a
contradiz. Se contradiz de propósito (ex.: uma decisão adiada que agora precisa entrar em
pauta), diga isso explicitamente ao usuário — mudar uma decisão já tomada é uma escolha do
usuário, não algo para a spec decidir sozinha.

Não implemente a spec nesta skill. Para isso, use a skill `implementar-spec` depois que o
usuário aprovar o texto.

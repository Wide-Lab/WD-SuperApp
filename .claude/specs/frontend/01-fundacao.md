# 01 — Fundação do frontend

**Depende de:** nada. É a primeira spec a ser implementada.
**Entrega:** um projeto que sobe, tipa, linta e builda, com uma rota `/` vazia.

## Objetivo

Montar o esqueleto do frontend da central seguindo a convenção que o `receipt-reader`
já estabeleceu, sem SSR.

## Fora de escopo

Qualquer estilo, componente ou dado. Esta spec entrega uma página em branco. Cor,
tipografia e tokens são da `02`; o catálogo é da `03`.

## Stack

| Papel | Escolha |
|---|---|
| Build | Vite 7 |
| UI | React 19 + TypeScript (`strict: true`) |
| Rotas | TanStack Router, rotas por arquivo via `@tanstack/router-plugin` |
| Dados | TanStack Query v5 |
| Estilo | Tailwind v4 via `@tailwindcss/vite` |
| Componentes | shadcn/ui sobre Radix |
| Ícones | `lucide-react` |
| Validação | `zod` |
| Testes | Vitest |
| Qualidade | ESLint + Prettier |

Gerenciador de pacotes: **npm**, como no `receipt-reader`. Node >= 20.

### Dependências

```
react react-dom
@tanstack/react-router @tanstack/react-query
zod
tailwindcss @tailwindcss/vite
lucide-react clsx tailwind-merge class-variance-authority
@fontsource-variable/geist @fontsource-variable/geist-mono
@fontsource-variable/bricolage-grotesque
```

Dev:

```
vite @vitejs/plugin-react typescript
@tanstack/router-plugin @tanstack/react-router-devtools
vitest
eslint prettier
@types/react @types/react-dom @types/node
```

> Verificado em 2026-07-10: os três pacotes `@fontsource-variable/*` existem no registry
> (`bricolage-grotesque` 5.2.10, `geist` 5.2.9, `geist-mono` 5.2.8).

## Estrutura de pastas

```
frontend/
  public/
    apps.json            # catálogo (spec 03)
    apps.schema.json     # JSON Schema do catálogo (spec 03)
    apps/                # imagens opcionais das aplicações
  src/
    routes/
      __root.tsx
      index.tsx
    components/
      ui/                # shadcn: input, skeleton, button
      layout/
        app-shell.tsx
        masthead.tsx
    features/
      applications/
        schema.ts
        types.ts
        api.ts
        use-applications.ts
        lib/
        components/
    lib/
      utils.ts           # cn()
    styles.css
    router.tsx
    main.tsx
  index.html
  vite.config.ts
  tsconfig.json
```

Regra: **componente de domínio mora em `features/<domínio>/components`.** `components/ui`
é só shadcn; `components/layout` é só casca da página.

## Alias de import

Como no `receipt-reader`: `#/*` aponta para `./src/*`. Declarado nos dois lugares, porque
Vite e TypeScript resolvem de formas diferentes.

`package.json`:

```json
{ "imports": { "#/*": "./src/*" } }
```

`tsconfig.json`:

```json
{ "compilerOptions": { "paths": { "#/*": ["./src/*"] } } }
```

## `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: { port: 3000 },
})
```

O plugin do router precisa vir **antes** do plugin do React.

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "lint": "eslint .",
  "format": "prettier --write . && eslint --fix .",
  "check": "prettier --check ."
}
```

## Bootstrap mínimo

`src/router.tsx` cria o router com a `routeTree` gerada e `defaultPreload: 'intent'`.
`src/main.tsx` monta `<QueryClientProvider>` por fora de `<RouterProvider>`.
`src/routes/__root.tsx` renderiza `<Outlet />` e, só em desenvolvimento, os devtools.
`src/routes/index.tsx` renderiza um placeholder vazio — a vitrine chega na spec 04.

## Critérios de aceite

1. `npm run dev` sobe em `http://localhost:3000` e a rota `/` renderiza sem erro no console.
2. `npm run typecheck` passa com `strict: true`.
3. `npm run build` gera `dist/` sem warning de tipo.
4. `npm run check` e `npm run lint` passam num checkout limpo.
5. `routeTree.gen.ts` é gerado automaticamente pelo plugin e está no `.gitignore`.
6. Um import `#/lib/utils` resolve tanto no editor quanto no build.

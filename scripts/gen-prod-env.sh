#!/usr/bin/env bash
#
# Gera o `.env` de produção: par RSA da sessão + senhas aleatórias.
# Rode no SERVIDOR, a partir da raiz do repo:
#
#     bash scripts/gen-prod-env.sh
#
# Nada de segredo é impresso, exceto a senha do usuário inicial — que aparece
# uma única vez, no fim, para você guardar no gerenciador de senhas e trocar
# depois do primeiro login.
#
# Se já existir um `.env`, o script para em vez de sobrescrever: rotacionar a
# chave privada invalida todas as sessões ativas, e isso tem que ser uma decisão
# consciente, não um efeito colateral de rodar o script duas vezes.

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -e .env ]]; then
  echo "erro: .env já existe. Mova ou apague antes de gerar um novo." >&2
  echo "      (trocar AUTH_JWT_PRIVATE_KEY derruba todas as sessões ativas)" >&2
  exit 1
fi

command -v openssl >/dev/null || { echo "erro: openssl não encontrado." >&2; exit 1; }

# Defaults de produção; sobrescreva pelo ambiente, ex.:
#   PORT=9000 DOMAIN=.outro.com.br bash scripts/gen-prod-env.sh
PORT="${PORT:-8105}"
DOMAIN="${DOMAIN:-.widelab.com.br}"
DEFAULT_USER_EMAIL="${DEFAULT_USER_EMAIL:-desenvolvimento@widelab.com.br}"
DEFAULT_USER_NAME="${DEFAULT_USER_NAME:-widelab}"

# 32 bytes de entropia, alfanumérico — evita que `@` e `/` quebrem a DATABASE_URL
# que o compose monta por interpolação de string.
rand_pw() { openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 32; }

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$tmpdir/private.pem" 2>/dev/null
openssl rsa -pubout -in "$tmpdir/private.pem" -out "$tmpdir/public.pem" 2>/dev/null

POSTGRES_PASSWORD="$(rand_pw)"
MINIO_ROOT_PASSWORD="$(rand_pw)"
DEFAULT_USER_PASSWORD="$(rand_pw)"

umask 077
cat > .env <<EOF
# Gerado por scripts/gen-prod-env.sh em $(date -u +%Y-%m-%dT%H:%M:%SZ).
# NÃO commite este arquivo. NÃO reaproveite estes valores em outro ambiente.

PORT=${PORT}

# --- Postgres ---
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=central

# --- MinIO ---
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

# --- Backend ---
LOG_LEVEL=INFO

# Frontend e backend saem do mesmo nginx: mesma origem, sem CORS.
CORS_ORIGINS=[]

AUTH_JWT_PRIVATE_KEY="$(cat "$tmpdir/private.pem")"

AUTH_JWT_PUBLIC_KEY="$(cat "$tmpdir/public.pem")"

AUTH_TOKEN_TTL_SECONDS=604800

# Domínio pai: é o que faz a sessão valer para todos os subdomínios.
AUTH_COOKIE_DOMAIN=${DOMAIN}
# Exige HTTPS chegando ao navegador (TLS termina na frente deste compose).
AUTH_COOKIE_SECURE=true

AUTH_DEFAULT_USER_EMAIL=${DEFAULT_USER_EMAIL}
AUTH_DEFAULT_USER_NAME=${DEFAULT_USER_NAME}
AUTH_DEFAULT_USER_PASSWORD=${DEFAULT_USER_PASSWORD}
EOF

chmod 600 .env

cat <<EOF

.env de produção escrito (modo 600).

  cookie ......... Domain=${DOMAIN}, Secure=true
  chave RSA ...... 2048 bits, nova
  senhas ......... Postgres, MinIO e usuário inicial geradas aleatoriamente

Usuário inicial (criado no boot do container). Guarde AGORA — não é exibido de novo:

  e-mail ..... ${DEFAULT_USER_EMAIL}
  senha ...... ${DEFAULT_USER_PASSWORD}

Antes de subir, confirme que há HTTPS na frente do nginx do compose (ele escuta
só na 80). Com AUTH_COOKIE_SECURE=true e acesso por http, o navegador descarta o
cookie e o login "não funciona" sem erro visível.
EOF

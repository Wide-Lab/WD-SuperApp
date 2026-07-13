import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { safeRedirect } from '../lib/redirect'
import { useLogin } from '../use-login'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const login = useLogin()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          /*
           * Destino externo sai do router: é outra origem, e a navegação de
           * documento é o que faz o navegador levar o cookie recém-posto.
           */
          const destination = safeRedirect(redirectTo)
          if (destination) window.location.assign(destination)
          else void navigate({ to: '/' })
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="text-sm text-mute">
          E-mail
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-sm text-mute">
          Senha
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {login.isError && (
        <p
          role="alert"
          className="rounded-field border border-line bg-panel px-4 py-3 text-sm text-paper"
        >
          {login.error.message}
        </p>
      )}

      <Button type="submit" disabled={login.isPending} className="mt-2">
        {login.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}

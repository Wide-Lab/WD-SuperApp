import type { ReactNode } from 'react'

interface FieldAria {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface FormFieldProps {
  id: string
  label: string
  /** O que a pessoa precisa saber antes de digitar. */
  hint?: ReactNode
  error?: string
  /** Contador de caracteres, quando o campo tem teto. */
  counter?: string
  children: (aria: FieldAria) => ReactNode
}

/**
 * Rótulo gravado, campo, e a dica logo abaixo. O rótulo é mono e em caixa alta
 * como o eyebrow do masthead: numa bancada, o que está escrito ao lado do
 * controle é gravação, não prosa.
 *
 * A ligação `aria-describedby`/`aria-invalid` sai daqui via render prop — se
 * ficasse a cargo de quem chama, uma hora alguém esqueceria.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  counter,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.18em] text-mute uppercase"
        >
          {label}
        </label>
        {counter && (
          <span className="font-mono text-[0.6875rem] leading-none text-mute tabular-nums">
            {counter}
          </span>
        )}
      </div>

      {children({
        id,
        ...(error ? { 'aria-invalid': true as const } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })}

      {hint && (
        <p id={hintId} className="text-[0.8125rem] leading-[1.5] text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="text-[0.8125rem] leading-[1.5] text-pink-soft"
        >
          {error}
        </p>
      )}
    </div>
  )
}

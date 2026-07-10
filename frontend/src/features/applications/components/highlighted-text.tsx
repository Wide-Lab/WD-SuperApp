import { Fragment } from 'react'
import { highlight } from '../lib/highlight'

interface HighlightedTextProps {
  text: string
  query: string
}

/**
 * O rosa marca posição: o destaque diz "foi aqui que casou", exatamente como a
 * coordenada diz "é aqui que este app mora". `pink-soft`, nunca `pink`: é texto pequeno.
 */
export function HighlightedText({ text, query }: HighlightedTextProps) {
  const segments = highlight(text, query)

  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark key={index} className="text-pink-soft">
            {segment.text}
          </mark>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  )
}

interface Props {
  measurementId: string
}

export function GA4Analytics({ measurementId }: Props) {
  const initScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${measurementId}')`
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
    </>
  )
}

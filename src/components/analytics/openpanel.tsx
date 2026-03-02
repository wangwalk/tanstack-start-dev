interface Props {
  clientId: string
  apiUrl: string
}

export function OpenPanelAnalytics({ clientId, apiUrl }: Props) {
  const initScript = `window.op=window.op||function(...args){(window.op.q=window.op.q||[]).push(args)};window.op('init',{clientId:'${clientId}',apiUrl:'${apiUrl}',trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true})`
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      <script async src="https://openpanel.dev/op1.js" />
    </>
  )
}

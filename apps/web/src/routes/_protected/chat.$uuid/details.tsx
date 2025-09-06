import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/chat/$uuid/details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/chat/$uuid/details"!</div>
}

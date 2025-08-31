import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/_bottom-navigation/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/_bottom-navigation/profile"!</div>
}

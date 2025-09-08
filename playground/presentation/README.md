# Modern JavaScript/TypeScript Stack Presentation

A comprehensive 30-minute presentation about our chat application's architecture and tech stack.

## Agenda

1. **Opening: Why This Stack Now** - The problems we solve and our solution approach
2. **Architecture Overview and Repo Tour** - Monorepo structure and data flow
3. **Backend: Hono + oRPC + Better Auth + Drizzle** - Server-side architecture deep dive
4. **Frontend: React + TanStack Router + TanStack Query + shadcn/ui** - Client-side patterns
5. **Demo: Auth, Channels, Real-time Chat with SSE** - Live feature demonstrations
6. **Lessons Learned, Tradeoffs, and Q&A** - What worked, what didn't, and discussion

## Tech Stack Covered

### Backend
- **Hono**: Fast, lightweight web framework
- **oRPC**: Type-safe RPC framework with OpenAPI
- **Better Auth**: Modern authentication solution
- **Drizzle**: Type-safe ORM for PostgreSQL

### Frontend
- **React 19**: Modern React with concurrent features
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Server state management
- **shadcn/ui**: Modern component library with Radix UI

### Development Tools
- **Bun**: Fast JavaScript runtime and package manager
- **TypeScript**: End-to-end type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server

## Running the Presentation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Export as PDF
npm run export
```

## Key Features Demonstrated

1. **Type-Safe API Development**: Contract-first approach with oRPC
2. **Real-time Communication**: Server-Sent Events for live chat
3. **Modern Authentication**: Multi-provider auth with Better Auth
4. **Component Architecture**: Reusable UI components with shadcn/ui
5. **Developer Experience**: Hot reload, devtools, and type safety

## Presentation Duration

Designed for a 30-minute slot:
- 5 minutes: Opening and problem statement
- 5 minutes: Architecture overview
- 8 minutes: Backend deep dive
- 8 minutes: Frontend deep dive
- 2 minutes: Demo highlights
- 2 minutes: Lessons learned and tradeoffs

## Notes for Presenters

- Code snippets are taken directly from the actual implementation
- All examples are working code from the repository
- Focus on the "why" behind each technology choice
- Encourage questions throughout the presentation
- Have the live demo ready as a backup

## Resources

- [Slidev Documentation](https://sli.dev/)
- [Source Repository](../..) - The actual chat application
- [Live Demo](http://localhost:3001) - When running the app locally
---
theme: geist
title: Modern TypeScript Full-Stack Chat Application
info: |
  ## Modern TypeScript Full-Stack Chat Application
  A showcase of the latest TypeScript ecosystem libraries and best practices for building type-safe full-stack applications.
class: text-center
highlighter: shiki
drawings:
  enabled: true
  persist: false
transition: slide-left
mdc: true
---

# 🚀 Modern TypeScript
# Full-Stack Chat Application

A showcase of the latest TypeScript ecosystem libraries and best practices

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

---
transition: fade-out
---

# ✨ Application Features

<div class="grid grid-cols-2 gap-4 mt-6">

<div class="feature-card">
  <h3>🔐 User Authentication</h3>
  <p>Social login (Google) and email/password with Better-Auth</p>
</div>

<div class="feature-card">
  <h3>💬 Channel Management</h3>
  <p>Create, join, and manage channels with role-based permissions</p>
</div>

<div class="feature-card">
  <h3>📱 Real-time Messaging</h3>
  <p>Send and receive messages in real-time with streaming</p>
</div>

<div class="feature-card">
  <h3>🤖 AI Integration</h3>
  <p>Smart AI assistant with tool calling capabilities</p>
</div>

</div>

<style>
.feature-card {
  @apply bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700;
}
.feature-card h3 {
  @apply text-base font-semibold mb-2;
}
.feature-card p {
  @apply text-sm text-gray-600 dark:text-gray-400;
}
</style>

---

# 🏗️ Monorepo Architecture

<div class="flex justify-center">

```
hono-orpc/
├── apps/
│   ├── api/          # Hono backend server
│   └── web/          # React frontend application
├── packages/
│   ├── db/           # Drizzle ORM schema
│   └── ai/           # AI tools and integrations
└── playgrounds/
    └── ai/           # AI experimentation
```

</div>

---

# 🏗️ Why Monorepo?

<div class="mt-4">
  <ul class="space-y-3 text-lg">
    <li>✅ <strong>Shared Type Safety</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Types flow seamlessly between frontend and backend</span></li>
    <li>✅ <strong>Code Reusability</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Shared utilities, schemas, and contracts</span></li>
    <li>✅ <strong>Unified Tooling</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Single linting, formatting, and build configuration</span></li>
    <li>✅ <strong>Developer Experience</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Hot reload and type checking across the entire stack</span></li>
  </ul>
</div>

---

# ⚡ Backend: Hono + oRPC

Ultra-fast web framework with end-to-end type safety

```typescript {all|1-5|7-12|all}
// Contract Definition
const channelContract = oc
  .route({ tags: ["chat", "channel"] })
  .errors({ UNAUTHORIZED: {} });

const createChannel = channelContract
  .route({
    method: "POST",
    path: "/chat/channel",
    successStatus: 201,
  })
  .input(z.object({
    name: z.string().min(1),
    members: z.array(z.string()).min(1),
  }))
  .output(channelSchema);
```

---

# ⚡ oRPC Handler Implementation

```typescript {all|1-3|5-9|all}
// Handler Implementation
const createChannel = chatRouter.createChannel
  .use(authMiddleware)
  
  .handler(async ({ context, input, errors }) => {
    const [ch] = await db.insert(channel)
      .values({ ...input, ownerId: context.user.id })
      .returning();
    return ch;
  });
```

<div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
  <strong>Key Benefits:</strong> End-to-end type safety, auto-generated OpenAPI docs, runtime validation
</div>

---

# 📡 Real-time Message Streaming

Type-safe streaming with oRPC's built-in Server-Sent Events

```typescript {all|1-7|9-15|all}
// Stream Contract Definition
const streamChannelMessages = messageContract
  .route({
    method: "GET",
    path: "/chat/channel/{uuid}/message/stream",
  })
  .input(z.object({ uuid: z.uuid() }))
  .output(eventIterator(messageSchema));

// Handler with Generator Function
.handler(async function* ({ input, signal }) {
  for await (const payload of publisher.subscribe(input.uuid, {
    signal, // Abort signal for cleanup
  })) {
    yield payload; // Stream each message
  }
});
```

---

# 🔐 Authentication with Better-Auth

Modern, secure authentication with excellent TypeScript support

```typescript {all|2-4|5-11|all}
export const auth = betterAuth({
  database: drizzleAdapter(db, { 
    provider: "pg" 
  }),
  emailAndPassword: { 
    enabled: true 
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
```

---

# 🔐 Better-Auth Benefits

<div class="mt-6">
  <ul class="space-y-3 text-lg">
    <li>✅ <strong>Multiple Auth Methods</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Email/password, OAuth, magic links</span></li>
    <li>✅ <strong>Framework Agnostic</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Security-first approach with CSRF protection</span></li>
    <li>✅ <strong>Session Management</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Secure sessions and rate limiting</span></li>
    <li>✅ <strong>TypeScript Native</strong><br><span class="text-gray-600 dark:text-gray-400 text-base">Excellent developer experience</span></li>
  </ul>
</div>

---

# 🗄️ Database with Drizzle ORM

Best TypeScript experience for database operations

```typescript {all|1-7|9-13|all}
export const channel = pgTable("channel", {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull(),
  settings: json()
    .notNull()
    .default(channelSettingsSchema.parse({ ai: {} }))
    .$type<ChannelSettings>(),
  ownerId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp({ mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

---

# 🗄️ Drizzle Schema Generation

```typescript
// Auto-generate Zod schemas from tables
export const channelSchema = createSelectSchema(channel);
export type Channel = z.infer<typeof channelSchema>;

export const messageSchema = createSelectSchema(message);
export type Message = z.infer<typeof messageSchema>;

export const userSchema = createSelectSchema(user).pick({
  email: true,
  name: true,
  image: true,
  id: true,
});
```

<div class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
  <strong>Why Drizzle?</strong> Performance first, SQL-like API, full TypeScript inference, auto-generated schemas
</div>

---

# 🎨 Frontend: Modern React Stack

Cutting-edge React patterns and tools for 2024

<div class="flex justify-center mt-6">
  <div class="grid grid-cols-3 gap-3">
    <div class="tech-badge react">React 19</div>
    <div class="tech-badge router">TanStack Router</div>
    <div class="tech-badge query">TanStack Query</div>
    <div class="tech-badge tailwind">Tailwind CSS 4</div>
    <div class="tech-badge ui">Shadcn/ui</div>
    <div class="tech-badge vite">Vite</div>
  </div>
</div>

<style>
.tech-badge {
  @apply px-3 py-2 rounded-full text-white font-medium text-center text-sm;
}
.tech-badge.react { @apply bg-blue-500; }
.tech-badge.router { @apply bg-purple-500; }
.tech-badge.query { @apply bg-red-500; }
.tech-badge.tailwind { @apply bg-cyan-500; }
.tech-badge.ui { @apply bg-gray-700; }
.tech-badge.vite { @apply bg-yellow-500; }
</style>

---

# 🎨 React Stack Benefits

<div class="mt-4 space-y-3 text-lg">
  <p>🚀 <strong>React 19:</strong> Latest concurrent features and improved Suspense</p>
  <p>🛣️ <strong>TanStack Router:</strong> File-based, type-safe routing with nested layouts</p>
  <p>🔄 <strong>TanStack Query:</strong> Powerful data fetching and state synchronization</p>
  <p>🎨 <strong>Tailwind CSS 4:</strong> Utility-first styling with CSS variables</p>
  <p>🧩 <strong>Shadcn/ui:</strong> High-quality, accessible component library</p>
</div>

---

# 🛣️ Type-Safe Routing: Route Guards

TanStack Router with full TypeScript integration

```typescript {all|1-8|all}
// Route guards with authentication
export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.data) {
      throw redirect({ to: "/" });
    }
  },
  component: Outlet,
});
```

---

# 🛣️ Type-Safe Routing: Data Loading

```typescript {all|1-12|all}
// Route loaders with prefetching
export const Route = createFileRoute("/_protected/chat/$uuid/")({
  loader: async ({ context: { queryClient }, params }) => {
    await Promise.all([
      queryClient.ensureQueryData(
        orpc.chat.channel.getChannel.queryOptions({
          input: { uuid: params.uuid },
        })
      ),
    ]);
  },
  component: RouteComponent,
});
```

---

# 🔄 TanStack Query + oRPC

Automatic query options generation with type safety

```typescript {all|1-6|8-14|all}
// Auto-generated query options from oRPC contracts
const link = new OpenAPILink(contract, {
  url: `${window.location.origin}/api/rpc`,
  eventIteratorKeepAliveEnabled: true,
});

export const client = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);

// Suspense queries with type safety
const [{ data: channel }, { data: messages }] = useSuspenseQueries({
  queries: [
    orpc.chat.channel.getChannel.queryOptions({ input: { uuid } }),
    orpc.chat.message.getChannelMessages.queryOptions({ input: { uuid } }),
  ],
});
```

---

# 🔄 Query Integration Benefits

<div class="mt-6 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
  <ul class="space-y-2 text-sm">
    <li><strong>Route-based code splitting</strong> - Automatic lazy loading</li>
    <li><strong>Intelligent query caching</strong> - Background refetching</li>
    <li><strong>Optimistic updates</strong> - Instant UI feedback</li>
    <li><strong>Real-time streaming queries</strong> - Live data updates</li>
  </ul>
</div>

---

# 🤖 AI Integration Overview

Modern AI application framework with multi-model support

<div class="grid grid-cols-2 gap-4 mt-6">

<div class="feature-card">
  <h3>🔗 Provider Agnostic</h3>
  <p>OpenAI, Anthropic, Google, OpenRouter, and 50+ providers</p>
</div>

<div class="feature-card">
  <h3>🛠️ Tool Calling</h3>
  <p>Type-safe function calling with automatic schema generation</p>
</div>

<div class="feature-card">
  <h3>📡 Streaming Support</h3>
  <p>Real-time token streaming for responsive UIs</p>
</div>

<div class="feature-card">
  <h3>🔒 Type Safety</h3>
  <p>Full TypeScript integration with Zod validation</p>
</div>

</div>

<style>
.feature-card {
  @apply bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700;
}
.feature-card h3 {
  @apply text-base font-semibold mb-2;
}
.feature-card p {
  @apply text-sm text-gray-600 dark:text-gray-400;
}
</style>

---

# 🛠️ AI Tool System

Type-safe function calling with automatic schema generation

```typescript {all|1-5|6-12|13-19|all}
export const getCurrentWeather = tool({
  description: "Get current weather information for a city.",
  inputSchema: z.object({
    location: z.string().describe('City name (e.g., "London")'),
  }),
  execute: async ({ location }) => {
    const geo = await geocodeLocation(location);
    const response = await fetch(
      `${API_URL}/weather?lat=${geo.lat}&lon=${geo.lon}`
    );
    const data = await response.json();
    
    return {
      location: geo.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
    };
  },
});
```

---

# 🚀 Key Achievements

<div class="grid grid-cols-2 gap-4 mt-6">

<div class="achievement-card">
  <h3>🔒 End-to-End Type Safety</h3>
  <p>Zero type gaps from database to UI with compile-time error detection</p>
</div>

<div class="achievement-card">
  <h3>⚡ Developer Experience</h3>
  <p>Sub-second hot reload and intelligent IntelliSense</p>
</div>

<div class="achievement-card">
  <h3>🏗️ Modern Architecture</h3>
  <p>File-based routing, real-time streaming, AI-first development</p>
</div>

<div class="achievement-card">
  <h3>🌐 Production Ready</h3>
  <p>Robust auth, scalable monorepo, optimized performance</p>
</div>

</div>

<style>
.achievement-card {
  @apply bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700;
}
.achievement-card h3 {
  @apply text-base font-semibold mb-2 text-blue-900 dark:text-blue-100;
}
.achievement-card p {
  @apply text-sm text-blue-700 dark:text-blue-300;
}
</style>

---

# 🌟 The Multiplicative Effect

These technologies create synergy where each tool enhances the others

<div class="mt-6 space-y-3">
  <div class="connection-item">
    <strong>oRPC</strong> contracts → <strong>TanStack Query</strong> hooks automatically
  </div>
  
  <div class="connection-item">
    <strong>Drizzle</strong> schemas → <strong>Zod</strong> validators seamlessly
  </div>
  
  <div class="connection-item">
    <strong>Vercel AI SDK</strong> → type-safe <strong>API endpoints</strong>
  </div>
  
  <div class="connection-item">
    <strong>TanStack Router</strong> → <strong>compile-time route validation</strong>
  </div>
</div>

<style>
.connection-item {
  @apply p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500 shadow-sm text-sm;
}
</style>

---

# 🌟 Greater Than the Sum

<div class="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg text-center">
  <p class="text-lg italic text-gray-700 dark:text-gray-300">
    This isn't just about individual library quality—it's about how they work together to create something <strong>greater than the sum of their parts</strong>.
  </p>
</div>

<div class="mt-6 text-center">
  <p class="text-base text-gray-600 dark:text-gray-400">
    The TypeScript ecosystem advantage in action
  </p>
</div>

---
layout: center
class: text-center
---

# 🙏 Thank You

Questions & Discussion

<div class="flex justify-center mt-8 space-x-3">
  <div class="tech-badge modern">Modern TypeScript</div>
  <div class="tech-badge fullstack">Full-Stack</div>
  <div class="tech-badge ai">AI-Powered</div>
  <div class="tech-badge typesafe">Type-Safe</div>
</div>

<style>
.tech-badge {
  @apply px-4 py-2 rounded-full text-white font-medium text-sm;
}
.tech-badge.modern { @apply bg-blue-600; }
.tech-badge.fullstack { @apply bg-purple-600; }
.tech-badge.ai { @apply bg-pink-600; }
.tech-badge.typesafe { @apply bg-green-600; }
</style>
# 🚀 Modern TypeScript Full-Stack Chat Application

A showcase of the latest TypeScript ecosystem libraries and best practices for building type-safe full-stack applications.

## ✨ Features

This application demonstrates modern full-stack development with these key features:

- 🔐 **User Authentication** - Social login (Google) and email/password authentication
- 💬 **Channel Management** - Create, join, and manage chat channels with role-based permissions
- 📱 **Real-time Messaging** - Send and receive messages in real-time across channels
- 🤖 **AI Integration** - Smart AI assistant with tool calling capabilities and multiple model support

## 🏗️ Project Structure

This project uses a **monorepo architecture** with Bun workspaces, providing several key benefits:

```
hono-orpc/
├── apps/
│   ├── api/          # Hono backend server
│   └── web/          # React frontend application
├── packages/
│   ├── db/           # Drizzle ORM schema and database utilities
│   └── ai/           # AI tools and model integrations
└── playgrounds/
    └── ai/           # AI experimentation playground
```

### Why Monorepo?

- **Shared Type Safety**: Types flow seamlessly between frontend and backend
- **Code Reusability**: Shared utilities, schemas, and contracts across apps
- **Unified Tooling**: Single linting, formatting, and build configuration
- **Simplified Dependencies**: Manage versions centrally with workspace references
- **Developer Experience**: Hot reload and type checking across the entire stack

## 🎯 Backend Architecture

### Hono + oRPC: Type-Safe API Development

Our backend leverages **Hono** (ultra-fast web framework) with **oRPC** for end-to-end type safety and automatic OpenAPI documentation generation.

#### Contract Definition

```typescript
// apps/api/src/modules/chat/channel/channel.contract.ts
import { oc } from "@orpc/contract";
import { z } from "zod/v4";

const channelContract = oc
  .route({
    tags: ["chat", "channel"],
  })
  .errors({
    UNAUTHORIZED: {},
  });

const createChannel = channelContract
  .route({
    method: "POST",
    description: "Create a new channel",
    path: "/chat/channel",
    successStatus: 201,
  })
  .errors({
    INTERNAL_SERVER_ERROR: {},
  })
  .input(
    z.object({
      name: z.string().min(1).describe("The name of the channel"),
      members: z
        .array(z.string())
        .min(1)
        .describe("The members of the channel"),
    })
  )
  .output(channelSchema);
```

#### Handler Implementation

```typescript
// apps/api/src/modules/chat/channel/channel.router.ts
import { implement } from "@orpc/server";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const chatRouter = implement(channelContract).$context<{ headers: Headers }>();

const createChannel = chatRouter.createChannel
  .use(authMiddleware)
  .handler(async ({ context, input, errors }) => {
    const [ch] = await db
      .insert(channel)
      .values({
        ...input,
        ownerId: context.user.id,
      })
      .returning();

    if (!ch) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create channel",
      });
    }

    // Add members and owner to channel
    await db.insert(channelParticipant).values([
      {
        channelUuid: ch.uuid,
        userId: context.user.id,
        role: "owner",
      },
      ...input.members.map((userId) => ({
        channelUuid: ch.uuid,
        userId,
      })),
    ]);

    return ch;
  });
```

### Real-Time Message Streaming

oRPC provides built-in support for real-time data streaming using Server-Sent Events:

#### Stream Contract Definition

```typescript
// apps/api/src/modules/chat/message/message.contract.ts
const streamChannelMessages = messageContract
  .route({
    method: "GET",
    description: "Stream messages by channel",
    path: "/chat/channel/{uuid}/message/stream",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not a member of this channel",
    },
  })
  .input(z.object({ uuid: z.uuid().describe("The uuid of the channel") }))
  .output(eventIterator(
    messageSchema.extend({ 
      sender: userSchema.nullable() 
    })
  ));
```

#### Stream Handler Implementation

```typescript
// apps/api/src/modules/chat/message/message.router.ts
import { EventPublisher } from "@orpc/server";

const publisher = new EventPublisher<
  Record<string, Message & { sender: User | null }>
>();

const streamChannelMessages = messageRouter.streamChannelMessages
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(async function* ({ input, signal }) {
    // Generator function for streaming data
    for await (const payload of publisher.subscribe(input.uuid, {
      signal, // Abort signal for cleanup
    })) {
      yield payload; // Stream each message as it arrives
    }
  });

// Publishing messages to subscribers
const saveAndPublishMessage = async ({ channelUuid, content, sender }) => {
  const [msg] = await db
    .insert(message)
    .values({ channelUuid, content, senderId: sender.id })
    .returning();

  // Publish to all subscribers of this channel
  publisher.publish(channelUuid, {
    ...msg,
    sender,
  });

  return msg;
};
```

### Key Benefits of oRPC

- 🔒 **End-to-end Type Safety**: Contracts ensure type consistency between frontend and backend
- 📖 **Auto-generated OpenAPI**: Documentation generated from Zod schemas and route definitions
- 🛡️ **Runtime Validation**: Input/output validation with detailed error handling
- 🔧 **Middleware Support**: Composable middleware for authentication, authorization, and more
- 🌐 **Real-Time Streaming**: Built-in Server-Sent Events with type-safe event publishers

## 🔐 Authentication with Better-Auth

We use **Better-Auth** for modern, secure authentication with excellent TypeScript support.

```typescript
// apps/api/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
```

### Why Better-Auth?

- 🔑 **Multiple Auth Methods**: Email/password, OAuth providers, magic links
- 🏗️ **Framework Agnostic**: Works with any JavaScript framework
- 🛡️ **Security First**: CSRF protection, secure sessions, and rate limiting
- 🎨 **Customizable**: Extensible with plugins and custom providers
- 📚 **TypeScript Native**: Excellent type inference and developer experience

## 🗄️ Database with Drizzle ORM

**Drizzle ORM** provides the best TypeScript experience for database operations with a SQL-like API.

### Table Definition

```typescript
// packages/db/src/tables/chat.ts
import { pgTable, text, uuid, timestamp, json } from "drizzle-orm/pg-core";

export const channel = pgTable("channel", {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull(),
  settings: json()
    .notNull()
    .default(channelSettingsSchema.parse({ ai: {} }))
    .$type<ChannelSettings>(),
  ownerId: text()
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp({ mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const message = pgTable("message", {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  senderId: text()
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  content: text().notNull(),
  channelUuid: uuid()
    .notNull()
    .references(() => channel.uuid, {
      onDelete: "cascade",
    }),
  createdAt: timestamp({ mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

## Relation Definition
```ts
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { message, channel } from "./chat";

export const messageRelations = relations(message, ({ one }) => ({
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
  channel: one(channel, {
    fields: [message.channelUuid],
    references: [channel.uuid],
  }),
}));
```

### Automatic Zod Schema Generation

```typescript
// packages/db/src/schema/derived.ts
import { createSelectSchema } from "drizzle-zod";
import { channel, message, user } from "../tables";

// Automatically generate Zod schemas from Drizzle tables
export const channelSchema = createSelectSchema(channel).omit({
  settings: true,
});
export type Channel = z.infer<typeof channelSchema>;

export const messageSchema = createSelectSchema(message);
export type Message = z.infer<typeof messageSchema>;

export const userSchema = createSelectSchema(user).pick({
  email: true,
  name: true,
  image: true,
  id: true,
});
export type User = z.infer<typeof userSchema>;
```

### Why Drizzle ORM?

- 🏃 **Performance First**: Lightweight with zero runtime overhead
- 🔍 **SQL-like API**: Familiar syntax for SQL developers
- 🎯 **Type Safety**: Full TypeScript inference with IntelliSense
- 🔄 **Schema Generation**: Auto-generate Zod schemas from tables
- 🛠️ **Developer Tools**: Built-in migration system and database studio
- 📊 **Query Builder**: Powerful relational queries with joins and subqueries

## 🎨 Frontend Architecture

### Modern React Stack

The frontend showcases cutting-edge React patterns and tools for 2024:

- **React 19** - Latest React with concurrent features and improved Suspense
- **TanStack Router** - File-based, type-safe routing with nested layouts and loaders
- **TanStack Query** - Powerful data fetching, caching, and state synchronization
- **Tailwind CSS 4** - Utility-first styling with CSS variables and modern features
- **Shadcn/ui** - High-quality, accessible component library built on Radix
- **Vite** - Lightning-fast build tool with HMR and optimized bundling

### TanStack Router: Type-Safe File-Based Routing

Our routing system uses TanStack Router's file-based approach with full TypeScript integration:

#### Route Structure
```
routes/
├── __root.tsx                    # Root layout with outlets
├── _auth/                        # Auth route group
│   ├── route.tsx                 # Auth layout with redirect logic
│   ├── index.tsx                 # Login page
│   └── sign-up.tsx               # Sign up page
└── _protected/                   # Protected route group
    ├── route.tsx                 # Auth guard middleware
    ├── _bottom-navigation/       # Bottom navigation layout
    │   ├── route.tsx             # Bottom nav layout component
    │   ├── chat.tsx              # Chat channels list
    │   └── profile.tsx           # User profile page
    └── chat.$uuid/               # Dynamic chat routes
        ├── index.tsx             # Chat messages view
        └── details.tsx           # Channel details and settings
```

#### Route Guards with Authentication

TanStack Router's `beforeLoad` function provides powerful route protection capabilities:

```typescript
// apps/web/src/routes/_protected/route.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context: { auth } }) => {
    // Redirect to login if user is not authenticated
    if (!auth.data) {
      throw redirect({ to: "/" });
    }
  },
  component: Outlet,
});
```

#### Type-Safe Route Context

```typescript
// apps/web/src/routes/__root.tsx
type MyRouterContext = {
  queryClient: QueryClient;
  auth: ReturnType<typeof authClient.useSession>;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});
```

### TanStack Query Integration with oRPC

#### Automatic Query Options Generation

oRPC automatically generates TanStack Query-compatible options:

```typescript
// apps/web/src/lib/orpc-client.ts
import contract from "@hono-orpc/api/contract";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new OpenAPILink(contract, {
  url: `${window.location.origin}/api/rpc`,
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000,
});

export const client = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
```

#### Route Loaders with Prefetching

```typescript
// apps/web/src/routes/_protected/chat/$uuid/index.tsx
export const Route = createFileRoute("/_protected/chat/$uuid/")({
  loader: async ({ context: { queryClient }, params }) => {
    // Prefetch data during route transition
    await Promise.all([
      queryClient.ensureQueryData(
        orpc.chat.channel.getChannel.queryOptions({
          input: { uuid: params.uuid },
        })
      ),
      queryClient.ensureQueryData(
        orpc.chat.message.getChannelMessages.queryOptions({
          input: { uuid: params.uuid },
        })
      ),
    ]);
  },
  component: RouteComponent,
});
```

#### Suspense Queries for Instant Loading

```typescript
function RouteComponent() {
  const { uuid } = Route.useParams();

  // Multiple suspense queries with type safety
  const [{ data: channel }, { data: messages }] = useSuspenseQueries({
    queries: [
      orpc.chat.channel.getChannel.queryOptions({ input: { uuid } }),
      orpc.chat.message.getChannelMessages.queryOptions({
        input: { uuid },
      }),
    ],
  });

  return (
    <div>
      <h1>#{channel.name}</h1>
      {messages.map((message) => (
        <MessageBox key={message.uuid} message={message} />
      ))}
    </div>
  );
}
```

### Real-Time Streaming with TanStack Query

#### Experimental Streaming Support

```typescript
// Real-time message streaming
const {
  data: liveMessages,
  isError: isLiveMessagesError,
  fetchStatus: liveMessagesFetchStatus,
} = useQuery({
  queryKey: orpc.chat.message.streamChannelMessages.queryKey({
    input: { uuid },
  }),
  queryFn: experimental_streamedQuery({
    streamFn: ({ signal }) =>
      client.chat.message.streamChannelMessages({ uuid }, { signal }),
  }),
});
```

### Mutations with Query Invalidation

```typescript
// apps/web/src/components/new-channel.tsx
const queryClient = useQueryClient();

const { mutateAsync: createChannel, isPending } = useMutation(
  orpc.chat.channel.createChannel.mutationOptions({
    onSuccess: () => {
      // Invalidate channels list to refetch updated data
      queryClient.invalidateQueries({
        queryKey: orpc.chat.channel.getChannels.queryKey(),
      });
      form.reset();
      setOpen(false);
    },
  })
);

const handleSubmit = form.handleSubmit((data) => createChannel(data));
```

#### Complex Query Management

```typescript
// apps/web/src/routes/_protected/chat/$uuid/details.tsx
function cleanupQueries() {
  return Promise.all([
    // Remove specific channel queries from cache
    queryClient.removeQueries({
      queryKey: orpc.chat.channel.getChannel.queryKey({
        input: { uuid },
      }),
    }),
    queryClient.removeQueries({
      queryKey: orpc.chat.message.getChannelMessages.queryKey({
        input: { uuid },
      }),
    }),
    // Invalidate channels list to reflect changes
    queryClient.invalidateQueries({
      queryKey: orpc.chat.channel.getChannels.queryKey(),
    }),
  ]);
}

const { mutateAsync: leaveChannel } = useMutation(
  orpc.chat.channel.leaveChannel.mutationOptions({
    onSuccess: async () => {
      await cleanupQueries();
      navigate({ to: "/chat" });
    },
  })
);
```

### Advanced Query Configuration

```typescript
// apps/web/src/integrations/tanstack-query/root-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: (query) => {
        // Custom stale time based on query type
        const flatQueryKeys = query.queryKey.flat();
        if (
          flatQueryKeys.includes("streamChannelMessages") ||
          flatQueryKeys.includes("getChannelMessages")
        ) {
          return 0; // Always refetch messages
        }
        return 300_000; // 5 minutes for other data
      },
    },
  },
});
```

### Key Frontend Benefits

🚀 **Performance**
- Route-based code splitting with automatic lazy loading
- Intelligent query caching and background refetching
- Optimistic updates for instant UI feedback

🔒 **Type Safety**
- End-to-end type safety from API to UI components
- Compile-time route validation and parameter checking
- Automatic TypeScript inference for all API calls

📱 **User Experience**
- Instant navigation with prefetched data
- Real-time updates via streaming queries
- Optimistic UI updates for immediate feedback

🛠️ **Developer Experience**
- File-based routing with automatic code generation
- Built-in devtools for debugging queries and routes
- Hot module replacement with state preservation

### Development Tools Integration

The app includes comprehensive development tools:

```typescript
// Integrated devtools for development
{import.meta.env.DEV && (
  <TanStackDevtools
    config={{ position: "bottom-left" }}
    plugins={[
      {
        name: "Tanstack Router",
        render: <TanStackRouterDevtoolsPanel />,
      },
      TanStackQueryDevtools,
    ]}
  />
)}
```

This setup provides real-time inspection of:
- Route transitions and loader states
- Query cache and network requests
- Component tree and state changes

## 🤖 AI Integration

### Vercel AI SDK: Modern AI Application Framework

Our AI implementation leverages **Vercel's AI SDK**, the most comprehensive TypeScript-first framework for building AI applications. The SDK provides:

- 🔗 **Provider Agnostic** - Support for OpenAI, Anthropic, Google, OpenRouter, and 50+ providers
- 🛠️ **Tool Calling** - Type-safe function calling with automatic schema generation
- 📡 **Streaming Support** - Real-time token streaming for responsive UIs
- 🔒 **Type Safety** - Full TypeScript integration with Zod schema validation
- 🎯 **Framework Integration** - Built-in support for React, Vue, and Node.js

### Multi-Model AI Assistant

```typescript
// packages/ai/src/index.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, type ModelMessage, stepCountIs } from "ai";
import tools from "./tools";

const SYSTEM_PROMPT = `
You are ChatAI, a human-like participant in a group chat. 
Reply like a normal user: brief, helpful, and conversational.
Do not mention you are an AI unless asked.

Style and behavior:
- Match the chat's tone; keep replies under 5 sentences
- Address people by name when helpful
- Ask at most one focused clarifying question when needed
- Use emojis sparingly; avoid sounding like a support bot

Tool use:
- You may call tools when appropriate
- Always send a final normal text reply summarizing the result
`;

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function generateResponse({ messages, model }: GenerateResponseProps) {
  const modelMessages = messages.map(toModelMessage);
  
  const _model = model || "openai/gpt-oss-120b:free";
  const enableTools = [
    "openrouter/sonoma-dusk-alpha",
    "openrouter/sonoma-sky-alpha",
  ].includes(_model);

  return generateText({
    model: openRouter(_model),
    system: SYSTEM_PROMPT,
    stopWhen: stepCountIs(10),
    ...(enableTools && { tools }), // Conditionally enable tools
    messages: modelMessages,
  });
}
```

### AI Tool System with Type Safety

The AI SDK's tool system provides type-safe function calling with automatic schema generation from Zod schemas:

#### Weather API Tool Example

```typescript
// packages/ai/src/tools/weather.ts
import { tool } from "ai";
import { z } from "zod/v4";

export const getCurrentWeather = tool({
  description: "Get current weather information for a city.",
  inputSchema: z.object({
    location: z.string().describe('City name (e.g., "London", "New York, US")'),
  }),
  execute: async ({ location }) => {
    const geo = await geocodeLocation(location);
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${geo.lat}&lon=${geo.lon}&appid=${API_KEY}&units=metric`
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

### Real-Time AI Integration

#### Message-Triggered AI Responses

```typescript
// apps/api/src/modules/chat/message/message.router.ts
const sendMessageToChannel = messageRouter.sendMessageToChannel
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(async ({ context, input, errors }) => {
    // Save user message
    const msg = await saveAndPublishMessage({
      channelUuid: input.uuid,
      content: input.content,
      sender: context.user as User,
    });

    // Trigger AI response when mentioned
    if (input.content.includes("@ai")) {
      const ch = await db.query.channel.findFirst({
        where: eq(channel.uuid, input.uuid),
      });

      if (ch?.settings.ai.enabled) {
        const aiResponse = await generateAIResponse(
          input.uuid, 
          ch.settings.ai
        );

        await saveAndPublishMessage({
          channelUuid: input.uuid,
          content: aiResponse,
          sender: CHAT_AI_USER,
        });
      }
    }

    return msg;
  });
```

#### Context-Aware Response Generation

```typescript
// apps/api/src/lib/utils.ts
export const generateAIResponse = async (
  channelUuid: string,
  channelAISettings: ChannelSettings["ai"]
) => {
  // Fetch recent message history for context
  const lastMessages = await db.query.message.findMany({
    where: eq(message.channelUuid, channelUuid),
    orderBy: desc(message.createdAt),
    limit: channelAISettings.maxMessages, // Configurable context window
    with: { sender: true },
  });

  const response = await generateResponse({
    messages: lastMessages.reverse(),
    model: channelAISettings.model,
  });

  // Extract text content from multi-modal response
  const lastResponse = response.content.at(-1);
  if (lastResponse?.type !== "text") {
    throw new Error("Expected text response");
  }

  return lastResponse.text;
};
```

### Available AI Models

- **OpenRouter Sonoma Models** - Advanced reasoning with tool calling capabilities
- **GPT-OSS Models** - Free, fast inference for basic conversational tasks
- **Custom Model Support** - Easy integration of new providers via AI SDK

### Channel-Specific AI Configuration

```typescript
// packages/db/src/schema/custom.ts
export const channelSettingsSchema = z.object({
  ai: z.object({
    enabled: z.boolean().default(false),
    model: z.enum([
      "openrouter/sonoma-dusk-alpha",
      "openrouter/sonoma-sky-alpha", 
      "openai/gpt-oss-120b:free",
      "openai/gpt-oss-20b:free",
    ]).default("openrouter/sonoma-dusk-alpha"),
    maxMessages: z.number().default(10), // Context window size
  }),
});
```

### 🚀 What We've Achieved

**End-to-End Type Safety**
- Zero type gaps from database schema to UI components
- Compile-time error detection across the entire stack
- Automatic API contract generation and validation

**Developer Experience Excellence**
- Sub-second hot reload across frontend and backend
- Intelligent IntelliSense for all API calls and database queries
- Built-in debugging tools and comprehensive error messages

**Modern Architecture Patterns**
- File-based routing with automatic code splitting
- Real-time streaming with type-safe event handling
- AI-first development with tool calling capabilities

**Production Readiness**
- Robust authentication and authorization systems
- Scalable monorepo architecture for team development
- Performance optimized with intelligent caching strategies

### 🌟 The TypeScript Ecosystem Advantage

The combination of these technologies creates a **multiplicative effect** where each tool enhances the others:

- **oRPC** contracts become **TanStack Query** hooks automatically
- **Drizzle** schemas generate **Zod** validators seamlessly  
- **Vercel AI SDK** tools integrate with type-safe **API endpoints**
- **TanStack Router** provides **compile-time route validation**

This isn't just about individual library quality—it's about how they work together to create something greater than the sum of their parts.
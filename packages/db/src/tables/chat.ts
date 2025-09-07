import {
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { type ChannelSettings, channelSettingsSchema } from "../schema/custom";
import { user } from "./auth";

export const channel = pgTable("channel", {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull(),
  settings: json()
    .notNull()
    .default(channelSettingsSchema.parse({ ai: {} })) // use parse to ensure default values
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

export const channelRole = pgEnum("channel_role", ["owner", "member"]);

export const channelParticipant = pgTable("channel_participant", {
  userId: text()
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  channelUuid: uuid()
    .notNull()
    .references(() => channel.uuid, {
      onDelete: "cascade",
    }),
  role: channelRole().notNull().default("member"),
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

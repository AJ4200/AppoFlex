import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["client", "provider"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("client"),
  eulaAcceptedAt: timestamp("eula_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Only a SHA-256 hash of the emailed token is stored
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("password_reset_user_idx").on(t.userId)],
);

export const providers = pgTable("providers", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  description: text("description").notNull().default(""),
  timezone: text("timezone").notNull().default("UTC"),
  // Minimum gap kept free between two appointments
  bufferMinutes: integer("buffer_minutes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.userId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    durationMinutes: integer("duration_minutes").notNull(),
    priceCents: integer("price_cents").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("services_provider_idx").on(t.providerId)],
);

// Working hours, minutes from local midnight in the provider's timezone
export const availability = pgTable(
  "availability",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.userId, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
  },
  (t) => [uniqueIndex("availability_provider_weekday_idx").on(t.providerId, t.weekday)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.userId, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    notes: text("notes").notNull().default(""),
    // Minutes the provider reported this appointment is running over
    overrunMinutes: integer("overrun_minutes").notNull().default(0),
    // Derived: expected start delay, caused by earlier appointments running over
    delayMinutes: integer("delay_minutes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("appointments_provider_start_idx").on(t.providerId, t.startsAt),
    index("appointments_client_start_idx").on(t.clientId, t.startsAt),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_appointment_idx").on(t.appointmentId, t.createdAt)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export const usersRelations = relations(users, ({ one }) => ({
  provider: one(providers, { fields: [users.id], references: [providers.userId] }),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  user: one(users, { fields: [providers.userId], references: [users.id] }),
  services: many(services),
  availability: many(availability),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  provider: one(providers, { fields: [services.providerId], references: [providers.userId] }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  provider: one(providers, { fields: [appointments.providerId], references: [providers.userId] }),
  providerUser: one(users, { fields: [appointments.providerId], references: [users.id] }),
  client: one(users, { fields: [appointments.clientId], references: [users.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
  messages: many(messages),
}));

export type User = typeof users.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
export type Role = (typeof roleEnum.enumValues)[number];

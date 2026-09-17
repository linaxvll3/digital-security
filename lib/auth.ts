import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/prisma";

// Accounts that get the "admin" role on sign-up instead of the "student"
// default. Checked in the databaseHooks below, not left to client input.
const ADMIN_EMAILS = ["levexll764@gmail.com"];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        // Not settable through sign-up/update-user API input; only the
        // databaseHooks below (and the one-time migration backfill) set it.
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (ADMIN_EMAILS.includes(user.email)) {
            return { data: { ...user, role: "admin" } };
          }
          return { data: user };
        },
      },
    },
  },
  // Must stay last: lets Server Actions set session cookies directly.
  plugins: [nextCookies()],
});

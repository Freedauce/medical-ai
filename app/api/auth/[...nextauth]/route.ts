import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                // Find user by email
                const users = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, credentials.email));

                const user = users[0];

                if (!user || !user.password) {
                    throw new Error("Invalid email or password");
                }

                // Compare passwords
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            // For Google OAuth, auto-create user if doesn't exist
            if (account?.provider === "google" && user.email) {
                const existing = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, user.email));

                if (existing.length === 0) {
                    await db.insert(usersTable).values({
                        name: user.name || "User",
                        email: user.email,
                        clerkId: user.id,
                    });
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
});

export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ensureDatabase, findUserByEmail } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      else if (typeof token.sub === "string") token.userId = token.sub;
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials.password !== "string") return null;
        await ensureDatabase();
        const user = await findUserByEmail(credentials.email);
        if (!user || !(await bcrypt.compare(credentials.password, user.password_hash))) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const socialProviders =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders,
  experimental: {
    joins: true,
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
  plugins: [
    magicLink({
      disableSignUp: false,
      expiresIn: 10 * 60,
      sendMagicLink: async ({ email, url }) => {
        if (resend && process.env.MAGIC_LINK_FROM) {
          await resend.emails.send({
            from: process.env.MAGIC_LINK_FROM,
            to: email,
            subject: "Tu acceso a Vision AR",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h1>Ingresá a Vision AR</h1>
                <p>Hacé clic en el siguiente botón para entrar a tu cuenta.</p>
                <p>
                  <a
                    href="${url}"
                    style="background:#ef4444;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block;"
                  >
                    Entrar con magic link
                  </a>
                </p>
                <p>Si no solicitaste este acceso, podés ignorar este mensaje.</p>
              </div>
            `,
          });
          return;
        }

        console.info(
          `[Vision AR] Magic link para ${email}. Configurá RESEND_API_KEY para envío real: ${url}`,
        );
      },
    }),
    nextCookies(),
  ],
});

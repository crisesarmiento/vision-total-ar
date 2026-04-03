"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  image: z.string().url().optional().or(z.literal("")),
});

const preferencesSchema = z.object({
  theme: z.enum(["SYSTEM", "DARK", "LIGHT"]),
  notificationsEnabled: z.boolean(),
  tickerEnabled: z.boolean(),
  keyboardShortcutsEnabled: z.boolean(),
  reducedMotion: z.boolean(),
  defaultGridPreset: z.enum([
    "GRID_1",
    "GRID_2X1",
    "GRID_2X2",
    "GRID_3X3",
    "GRID_4X4",
    "CUSTOM",
  ]),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const session = await requireSession();
  const payload = profileSchema.parse(input);

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: payload.name,
      image: payload.image || null,
    },
  });

  revalidatePath("/perfil");
}

export async function updatePreferences(
  input: z.infer<typeof preferencesSchema>,
) {
  const session = await requireSession();
  const payload = preferencesSchema.parse(input);

  await prisma.userPreference.upsert({
    where: {
      userId: session.user.id,
    },
    update: payload,
    create: {
      userId: session.user.id,
      ...payload,
    },
  });

  revalidatePath("/");
  revalidatePath("/configuracion");
}

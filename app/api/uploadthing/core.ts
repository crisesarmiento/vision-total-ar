import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export async function requireUploadAuth({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    throw new UploadThingError("No autorizado");
  }

  return { userId: session.user.id };
}

export const uploadRouter = {
  avatarUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    .middleware(requireUploadAuth)
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
    })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

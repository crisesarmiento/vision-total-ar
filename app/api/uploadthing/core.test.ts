import { describe, expect, it, vi } from "vitest";
import { UploadThingError } from "uploadthing/server";
import { requireUploadAuth } from "./core";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";

describe("requireUploadAuth", () => {
  it("throws UploadThingError when no session exists", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    await expect(
      requireUploadAuth({ req: new Request("http://localhost/api/uploadthing") }),
    ).rejects.toThrow(UploadThingError);
  });

  it("throws UploadThingError when session has no user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(
      { session: { id: "s1" }, user: null } as never,
    );

    await expect(
      requireUploadAuth({ req: new Request("http://localhost/api/uploadthing") }),
    ).rejects.toThrow(UploadThingError);
  });

  it("returns userId when session is valid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      session: { id: "s1" },
      user: { id: "user-abc" },
    } as never);

    const result = await requireUploadAuth({
      req: new Request("http://localhost/api/uploadthing"),
    });

    expect(result).toEqual({ userId: "user-abc" });
  });
});

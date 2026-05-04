import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: vi.fn(),
}));

import { getSessionCookie } from "better-auth/cookies";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

describe("middleware route protection", () => {
  beforeEach(() => {
    vi.mocked(getSessionCookie).mockReturnValue(null);
  });

  describe("unauthenticated user", () => {
    it("redirects /perfil to /ingresar", () => {
      const request = new NextRequest("http://localhost/perfil");
      const response = middleware(request);
      expect(response.status).toBeGreaterThanOrEqual(300);
      expect(response.status).toBeLessThan(400);
      expect(response.headers.get("location")).toContain("/ingresar");
    });

    it("redirects /configuracion to /ingresar", () => {
      const request = new NextRequest("http://localhost/configuracion");
      const response = middleware(request);
      expect(response.headers.get("location")).toContain("/ingresar");
    });

    it("redirects /mis-combinaciones to /ingresar", () => {
      const request = new NextRequest("http://localhost/mis-combinaciones");
      const response = middleware(request);
      expect(response.headers.get("location")).toContain("/ingresar");
    });

    it("redirects /perfil/editar (nested path) to /ingresar", () => {
      const request = new NextRequest("http://localhost/perfil/editar");
      const response = middleware(request);
      expect(response.headers.get("location")).toContain("/ingresar");
    });

    it("passes through unprotected routes without redirect", () => {
      const request = new NextRequest("http://localhost/about");
      const response = middleware(request);
      expect(response.headers.get("location")).toBeNull();
    });
  });

  describe("authenticated user", () => {
    beforeEach(() => {
      vi.mocked(getSessionCookie).mockReturnValue("session-token-abc" as never);
    });

    it("redirects /ingresar to /", () => {
      const request = new NextRequest("http://localhost/ingresar");
      const response = middleware(request);
      expect(response.status).toBeGreaterThanOrEqual(300);
      const location = response.headers.get("location") ?? "";
      expect(location).toMatch(/^http:\/\/localhost\/?$/);
    });

    it("redirects /registrarse to /", () => {
      const request = new NextRequest("http://localhost/registrarse");
      const response = middleware(request);
      const location = response.headers.get("location") ?? "";
      expect(location).toMatch(/^http:\/\/localhost\/?$/);
    });

    it("passes through protected routes when authenticated", () => {
      const request = new NextRequest("http://localhost/perfil");
      const response = middleware(request);
      expect(response.headers.get("location")).toBeNull();
    });
  });
});

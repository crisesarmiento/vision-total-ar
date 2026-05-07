import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import {
  checkRateLimit,
  checkRequestRateLimit,
  normalizeRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";

const authGetRateLimit = {
  id: "auth-get",
  limit: 120,
  windowMs: 60_000,
};

const authPostRateLimit = {
  id: "auth-post",
  limit: 30,
  windowMs: 60_000,
};

const authEmailRateLimit = {
  id: "auth-email",
  limit: 10,
  windowMs: 10 * 60_000,
};

const authMagicLinkEmailRateLimit = {
  id: "auth-magic-link-email",
  limit: 5,
  windowMs: 10 * 60_000,
};

type AuthRequestBody = {
  email?: unknown;
};

const authHandlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  const rateLimit = checkRequestRateLimit(request, authGetRateLimit);

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  return authHandlers.GET(request);
}

export async function POST(request: Request) {
  const requestRateLimit = checkRequestRateLimit(request, authPostRateLimit);

  if (!requestRateLimit.allowed) {
    return rateLimitResponse(requestRateLimit);
  }

  const email = await getAuthEmail(request);

  if (email) {
    const emailKey = normalizeRateLimitKey(email);
    const emailRateLimit = checkRateLimit(authEmailRateLimit, emailKey);

    if (!emailRateLimit.allowed) {
      return rateLimitResponse(emailRateLimit);
    }

    if (isMagicLinkRequest(request)) {
      const magicLinkRateLimit = checkRateLimit(authMagicLinkEmailRateLimit, emailKey);

      if (!magicLinkRateLimit.allowed) {
        return rateLimitResponse(magicLinkRateLimit);
      }
    }
  }

  return authHandlers.POST(request);
}

async function getAuthEmail(request: Request) {
  try {
    const body = (await request.clone().json()) as AuthRequestBody;
    return typeof body.email === "string" ? body.email : null;
  } catch {
    return null;
  }
}

function isMagicLinkRequest(request: Request) {
  return new URL(request.url).pathname.includes("magic-link");
}

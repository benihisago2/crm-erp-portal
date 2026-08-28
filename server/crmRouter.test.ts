import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "crm-test-user",
    email: "crm@example.com",
    name: "CRM Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("crm router", () => {
  it("exposes a protected snapshot query that is safe when the database is unavailable", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.crm.snapshot()).resolves.toMatchObject({ companies: [], contacts: [], deals: [], documents: [], tasks: [], activities: [], notifications: [] });
  });

  it("rejects malformed deal payloads before any database call", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.crm.deals.create({
      title: "",
      stage: "lead",
      amount: -1,
      probability: 101,
      ownerName: "",
    })).rejects.toThrow();
  });
});

import { describe, expect, it } from "vitest";

import { services, websiteTiers } from "@/config/pricing";

describe("pricing config", () => {
  it("computes package totals as service fee plus government fee", () => {
    const service = services.find((entry) => entry.slug === "limited-company");
    expect(service).toBeDefined();
    if (!service) return;
    for (const pack of service.packages) {
      expect(pack.price + service.governmentFee).toBe(pack.price + 20000);
    }
  });

  it("keeps government fee flags consistent", () => {
    for (const service of services) {
      expect(service.governmentFee).toBeGreaterThanOrEqual(0);
      if (service.governmentFeeWaived) {
        expect(service.governmentFee).toBeGreaterThanOrEqual(0);
      }
      expect(typeof service.governmentFeeFrom).toBe("boolean");
    }
  });

  it("includes website starter and online store starting prices", () => {
    const starter = websiteTiers.find((tier) => tier.slug === "starter-site");
    const store = websiteTiers.find((tier) => tier.slug === "online-store");
    expect(starter?.from).toBe(70000);
    expect(store?.from).toBe(250000);
  });
});

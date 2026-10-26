import { describe, expect, it } from "vitest";
import { getField, mapRegistrant, type RegfoxRegistrant } from "../regfox-mapper";
import payload from "./fixtures/regfox-2027HMSHWNXSCFOY0007.json";

const registrant = payload as unknown as RegfoxRegistrant;

describe("mapRegistrant — real Home Show registration 2027HMSHWNXSCFOY0007", () => {
  const mapped = mapRegistrant(registrant);

  it("maps the company and contact fields by key", () => {
    expect(mapped.mapped_company_name).toBe("CNY Open House");
    expect(mapped.mapped_contact_name).toBe("Katie Reilly");
    expect(mapped.mapped_contact_email).toBe("kreilly@newyorksash.com");
    expect(mapped.mapped_contact_phone).toBe("+13156010923");
  });

  it("stores NULL for an empty website", () => {
    expect(mapped.mapped_website_url).toBeNull();
  });

  it("maps the chosen registration option label as the ticket type", () => {
    expect(mapped.mapped_ticket_type).toBe("10 x 10");
  });

  it("maps booth choices in #1, #2, #3 order", () => {
    expect(mapped.mapped_booth_choices).toEqual(["3", "4", "5"]);
  });

  it("maps sponsor flag, sponsor amount, and order total", () => {
    expect(mapped.mapped_is_sponsor).toBe(true);
    expect(mapped.mapped_sponsor_amount).toBe(1000);
    expect(mapped.order_total).toBe(1795);
  });

  it("maps address, returning vendor, product description, and lookup id", () => {
    expect(mapped.mapped_address).toBe("8 Burrstone Rd, New York Mills, NY, 13417");
    expect(mapped.mapped_returning_vendor).toBe(true);
    expect(mapped.mapped_product_description).toBe("Windows, doors, and siding.");
    expect(mapped.regfox_lookup_id).toBe(String(payload.lookupId));
  });
});

describe("mapRegistrant — defensive behaviour", () => {
  it("returns all NULLs for a missing or empty registrant", () => {
    for (const input of [undefined, null, {}, { data: [] }, { data: "nope" as unknown as [] }]) {
      const mapped = mapRegistrant(input as RegfoxRegistrant);
      for (const value of Object.values(mapped)) expect(value).toBeNull();
    }
  });

  it("does not throw on partial compound fields", () => {
    const mapped = mapRegistrant({
      data: [
        { key: "name", type: "name", first: { value: "Solo" } },
        { key: "address", type: "address", city: { value: "Utica" } },
        { key: "sponsorAmount", type: "donationBox", repeater: [] },
        { key: "doYouNeedAdditional", type: "multipleChoice", options: [{ label: "No", value: true }] },
        { key: "choice1", type: "textField", value: "12" },
      ],
    });
    expect(mapped.mapped_contact_name).toBe("Solo");
    expect(mapped.mapped_address).toBe("Utica");
    expect(mapped.mapped_sponsor_amount).toBeNull();
    expect(mapped.mapped_is_sponsor).toBe(false);
    expect(mapped.mapped_booth_choices).toEqual(["12"]);
  });

  it("getField matches on key, never on label", () => {
    expect(getField(registrant.data, "contactName")?.label).toBe("Company Name");
    expect(getField(registrant.data, "Company Name")).toBeUndefined();
  });
});

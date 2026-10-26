import { describe, expect, it } from "vitest";
import { getField, mapRegistrant, type RegfoxRegistrant } from "../regfox-mapper";
import payload0007 from "./fixtures/regfox-2027HMSHWNXSCFOY0007.json";
import payload0008 from "./fixtures/regfox-2027HMSHWNXSCFOY0008.json";

const registrant0007 = payload0007 as unknown as RegfoxRegistrant;
const registrant0008 = payload0008 as unknown as RegfoxRegistrant;

describe("mapRegistrant — order 2027HMSHWNXSCFOY0008 (non-sponsor, needs electricity)", () => {
  const mapped = mapRegistrant(registrant0008);

  it("maps the company and contact fields by key", () => {
    expect(mapped.mapped_company_name).toBe("SJTV dba CNY Open House");
    expect(mapped.mapped_contact_name).toBe("Katie Reilly");
    expect(mapped.mapped_contact_email).toBe("hello@cnyopenhouse.com");
    expect(mapped.mapped_contact_phone).toBe("+13156247682");
    expect(mapped.mapped_website_url).toBe("https://www.cnyopenhouse.com/");
  });

  it("maps ticket type and booth choices", () => {
    expect(mapped.mapped_ticket_type).toBe("10 x 10");
    expect(mapped.mapped_booth_choices).toEqual(["1", "2", "3"]);
  });

  it("maps sponsor as false with no amount", () => {
    expect(mapped.mapped_is_sponsor).toBe(false);
    expect(mapped.mapped_sponsor_amount).toBeNull();
  });

  it("maps returning vendor, order total, and lookup id", () => {
    expect(mapped.mapped_returning_vendor).toBe(true);
    expect(mapped.order_total).toBe(795);
    expect(mapped.regfox_lookup_id).toBe("94973193");
  });

  it("maps electricity, outlet counts, and empty notes as NULL", () => {
    expect(mapped.mapped_needs_electricity).toBe(true);
    expect(mapped.mapped_outlets_110).toBe(2);
    expect(mapped.mapped_outlets_220).toBeNull();
    expect(mapped.mapped_notes).toBeNull();
  });

  it("maps the address", () => {
    expect(mapped.mapped_address).toBe("8 Burrstone Rd, New York Mills, NY, 13417");
  });
});

describe("mapRegistrant — order 2027HMSHWNXSCFOY0007 (sponsor, no website)", () => {
  const mapped = mapRegistrant(registrant0007);

  it("maps sponsor flag and amount", () => {
    expect(mapped.mapped_is_sponsor).toBe(true);
    expect(mapped.mapped_sponsor_amount).toBe(1000);
  });

  it("stores NULL for an empty website", () => {
    expect(mapped.mapped_website_url).toBeNull();
  });

  it("maps booth choices and order total", () => {
    expect(mapped.mapped_booth_choices).toEqual(["3", "4", "5"]);
    expect(mapped.order_total).toBe(1795);
  });

  it("maps the rest of the contact fields", () => {
    expect(mapped.mapped_company_name).toBe("CNY Open House");
    expect(mapped.mapped_contact_name).toBe("Katie Reilly");
    expect(mapped.mapped_contact_email).toBe("kreilly@newyorksash.com");
    expect(mapped.mapped_contact_phone).toBe("+13156010923");
    expect(mapped.mapped_ticket_type).toBe("10 x 10");
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
        { key: "doYouNeedAdditional", type: "multipleChoice", value: "yes" },
        { key: "howMany110vOutlets", type: "number", value: "3" },
        { key: "choice1", type: "textField", value: "12" },
      ],
    });
    expect(mapped.mapped_contact_name).toBe("Solo");
    expect(mapped.mapped_address).toBe("Utica");
    expect(mapped.mapped_sponsor_amount).toBeNull();
    expect(mapped.mapped_is_sponsor).toBe(true);
    expect(mapped.mapped_outlets_110).toBe(3);
    expect(mapped.mapped_booth_choices).toEqual(["12"]);
  });

  it("getField matches on key, never on label", () => {
    expect(getField(registrant0008.data, "contactName")?.label).toBe("Company Name");
    expect(getField(registrant0008.data, "Company Name")).toBeUndefined();
  });
});

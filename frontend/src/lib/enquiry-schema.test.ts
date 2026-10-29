import { describe, expect, it } from "vitest";
import { EnquirySchema, enquiryFieldErrors, readEnquiryForm } from "./enquiry-schema";

const valid = {
  registration: "AB12 CDE",
  mileage: "45000",
  name: "Priya Shah",
  email: "priya@example.com",
  phone: "07700 900123",
  message: "",
  website: "",
};

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.append(key, value));
  return data;
}

describe("EnquirySchema", () => {
  it("accepts a valid enquiry", () => {
    const result = EnquirySchema.safeParse(valid);

    expect(result.success).toBe(true);
    expect(result.data?.mileage).toBe(45000);
  });

  it("normalises registration to uppercase without spaces", () => {
    expect(EnquirySchema.parse({ ...valid, registration: " ab12 cde " }).registration).toBe("AB12CDE");
  });

  it("accepts older and private plate formats", () => {
    for (const registration of ["A123 BCD", "ABC 123D", "1 ABC", "K1"]) {
      expect(EnquirySchema.safeParse({ ...valid, registration }).success).toBe(true);
    }
  });

  it("accepts mileage with commas and UK phone formats", () => {
    const data = EnquirySchema.parse({ ...valid, mileage: "45,000", phone: "+44 7700 900123" });

    expect(data.mileage).toBe(45000);
    expect(data.phone).toBe("+447700900123");
  });

  it("drops an empty optional message", () => {
    expect(EnquirySchema.parse(valid).message).toBeUndefined();
  });

  it("rejects missing name, invalid email and non numeric mileage with field messages", () => {
    const result = EnquirySchema.safeParse({ ...valid, name: "", email: "not-an-email", mileage: "lots" });

    expect(result.success).toBe(false);
    expect(enquiryFieldErrors(result.error!)).toEqual({
      name: "Enter your name.",
      email: "Enter a valid email address.",
      mileage: "Enter your mileage as a number.",
    });
  });

  it("rejects implausible registrations, phones and mileage", () => {
    const result = EnquirySchema.safeParse({ ...valid, registration: "HELLO!", phone: "12345", mileage: "900000" });

    expect(Object.keys(enquiryFieldErrors(result.error!))).toEqual(["registration", "mileage", "phone"]);
  });
});

describe("readEnquiryForm", () => {
  it("reads every field as a string, defaulting missing ones to empty", () => {
    expect(readEnquiryForm(form({ name: "Priya", registration: "AB12CDE" }))).toEqual({
      registration: "AB12CDE",
      mileage: "",
      name: "Priya",
      email: "",
      phone: "",
      message: "",
      website: "",
    });
  });
});

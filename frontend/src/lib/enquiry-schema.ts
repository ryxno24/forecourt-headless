import { z } from "zod";

const UK_REGISTRATION = /^(?=.*[A-Z])(?=.*\d)[A-Z\d]{2,7}$/;
const UK_PHONE = /^(?:\+44|0)\d{9,10}$/;
const MAX_MILEAGE = 500_000;

export const EnquirySchema = z.object({
  registration: z
    .string()
    .transform((value) => value.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().regex(UK_REGISTRATION, "Enter a valid UK registration.")),
  mileage: z
    .string()
    .transform((value) => value.replace(/[,\s]/g, ""))
    .pipe(z.string().regex(/^\d+$/, "Enter your mileage as a number."))
    .transform(Number)
    .pipe(z.number().max(MAX_MILEAGE, "Enter a mileage under 500,000.")),
  name: z.string().trim().min(2, "Enter your name.").max(100, "Enter your name."),
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  phone: z
    .string()
    .transform((value) => value.replace(/[^\d+]/g, ""))
    .pipe(z.string().regex(UK_PHONE, "Enter a valid UK phone number.")),
  message: z
    .string()
    .trim()
    .max(1000, "Keep your message under 1,000 characters.")
    .optional()
    .transform((value) => value || undefined),
  website: z.string().optional(),
});

export type EnquiryInput = z.output<typeof EnquirySchema>;
export type EnquiryField = Exclude<keyof EnquiryInput, "website">;
type FormField = keyof EnquiryInput;

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<EnquiryField, string>>;
  values?: Partial<Record<EnquiryField, string>>;
};

export const initialEnquiryState: EnquiryState = { status: "idle" };

const FIELDS: FormField[] = ["registration", "mileage", "name", "email", "phone", "message", "website"];

export function readEnquiryForm(formData: FormData): Record<FormField, string> {
  return Object.fromEntries(
    FIELDS.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as Record<FormField, string>;
}

export function enquiryFieldErrors(error: z.ZodError): Partial<Record<EnquiryField, string>> {
  const { fieldErrors } = z.flattenError(error) as { fieldErrors: Partial<Record<EnquiryField, string[]>> };

  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([field, messages]) => (messages?.[0] ? [[field, messages[0]]] : [])),
  );
}

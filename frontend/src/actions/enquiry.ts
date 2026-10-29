"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";
import {
  EnquirySchema,
  enquiryFieldErrors,
  readEnquiryForm,
  type EnquiryField,
  type EnquiryState,
} from "@/lib/enquiry-schema";
import { getSettings } from "@/lib/wordpress";

const TIMEOUT_MS = 8000;

async function clientIp(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwarded || list.get("x-real-ip") || "";
}

async function withPhone(message: string): Promise<string> {
  try {
    const { phone } = await getSettings();
    return phone ? `${message} or call us on ${phone}.` : `${message}.`;
  } catch {
    return `${message}.`;
  }
}

async function readErrors(response: Response): Promise<EnquiryState["fieldErrors"] | null> {
  try {
    const body = (await response.json()) as { errors?: unknown };
    return body.errors && typeof body.errors === "object" ? (body.errors as EnquiryState["fieldErrors"]) : null;
  } catch {
    return null;
  }
}

export async function submitEnquiry(previous: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const state = await handleEnquiry(previous, formData);

  if (formData.get("enhanced") !== "1") {
    redirect(state.status === "success" ? "/enquiry/sent" : "/enquiry/failed");
  }

  return state;
}

async function handleEnquiry(_previous: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const { website, ...raw } = readEnquiryForm(formData);
  const values: Partial<Record<EnquiryField, string>> = raw;
  const parsed = EnquirySchema.safeParse({ ...raw, website });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: enquiryFieldErrors(parsed.error),
      values,
    };
  }

  const env = getEnv();

  if (env.CONTENT_SOURCE === "fixtures") {
    return { status: "success" };
  }

  let response: Response;

  try {
    response = await fetch(`${env.WORDPRESS_URL}/wp-json/forecourt/v1/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forecourt-Secret": env.SHARED_SECRET,
        "X-Forecourt-Client-IP": await clientIp(),
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[enquiry] could not reach WordPress", error);
    return { status: "error", message: await withPhone("Sorry, something went wrong. Please try again"), values };
  }

  if (response.status === 201) {
    return { status: "success" };
  }

  if (response.status === 422) {
    const fieldErrors = await readErrors(response);

    if (fieldErrors) {
      return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
    }
  }

  if (response.status === 429) {
    return {
      status: "error",
      message: await withPhone("We've had a few requests from you in a short time. Please try again in a few minutes"),
      values,
    };
  }

  console.error(`[enquiry] WordPress returned ${response.status}`);

  return { status: "error", message: await withPhone("Sorry, something went wrong. Please try again"), values };
}

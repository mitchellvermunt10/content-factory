import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createOutreach,
  updateOutreachStatus,
} from "@/lib/supabase/outreachRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { sendEmail, isResendEnabled } from "@/lib/email/resend";

export const runtime = "nodejs";

// Twee modi:
// 1. Bestaande outreach: stuur email via Resend + status='sent'
// 2. Nieuwe prospect: maak outreach-record + stuur direct email
const Body = z.object({
  // Optie 1
  outreachId: z.string().uuid().optional(),

  // Optie 2 — voor brand-new outreach
  ownerEmail: z.string().email().optional(),
  prospectName: z.string().max(200).optional(),
  prospectEmail: z.string().email().optional(),
  prospectCity: z.string().max(120).nullable().optional(),
  prospectVertical: z.string().max(40).nullable().optional(),
  prospectWebsite: z.string().max(500).nullable().optional(),
  prospectInstagram: z.string().max(120).nullable().optional(),
  campaignId: z.string().max(40).nullable().optional(),

  // Email-content (altijd vereist)
  subject: z.string().min(2).max(280),
  body: z.string().min(20).max(5000),

  replyTo: z.string().email().optional(),
  fromOverride: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!isResendEnabled()) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY ontbreekt. Maak account op resend.com en zet 'm in Vercel env vars.",
      },
      { status: 503 }
    );
  }
  try {
    const body = Body.parse(await req.json());

    // Optie 1: bestaande outreach
    if (body.outreachId) {
      // Voor v1: we vragen om prospectEmail in body, want we hebben geen
      // getOutreach met expand. Vereenvoudig dat later.
      if (!body.prospectEmail) {
        return NextResponse.json(
          { error: "prospectEmail vereist bij outreachId" },
          { status: 400 }
        );
      }
      const result = await sendEmail({
        to: body.prospectEmail,
        subject: body.subject,
        body: body.body,
        replyTo: body.replyTo,
        from: body.fromOverride,
      });
      // Bump status naar 'sent'
      if (isSupabaseEnabled()) {
        await updateOutreachStatus(body.outreachId, "sent");
      }
      return NextResponse.json({ ok: true, email: result });
    }

    // Optie 2: nieuw — maak outreach record + verstuur
    if (!body.ownerEmail || !body.prospectName || !body.prospectEmail) {
      return NextResponse.json(
        {
          error:
            "ownerEmail, prospectName en prospectEmail vereist voor nieuwe outreach",
        },
        { status: 400 }
      );
    }

    // Maak outreach-record met status='sent' direct
    const outreach = isSupabaseEnabled()
      ? await createOutreach({
          ownerEmail: body.ownerEmail,
          prospectName: body.prospectName,
          prospectEmail: body.prospectEmail,
          prospectCity: body.prospectCity ?? null,
          prospectVertical: body.prospectVertical ?? null,
          prospectWebsite: body.prospectWebsite ?? null,
          prospectInstagram: body.prospectInstagram ?? null,
          campaignId: body.campaignId ?? null,
          emailSubject: body.subject,
          emailBody: body.body,
          status: "sent",
        })
      : null;

    // Bumped sent_at via createOutreach? Nee — initial status='sent' triggert geen
    // timestamp-update. Apart zetten.
    if (isSupabaseEnabled() && outreach) {
      await updateOutreachStatus(outreach.id, "sent");
    }

    // Verstuur via Resend
    const result = await sendEmail({
      to: body.prospectEmail,
      subject: body.subject,
      body: body.body,
      replyTo: body.replyTo,
      from: body.fromOverride,
    });

    return NextResponse.json({ ok: true, email: result, outreach });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verzenden faalde" },
      { status: 400 }
    );
  }
}

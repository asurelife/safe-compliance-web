import { Resend } from "resend";

export default async function handler(req, res) {
  // CORS (safe for static site + Vercel function)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const {
      estateName,
      contactName,
      contactTel,
      contactEmail,
      discipline,
      notes,
    } = req.body || {};

    // Basic validation
    if (!estateName || !contactName || !contactEmail || !discipline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ message: "Server missing RESEND_API_KEY" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = `Safe Compliance Audit Request — ${estateName}`;
    const text = [
      "NEW AUDIT REQUEST",
      "",
      `ESTATE: ${estateName}`,
      `DISCIPLINE: ${discipline}`,
      "",
      `CONTACT NAME: ${contactName}`,
      `CONTACT EMAIL: ${contactEmail}`,
      `CONTACT TEL: ${contactTel || "(not provided)"}`,
      "",
      "NOTES:",
      notes?.trim() ? notes.trim() : "(none)",
      "",
      "---",
      "Submitted via SafeCompliance.com",
    ].join("\n");

    // IMPORTANT:
    // - If you haven't verified your domain in Resend, use onboarding@resend.dev as FROM
    // - Once you verify safecompliance.com, switch FROM to e.g. audits@safecompliance.com
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "hello@safecompliance.com",
      replyTo: contactEmail,
      subject,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ message: "Email provider error" });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


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
  "----",
  "Submitted via SafeCompliance.com",
].join("\n");
"Submitted via SafeCompliance.com",
`;

    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      reply_to: contactEmail,
      subject,
      text,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Email send failed" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}


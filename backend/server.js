import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import xlsx from "xlsx";
import fs from "node:fs";
import path from "node:path";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const DATA_FILE = path.join(process.cwd(), "leads.json");

let leads = [];

if (fs.existsSync(DATA_FILE)) {
  try {
    leads = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.error("Could not load leads.json:", error.message);
    leads = [];
  }
}

function saveLeads() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getEmailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendAdminLeadEmail(lead) {
  const transporter = getEmailTransporter();

  if (!transporter) {
    console.log("Admin email not sent: EMAIL_USER or EMAIL_PASS missing.");
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER;

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.5;">
    <h2 style="color:#0a2e5c;">New Lead - Lutz Life Insurance</h2>
    <table style="border-collapse:collapse;width:100%;max-width:720px;">
      <tr>
        <th style="border:1px solid #ddd;padding:10px;background:#0a2e5c;color:white;text-align:left;">Field</th>
        <th style="border:1px solid #ddd;padding:10px;background:#0a2e5c;color:white;text-align:left;">Value</th>
      </tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Name</td><td style="border:1px solid #ddd;padding:10px;">${lead.fullName}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Email</td><td style="border:1px solid #ddd;padding:10px;">${lead.email}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Phone</td><td style="border:1px solid #ddd;padding:10px;">${lead.phone}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Date of Birth</td><td style="border:1px solid #ddd;padding:10px;">${lead.dateOfBirth}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">State</td><td style="border:1px solid #ddd;padding:10px;">${lead.state}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Coverage</td><td style="border:1px solid #ddd;padding:10px;">${lead.coverageAmount}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Tobacco</td><td style="border:1px solid #ddd;padding:10px;">${lead.tobaccoUse}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Best Time</td><td style="border:1px solid #ddd;padding:10px;">${lead.bestTimeToCall}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Source</td><td style="border:1px solid #ddd;padding:10px;">${lead.source}</td></tr>
      <tr><td style="border:1px solid #ddd;padding:10px;">Submitted</td><td style="border:1px solid #ddd;padding:10px;">${new Date(lead.createdAt).toLocaleString()}</td></tr>
    </table>
    <p>
      <a href="tel:${lead.phone}">Call Lead</a> | 
      <a href="mailto:${lead.email}">Email Lead</a>
    </p>
  </body>
</html>
`;

  await transporter.sendMail({
    from: `"Lutz Life Insurance" <${fromEmail}>`,
    to: adminEmail,
    subject: `NEW LEAD - ${lead.fullName}`,
    html
  });
}

async function sendAutoReplyEmail(lead) {
  const transporter = getEmailTransporter();

  if (!transporter) {
    console.log("Auto-reply not sent: EMAIL_USER or EMAIL_PASS missing.");
    return;
  }

  const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER;

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;background:#f8fafc;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#081f3f;color:white;padding:22px;text-align:center;">
        <h1 style="margin:0;">Lutz Life Insurance</h1>
      </div>
      <div style="padding:26px;">
        <p>Hi ${lead.firstName || "there"},</p>
        <p>I saw your request come through and wanted to make sure I had the right contact info.</p>
        <p>Would you like me to send over a few options, or would you rather I close this out?</p>
        <p>- Colby</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="font-size:14px;color:#6b7280;">
          Colby Lutz<br>
          Lutz Life Insurance<br>
          Phone: <a href="tel:3609913360">360-991-3360</a><br>
          If you no longer want messages from me, reply STOP or request to opt out.
        </p>
      </div>
    </div>
  </body>
</html>
`;

  await transporter.sendMail({
    from: `"Colby - Lutz Life Insurance" <${fromEmail}>`,
    to: lead.email,
    subject: `Hi ${lead.firstName || "there"}, quick question`,
    html
  });
}

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/submit-lead", async (req, res) => {
  try {
    const firstName = cleanText(req.body.firstName);
    const lastName = cleanText(req.body.lastName);
    const email = cleanEmail(req.body.email);
    const phone = cleanText(req.body.phone);
    const dateOfBirth = cleanText(req.body.dateOfBirth);
    const state = cleanText(req.body.state);
    const coverageAmount = cleanText(req.body.coverageAmount);
    const tobaccoUse = cleanText(req.body.tobaccoUse);
    const bestTimeToCall = cleanText(req.body.bestTimeToCall);
    const source = cleanText(req.body.source) || "Website";
    const consentGiven = Boolean(req.body.consentGiven);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !state ||
      !coverageAmount ||
      !tobaccoUse ||
      !bestTimeToCall
    ) {
      return res.status(400).json({
        success: false,
        error: "Please fill out every box before submitting."
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address."
      });
    }

    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        error: "Please check the consent box before submitting."
      });
    }

    const now = new Date().toISOString();

    const newLead = {
      id: Date.now(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      dateOfBirth,
      state,
      coverageAmount,
      tobaccoUse,
      bestTimeToCall,
      consentGiven,
      source,
      status: "New",
      notes: "",
      followUpDate: "",
      createdAt: now,
      updatedAt: now
    };

    leads.unshift(newLead);
    saveLeads();

    try {
      await sendAdminLeadEmail(newLead);
    } catch (emailError) {
      console.error("Admin email failed:", emailError.message);
    }

    try {
      await sendAutoReplyEmail(newLead);
    } catch (emailError) {
      console.error("Auto-reply failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Lead submitted successfully.",
      leadId: newLead.id
    });
  } catch (error) {
    console.error("Submit lead error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to submit lead.",
      details: error.message
    });
  }
});

app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.put("/api/leads/:id", (req, res) => {
  const { id } = req.params;

  const leadIndex = leads.findIndex(lead => String(lead.id) === String(id));

  if (leadIndex === -1) {
    return res.status(404).json({
      error: "Lead not found."
    });
  }

  const allowedFields = [
    "status",
    "notes",
    "followUpDate",
    "firstName",
    "lastName",
    "email",
    "phone",
    "dateOfBirth",
    "state",
    "coverageAmount",
    "tobaccoUse",
    "bestTimeToCall"
  ];

  for (const field of allowedFields) {
    if (field in req.body) {
      leads[leadIndex][field] = cleanText(req.body[field]);
    }
  }

  leads[leadIndex].fullName = `${leads[leadIndex].firstName || ""} ${leads[leadIndex].lastName || ""}`.trim();
  leads[leadIndex].updatedAt = new Date().toISOString();

  saveLeads();

  res.json({
    success: true,
    lead: leads[leadIndex]
  });
});

app.put("/api/leads/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const leadIndex = leads.findIndex(lead => String(lead.id) === String(id));

  if (leadIndex === -1) {
    return res.status(404).json({
      error: "Lead not found."
    });
  }

  leads[leadIndex].status = cleanText(status) || leads[leadIndex].status;
  leads[leadIndex].updatedAt = new Date().toISOString();

  saveLeads();

  res.json({
    success: true,
    lead: leads[leadIndex]
  });
});

app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;

  const beforeCount = leads.length;
  leads = leads.filter(lead => String(lead.id) !== String(id));

  if (leads.length === beforeCount) {
    return res.status(404).json({
      error: "Lead not found."
    });
  }

  saveLeads();

  res.json({
    success: true
  });
});

app.get("/api/export-leads", (req, res) => {
  const rows = leads.map(lead => ({
    ID: lead.id,
    "First Name": lead.firstName,
    "Last Name": lead.lastName,
    "Full Name": lead.fullName,
    Email: lead.email,
    Phone: lead.phone,
    "Date of Birth": lead.dateOfBirth,
    State: lead.state,
    "Coverage Amount": lead.coverageAmount,
    "Tobacco Use": lead.tobaccoUse,
    "Best Time to Call": lead.bestTimeToCall,
    Status: lead.status,
    Notes: lead.notes,
    "Follow Up Date": lead.followUpDate,
    Source: lead.source,
    "Consent Given": lead.consentGiven ? "Yes" : "No",
    "Date Submitted": new Date(lead.createdAt).toLocaleString(),
    "Last Updated": lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : ""
  }));

  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(workbook, worksheet, "Leads");

  const buffer = xlsx.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=LutzLifeInsuranceLeads.xlsx"
  );

  res.send(buffer);
});

app.use(express.static(path.join(process.cwd(), "..", "frontend", "dist")));

app.get("*", (req, res) => {
  const indexPath = path.join(process.cwd(), "..", "frontend", "dist", "index.html");

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.status(404).send(
    "Frontend build not found. Run npm run build inside frontend, or use http://localhost:5173 during development."
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Lutz Life Insurance backend running on http://localhost:${PORT}`);
  console.log(`🔌 API health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Leads saved to: ${DATA_FILE}`);
});
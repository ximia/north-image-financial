export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const lead = JSON.parse(event.body || "{}");

    const requiredFields = ["firstName", "lastName", "phone"];

    const missingFields = requiredFields.filter((field) => {
      return !lead[field] || String(lead[field]).trim() === "";
    });

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields",
          missingFields,
        }),
      };
    }

    /*
      OPTION 1:
      Send this lead to your CRM backend API.

      You need your CRM backend to have an endpoint like:
      POST https://your-crm-backend.com/api/leads

      If your CRM backend is only running on your computer with localhost,
      this will NOT work online yet.
    */

    const crmUrl = process.env.CRM_API_URL;

    if (!crmUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "CRM_API_URL is missing in Netlify environment variables",
        }),
      };
    }

    const crmResponse = await fetch(crmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CRM_API_KEY
          ? { Authorization: `Bearer ${process.env.CRM_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        email: lead.email || "",
        dob: lead.dob || "",
        state: lead.state || "",
        notes: lead.notes || "",
        source: "Lutz Life Insurance Website",
        createdAt: new Date().toISOString(),
      }),
    });

    if (!crmResponse.ok) {
      const errorText = await crmResponse.text();

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "CRM rejected the lead",
          details: errorText,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Lead sent to CRM",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        details: error.message,
      }),
    };
  }
}
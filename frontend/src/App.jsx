import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function normalizeLeadFromSupabase(lead) {
  return {
    id: lead.id,
    fullName:
      lead.name ||
      `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
      "Unnamed Lead",
    firstName: lead.first_name || "",
    lastName: lead.last_name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    dateOfBirth: lead.dob || "",
    state: lead.state || "",
    coverageAmount: lead.coverage_needed || "",
    tobaccoUse: lead.tobacco_use || "",
    bestTimeToCall: lead.best_time_to_call || "",
    status: lead.status || "New",
    notes: lead.notes || "",
    followUpDate: lead.follow_up_date || "",
    source: lead.source || "",
    importedInfo: lead.imported_info || "",
    createdAt: lead.created_at || ""
  };
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="heroContent">
          <div className="heroText">
            <div className="pill">Licensed in Washington & Texas</div>

            <h1>Life insurance without the pressure or confusion.</h1>

            <p>
              Compare options from multiple carriers with Colby Lutz, a local
              life insurance broker based near Vancouver, WA.
            </p>

            <div className="heroActions">
              <Link to="/quote" className="button primaryButton">
                Request Options
              </Link>

              <a href="tel:3609913360" className="button secondaryButton">
                Call/Text 360-991-3360
              </a>
            </div>

            <div className="trustGrid">
              <div>
                <strong>Multiple</strong>
                <span>Carrier options</span>
              </div>
              <div>
                <strong>No</strong>
                <span>Obligation quotes</span>
              </div>
              <div>
                <strong>Local</strong>
                <span>Vancouver, WA broker</span>
              </div>
            </div>
          </div>

          <div className="heroPanel">
            <div className="profileBadge">CL</div>
            <h2>Colby Lutz</h2>
            <p>Licensed Life Insurance Broker</p>

            <div className="panelList">
              <span>Term Life</span>
              <span>Whole Life</span>
              <span>Final Expense</span>
              <span>Mortgage Protection</span>
            </div>

            <Link to="/quote" className="button panelButton">
              Start Quote Request
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <span className="label">How it works</span>
          <h2>Simple process. Straight answers.</h2>
          <p>
            You do not need to know exactly what policy you want. That is what I
            help with.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <span>01</span>
            <h3>Submit your request</h3>
            <p>Share the basics so I know what kind of coverage you need.</p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>I compare options</h3>
            <p>I look through available options from multiple carriers.</p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>You review choices</h3>
            <p>I explain the options in normal language, not insurance talk.</p>
          </div>

          <div className="step">
            <span>04</span>
            <h3>You decide</h3>
            <p>No pressure. Move forward only if it makes sense.</p>
          </div>
        </div>
      </section>

      <section className="splitSection">
        <div>
          <span className="label">Who this helps</span>
          <h2>Coverage for real-life situations.</h2>
          <p>
            Life insurance is not one-size-fits-all. The right option depends on
            your family, income, health, and goals.
          </p>
        </div>

        <div className="tagCloud">
          <span>New parents</span>
          <span>Homeowners</span>
          <span>No current coverage</span>
          <span>Only work life insurance</span>
          <span>Final expense planning</span>
          <span>People with health issues</span>
        </div>
      </section>

      <section className="section lightSection">
        <div className="sectionHeader">
          <span className="label">Coverage options</span>
          <h2>Options I can help you compare.</h2>
        </div>

        <div className="cardsGrid">
          <div className="infoCard">
            <h3>Term Life</h3>
            <p>Usually the most affordable option for family protection.</p>
          </div>

          <div className="infoCard">
            <h3>Whole Life</h3>
            <p>Permanent coverage that can build cash value over time.</p>
          </div>

          <div className="infoCard">
            <h3>Final Expense</h3>
            <p>Smaller policies designed to help cover end-of-life costs.</p>
          </div>

          <div className="infoCard">
            <h3>Mortgage Protection</h3>
            <p>Coverage designed to help protect your home and family.</p>
          </div>
        </div>
      </section>

      <section className="aboutStrip">
        <div>
          <span className="label">About Colby</span>
          <h2>Local help from a real person.</h2>
          <p>
            I’m Colby Lutz, a licensed life insurance broker based near
            Vancouver, Washington. I help families compare coverage without
            pressure or confusing policy language.
          </p>
        </div>

        <div className="contactCard">
          <h3>Ask me a question</h3>
          <p>Call or text anytime and I’ll get back as soon as possible.</p>
          <a href="tel:3609913360">360-991-3360</a>
          <Link to="/quote">Request Options</Link>
        </div>
      </section>

      <FAQ />

      <section className="ctaSection">
        <h2>Want to see what you qualify for?</h2>
        <p>Submit a quick request and I’ll follow up with options.</p>
        <Link to="/quote" className="button primaryButton">
          Start Quote Request
        </Link>
      </section>
    </>
  );
}

function FAQ() {
  const faqs = [
    {
      question: "How much does life insurance cost?",
      answer:
        "It depends on your age, health, tobacco use, coverage amount, and policy type. A quick request gives me enough info to start comparing options."
    },
    {
      question: "Do I need a medical exam?",
      answer:
        "Not always. Some carriers offer no-exam options depending on your age, health, and coverage amount."
    },
    {
      question: "Can I get coverage if I smoke?",
      answer:
        "Yes. Many carriers offer coverage for tobacco users, although rates are usually higher."
    },
    {
      question: "What if I have health issues?",
      answer:
        "You may still have options. The best carrier depends on the condition, treatment history, and coverage type."
    },
    {
      question: "Is work life insurance enough?",
      answer:
        "Often it is not enough by itself because it may end if you leave the job. Personal coverage can stay with you."
    },
    {
      question: "Term or whole life?",
      answer:
        "Term is usually cheaper and lasts for a set period. Whole life is permanent and can build cash value."
    }
  ];

  return (
    <section className="section faqSection">
      <div className="sectionHeader">
        <span className="label">FAQ</span>
        <h2>Common questions.</h2>
      </div>

      <div className="faqList">
        {faqs.map(item => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="pageSection">
      <span className="label">Services</span>
      <h1>Life insurance options for different needs.</h1>

      <div className="serviceList">
        <div className="serviceItem">
          <h2>Term Life Insurance</h2>
          <p>
            Good for income replacement, mortgage protection, and family
            protection during your highest-responsibility years.
          </p>
        </div>

        <div className="serviceItem">
          <h2>Whole Life Insurance</h2>
          <p>
            Permanent life insurance designed to last your lifetime and build
            cash value over time.
          </p>
        </div>

        <div className="serviceItem">
          <h2>Final Expense Insurance</h2>
          <p>
            Smaller whole life policies designed to help cover funeral and
            end-of-life costs.
          </p>
        </div>

        <div className="serviceItem">
          <h2>Mortgage Protection</h2>
          <p>
            Coverage designed to help protect your home and family if something
            happens to you.
          </p>
        </div>
      </div>

      <Link to="/quote" className="button primaryButton">
        Request Options
      </Link>
    </section>
  );
}

function About() {
  return (
    <section className="pageSection narrow">
      <span className="label">About Colby</span>
      <h1>Real help from a local broker.</h1>

      <p>
        I help families in Washington and Texas compare life insurance options
        without overcomplicating the process.
      </p>

      <p>
        Instead of pushing one company or one product, I help you understand
        what type of coverage fits your situation.
      </p>

      <div className="serviceItem">
        <h2>What I help with</h2>
        <ul>
          <li>Term life insurance</li>
          <li>Whole life insurance</li>
          <li>Final expense coverage</li>
          <li>Mortgage protection</li>
          <li>Comparing options from multiple carriers</li>
        </ul>
      </div>
    </section>
  );
}

function QuoteForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    state: "",
    coverageAmount: "",
    tobaccoUse: "",
    bestTimeToCall: "",
    consentGiven: false,
    source: "Website"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    let nextValue = type === "checkbox" ? checked : value;

    if (name === "firstName" || name === "lastName") {
      nextValue = toTitleCase(value);
    }

    if (name === "phone") {
      nextValue = formatPhone(value);
    }

    setFormData(current => ({
      ...current,
      [name]: nextValue
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.dateOfBirth ||
      !formData.state ||
      !formData.coverageAmount ||
      !formData.tobaccoUse ||
      !formData.bestTimeToCall
    ) {
      setError("Please fill out every box before submitting.");
      return;
    }

    if (!formData.consentGiven) {
      setError("Please check the consent box before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    const firstName = toTitleCase(formData.firstName);
    const lastName = toTitleCase(formData.lastName);
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const { error: supabaseError } = await supabase.from("leads").insert([
        {
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: formData.phone,
          email: formData.email,
          dob: formData.dateOfBirth,
          age: calculateAge(formData.dateOfBirth),
          state: formData.state,
          source: "Lead Request Website",
          coverage_needed: formData.coverageAmount,
          policy_type: "Life Insurance Quote Request",
          tobacco_use: formData.tobaccoUse,
          best_time_to_call: formData.bestTimeToCall,
          status: "New",
          imported_info: `Submitted from lead request website. Coverage goal: ${formData.coverageAmount}. Tobacco use: ${formData.tobaccoUse}. Best time to call: ${formData.bestTimeToCall}. Consent given: Yes.`,
          notes: ""
        }
      ]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSuccess(true);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        state: "",
        coverageAmount: "",
        tobaccoUse: "",
        bestTimeToCall: "",
        consentGiven: false,
        source: "Website"
      });

      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (err) {
      console.error("Failed to submit lead:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="quoteHero">
        <span className="label lightLabel">Free Quote Request</span>
        <h1>See what options may fit your family.</h1>
        <p>No obligation. No pressure. I’ll follow up with next steps.</p>
      </section>

      <section className="quoteLayout">
        <div className="formCard">
          {success ? (
            <div className="successMessage">
              <h3>Request received.</h3>
              <p>Your quote request was submitted successfully.</p>
              <p>Colby will follow up soon.</p>
              <a href="tel:3609913360">Call or text 360-991-3360</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3>Tell me where to send your options</h3>

              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(360) 991-3360"
                    required
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="state">State *</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    <option value="WA">Washington</option>
                    <option value="TX">Texas</option>
                  </select>
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="coverageAmount">Coverage Goal *</label>
                  <select
                    id="coverageAmount"
                    name="coverageAmount"
                    value={formData.coverageAmount}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Amount</option>
                    <option value="$50,000 - $100,000">
                      $50,000 - $100,000
                    </option>
                    <option value="$100,000 - $250,000">
                      $100,000 - $250,000
                    </option>
                    <option value="$250,000 - $500,000">
                      $250,000 - $500,000
                    </option>
                    <option value="$500,000+">$500,000+</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label htmlFor="tobaccoUse">Tobacco Use? *</label>
                  <select
                    id="tobaccoUse"
                    name="tobaccoUse"
                    value={formData.tobaccoUse}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select One</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="bestTimeToCall">Best Time to Call *</label>
                  <select
                    id="bestTimeToCall"
                    name="bestTimeToCall"
                    value={formData.bestTimeToCall}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div className="consentBox">
                <input
                  id="consentGiven"
                  name="consentGiven"
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="consentGiven">
                  By checking this box, I agree that Lutz Life Insurance and its
                  agents may call, text, or email me about life insurance
                  options. Message and data rates may apply. I can opt out at
                  any time by replying STOP or requesting to unsubscribe.
                </label>
              </div>

              {error && <div className="errorBox">{error}</div>}

              <button className="submitButton" disabled={loading} type="submit">
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}
        </div>

        <aside className="sideCard">
          <h3>Prefer texting?</h3>
          <p>Text Colby directly and ask your question.</p>
          <a href="tel:3609913360">360-991-3360</a>
          <span>Serving Washington & Texas</span>
        </aside>
      </section>
    </>
  );
}

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = [
    "New",
    "Contacted",
    "Callback Scheduled",
    "Appointment Set",
    "Quote Sent",
    "Converted",
    "Lost"
  ];

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setLeads(Array.isArray(data) ? data.map(normalizeLeadFromSupabase) : []);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLead(id, updates) {
    const supabaseUpdates = {};

    if (updates.status !== undefined) {
      supabaseUpdates.status = updates.status;
    }

    if (updates.notes !== undefined) {
      supabaseUpdates.notes = updates.notes;
    }

    if (updates.followUpDate !== undefined) {
      supabaseUpdates.follow_up_date = updates.followUpDate || null;
    }

    try {
      const { error } = await supabase
        .from("leads")
        .update(supabaseUpdates)
        .eq("id", id);

      if (error) {
        throw error;
      }

      await loadLeads();
    } catch (err) {
      console.error("Failed to update lead:", err);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this lead?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) {
        throw error;
      }

      await loadLeads();
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  }

  function handleExport() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "DOB",
      "State",
      "Coverage",
      "Tobacco",
      "Best Time",
      "Status",
      "Follow Up",
      "Notes",
      "Source",
      "Submitted"
    ];

    const rows = leads.map(lead => [
      lead.fullName,
      lead.email,
      lead.phone,
      lead.dateOfBirth,
      lead.state,
      lead.coverageAmount,
      lead.tobaccoUse,
      lead.bestTimeToCall,
      lead.status,
      lead.followUpDate,
      lead.notes,
      lead.source,
      lead.createdAt
    ]);

    const csv = [headers, ...rows]
      .map(row =>
        row
          .map(value => `"${String(value || "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "lutz-life-leads.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchable = [
        lead.fullName,
        lead.email,
        lead.phone,
        lead.dateOfBirth,
        lead.state,
        lead.coverageAmount,
        lead.status,
        lead.notes
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchable.includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [leads, query, statusFilter]);

  const stats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === "New").length,
    followUps: leads.filter(lead => lead.followUpDate).length,
    converted: leads.filter(lead => lead.status === "Converted").length
  };

  return (
    <>
      <section className="dashboardHero">
        <span className="label lightLabel">Admin</span>
        <h1>Lead Dashboard</h1>
        <p>Track quote requests, notes, follow-ups, and lead status.</p>

        <div className="dashboardStats">
          <div>
            <strong>{stats.total}</strong>
            <span>Total Leads</span>
          </div>

          <div>
            <strong>{stats.new}</strong>
            <span>New</span>
          </div>

          <div>
            <strong>{stats.followUps}</strong>
            <span>Follow-ups</span>
          </div>

          <div>
            <strong>{stats.converted}</strong>
            <span>Converted</span>
          </div>
        </div>

        <div className="dashboardButtons">
          <button onClick={handleExport}>Export CSV</button>
          <button onClick={loadLeads}>Refresh</button>
        </div>
      </section>

      <section className="dashboardBody">
        <div className="filters">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search name, email, phone, DOB, notes..."
          />

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="emptyState">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="emptyState">No leads found.</div>
        ) : (
          <div className="leadList">
            {filteredLeads.map(lead => (
              <div className="leadCard" key={lead.id}>
                <div className="leadTop">
                  <div>
                    <h3>{lead.fullName}</h3>
                    <p>
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    </p>
                    <p>
                      <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="deleteButton"
                  >
                    Delete
                  </button>
                </div>

                <div className="leadMeta">
                  <span>DOB: {lead.dateOfBirth || "-"}</span>
                  <span>State: {lead.state || "-"}</span>
                  <span>Coverage: {lead.coverageAmount || "-"}</span>
                  <span>Tobacco: {lead.tobaccoUse || "-"}</span>
                  <span>Best time: {lead.bestTimeToCall || "-"}</span>
                  <span>Source: {lead.source || "-"}</span>
                  <span>
                    Submitted:{" "}
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>

                {lead.importedInfo && (
                  <div className="leadMeta">
                    <span>Imported Info: {lead.importedInfo}</span>
                  </div>
                )}

                <div className="leadControls">
                  <label>
                    Status
                    <select
                      value={lead.status || "New"}
                      onChange={event =>
                        updateLead(lead.id, { status: event.target.value })
                      }
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Follow-up Date
                    <input
                      type="date"
                      defaultValue={lead.followUpDate || ""}
                      onBlur={event =>
                        updateLead(lead.id, {
                          followUpDate: event.target.value
                        })
                      }
                    />
                  </label>
                </div>

                <label className="notes">
                  Notes
                  <textarea
                    defaultValue={lead.notes || ""}
                    placeholder="Add notes about the call, quote, objections, follow-up..."
                    onBlur={event =>
                      updateLead(lead.id, { notes: event.target.value })
                    }
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/">Lutz Life</Link>
      </div>

      <ul className="navLinks">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/services">Services</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
        <li>
          <NavLink to="/quote">Get Quote</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className="adminLink">
            Admin
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quote" element={<QuoteForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}
(function () {
  "use strict";

  const DEMO_STORAGE_KEY = "rulerail.demo.clients.v1";
  const validViews = new Set(["command", "standards", "comparison", "validation", "clients", "impact", "certification"]);
  let toastTimer;

  const samples = {
    hybrid: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <PmtInf>
      <Dbtr>
        <Nm>Atlas Manufacturing Group</Nm>
        <PstlAdr>
          <TwnNm>Berlin</TwnNm>
          <Ctry>DE</Ctry>
          <AdrLine>Am Industriepark 18</AdrLine>
        </PstlAdr>
      </Dbtr>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
    unstructured: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <PmtInf>
      <Dbtr>
        <Nm>Atlas Manufacturing Group</Nm>
        <PstlAdr>
          <AdrLine>Am Industriepark 18, 10115 Berlin</AdrLine>
          <AdrLine>Germany</AdrLine>
        </PstlAdr>
      </Dbtr>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
    structured: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <PmtInf>
      <Dbtr>
        <Nm>Atlas Manufacturing Group</Nm>
        <PstlAdr>
          <StrtNm>Am Industriepark</StrtNm>
          <BldgNb>18</BldgNb>
          <PstCd>10115</PstCd>
          <TwnNm>Berlin</TwnNm>
          <Ctry>DE</Ctry>
        </PstlAdr>
      </Dbtr>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
    malformed: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <PmtInf>
      <Dbtr><Nm>Atlas Manufacturing Group</Nm>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`
  };

  const rules = [
    { id: "RR-EPC-ADDR-101", title: "Hybrid address minimum elements", authority: "EPC", scope: "SCT · SCT Inst · SDD · OCT Inst", target: "PstlAdr / TwnNm + Ctry", status: "Under review", date: "15 Nov 2026", source: "https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/epc-guidance-document-provision-addresses-under-epc-payment" },
    { id: "RR-EPC-ADDR-102", title: "Unstructured-only address end date", authority: "EPC", scope: "EPC payment schemes", target: "PstlAdr / AdrLine", status: "Under review", date: "15 Nov 2026", source: "https://www.europeanpaymentscouncil.eu/news-insights/news/november-2026-end-date-unstructured-address-format-epc-payment-scheme" },
    { id: "RR-EPC-ADDR-103", title: "Country code format", authority: "EPC", scope: "All in-scope parties", target: "PstlAdr / Ctry", status: "Effective", date: "Current", source: "https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/epc-guidance-document-provision-addresses-under-epc-payment" },
    { id: "RR-SWIFT-ADDR-201", title: "Structured-address payments migration", authority: "Swift", scope: "CBPR+ payments", target: "PstlAdr", status: "Deferred", date: "TBD", source: "https://www.swift.com/news-events/news/swift-accepts-community-request-extend-structured-address-migration-iso-20022-payment-messages" },
    { id: "RR-SWIFT-ISO-202", title: "ISO 20022 message adoption", authority: "Swift", scope: "CBPR+", target: "pacs / pain messages", status: "Effective", date: "Current", source: "https://www.swift.com/standards/iso-20022" },
    { id: "RR-NB-ADDR-301", title: "API address-line limit", authority: "Northstar Bank", scope: "SCT Inst · API", target: "PstlAdr / AdrLine", status: "Effective", date: "01 Jul 2026", source: "#comparison" },
    { id: "RR-NB-ADDR-302", title: "Debtor town and country required", authority: "Northstar Bank", scope: "All payment channels", target: "Dbtr / PstlAdr", status: "Effective", date: "01 Jul 2026", source: "#comparison" }
  ];

  const banks = [
    { id: "northstar", name: "Northstar Bank", short: "NB" },
    { id: "meridian", name: "Meridian Bank", short: "MB" },
    { id: "alpine", name: "Alpine Bank", short: "AB" }
  ];

  const comparisonRows = [
    { field: "Address mode", hint: "Debtor and creditor parties", northstar: ["Hybrid or structured", "Inherited"], meridian: ["Hybrid or structured", "Inherited"], alpine: ["Structured only", "Stricter", true] },
    { field: "Town name", hint: "PstlAdr / TwnNm", northstar: ["Required", "Bank overlay"], meridian: ["Required with AdrLine", "EPC baseline"], alpine: ["Required", "Bank overlay"] },
    { field: "Country", hint: "PstlAdr / Ctry", northstar: ["ISO 3166-1 alpha-2", "Required"], meridian: ["ISO 3166-1 alpha-2", "Required"], alpine: ["ISO 3166-1 alpha-2", "Required"] },
    { field: "Address lines", hint: "PstlAdr / AdrLine", northstar: ["Maximum 2", "Bank overlay", true], meridian: ["Maximum 2", "EPC baseline"], alpine: ["Not permitted", "Stricter", true] },
    { field: "Postal code", hint: "PstlAdr / PstCd", northstar: ["Conditional", "Country rules"], meridian: ["Optional", "No overlay", true], alpine: ["Required when issued", "Bank overlay", true] },
    { field: "Validation behavior", hint: "Delivery response", northstar: ["Reject at API", "Synchronous"], meridian: ["Accept with warning", "File report", true], alpine: ["Reject file", "Batch", true] }
  ];

  const defaultClients = [
    { id: "atlas", initials: "AM", name: "Atlas Manufacturing Group", ref: "C-10482", segment: "Strategic", channel: "API · pain.001", test: "80% · 2 errors", status: "Testing", owner: "L. Klein", ownerInitials: "LK" },
    { id: "nova", initials: "NR", name: "Nova Retail Europe", ref: "C-10916", segment: "Enterprise", channel: "File · pain.001", test: "Passed · 29 Aug", status: "Ready", owner: "J. Rossi", ownerInitials: "JR" },
    { id: "helix", initials: "HL", name: "Helix Logistics", ref: "C-11007", segment: "Enterprise", channel: "H2H · pain.001", test: "Failed · 4 errors", status: "Blocked", owner: "A. Meyer", ownerInitials: "AM" },
    { id: "solaris", initials: "SE", name: "Solaris Energy Partners", ref: "C-11240", segment: "Strategic", channel: "API · pain.001", test: "Passed · 01 Sep", status: "Ready", owner: "R. Varga", ownerInitials: "RV" },
    { id: "oak", initials: "OC", name: "Oak & Crown Foods", ref: "C-11318", segment: "Commercial", channel: "File · pain.008", test: "Not submitted", status: "Not assessed", owner: "L. Klein", ownerInitials: "LK" },
    { id: "vertex", initials: "VP", name: "Vertex Pharma Holdings", ref: "C-11452", segment: "Enterprise", channel: "API · pain.001", test: "60% · 3 errors", status: "Blocked", owner: "J. Rossi", ownerInitials: "JR" },
    { id: "harbor", initials: "HM", name: "Harbor Media Group", ref: "C-11591", segment: "Commercial", channel: "File · pain.001", test: "90% · 1 warning", status: "Testing", owner: "A. Meyer", ownerInitials: "AM" }
  ];

  const impactData = {
    epc: {
      eyebrow: "EPC · Decision pending",
      statusClass: "status-amber",
      title: "Unstructured-only postal addresses currently end 15 November 2026",
      description: "The EPC says the date remains in place until its Payment Scheme Management Board reviews the issue on 9 September. RuleRail keeps the date active while explicitly marking the decision uncertainty.",
      meta: [["Current target", "15 Nov 2026"], ["Decision checkpoint", "09 Sep 2026"], ["Rule pack", "RR-EPC-2026.11"], ["Confidence", "Pending authority decision"]],
      counts: [["42", "Corporate clients", "12 blocked", ["9 API users", "23 file-channel users"]], ["3", "Payment messages", "pain.001, pain.008, pacs.008", ["Debtor and creditor parties", "Ultimate-party mappings"]], ["6", "Technology assets", "2 critical interfaces", ["Payment factory", "Address master-data feed"]], ["18", "Test scenarios", "4 require rework", ["Hybrid minimum", "Country-code boundaries"]]],
      actions: [["Approve Northstar EPC profile v3.4", "Standards", "06 Sep", "In review"], ["Complete client cohort 03 testing", "Client migration", "10 Sep", "Blocked"], ["Prepare 9 September decision response", "Product owner", "09 Sep", "Ready"]],
      decision: [["Impact rating", "High"], ["Accountable owner", "A. Meyer"], ["Assessment state", "Conditional"], ["Last reviewed", "03 Sep 2026"]]
    },
    swift: {
      eyebrow: "Swift · Deferred",
      statusClass: "status-slate",
      title: "SR2026 payments changes are deferred; replacement timing is not yet published",
      description: "Swift accepted the community request for more time and will consult on a revised timeline. RuleRail suspends date-driven client escalation while preserving analysis and completed test evidence.",
      meta: [["Previous milestone", "SR2026"], ["Replacement date", "Not published"], ["Expected update", "By December"], ["Confidence", "Official deferral"]],
      counts: [["26", "Corporate clients", "Milestones paused", ["14 CBPR+ clients", "12 multirail clients"]], ["2", "Payment messages", "pacs.008 and pacs.009", ["Agent parties", "Debtor and creditor parties"]], ["4", "Technology assets", "Roadmap review needed", ["Swift gateway", "Message transformation"]], ["11", "Test scenarios", "Evidence retained", ["Structured address", "Hybrid compatibility"]]],
      actions: [["Remove obsolete production countdown", "Product owner", "05 Sep", "In progress"], ["Rebaseline CBPR+ client journey", "Client migration", "18 Sep", "Needs decision"], ["Monitor Swift consultation update", "Standards", "Dec 2026", "Monitoring"]],
      decision: [["Impact rating", "Medium"], ["Accountable owner", "R. Varga"], ["Assessment state", "Re-planning"], ["Last reviewed", "02 Sep 2026"]]
    }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function statusClass(status) {
    return { "Effective": "status-teal", "Under review": "status-amber", "Deferred": "status-slate", "Ready": "status-teal", "Testing": "status-blue", "Blocked": "status-red", "Not assessed": "status-slate" }[status] || "status-slate";
  }

  function track(name, data) {
    try {
      if (typeof window.va === "function") window.va("event", { name, data: data || {} });
    } catch (_) {
      // Analytics failure must never interrupt the product workflow.
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function showView(view, updateHash) {
    const requested = validViews.has(view) ? view : "command";
    document.querySelectorAll("[data-view-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === requested));
    document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
      const active = item.dataset.view === requested;
      item.classList.toggle("active", active);
      active ? item.setAttribute("aria-current", "page") : item.removeAttribute("aria-current");
    });
    document.body.classList.remove("nav-open");
    if (updateHash && location.hash !== "#" + requested) history.pushState(null, "", "#" + requested);
    const panel = document.querySelector(`[data-view-panel="${requested}"]`);
    const heading = panel && panel.querySelector("h1");
    document.title = (heading ? heading.textContent + " — " : "") + "RuleRail";
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("view_opened", { view: requested });
  }

  function renderRules() {
    const query = document.getElementById("rule-search").value.toLowerCase().trim();
    const authority = document.getElementById("rule-authority").value;
    const status = document.getElementById("rule-status").value;
    const filtered = rules.filter((rule) => {
      const matchesQuery = !query || [rule.id, rule.title, rule.scope, rule.target].join(" ").toLowerCase().includes(query);
      return matchesQuery && (authority === "all" || rule.authority === authority) && (status === "all" || rule.status === status);
    });
    document.getElementById("rule-count").textContent = filtered.length + (filtered.length === 1 ? " rule" : " rules");
    document.getElementById("rule-list").innerHTML = filtered.length ? filtered.map((rule) => `
      <article class="rule-row">
        <div class="rule-name"><strong>${escapeHtml(rule.title)}</strong><code>${escapeHtml(rule.id)}</code></div>
        <div class="rule-cell"><span>Authority</span><strong>${escapeHtml(rule.authority)}</strong></div>
        <div class="rule-cell"><span>Scope</span><strong>${escapeHtml(rule.scope)}</strong></div>
        <div class="rule-cell"><span>Effective / state</span><strong>${escapeHtml(rule.date)}</strong><em class="status ${statusClass(rule.status)}">${escapeHtml(rule.status)}</em></div>
        <a class="rule-open" href="${escapeHtml(rule.source)}" ${rule.source.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""} data-rule-source="${escapeHtml(rule.id)}" aria-label="Open source for ${escapeHtml(rule.title)}">↗</a>
      </article>`).join("") : `<div class="empty-row"><strong>No matching rules</strong><p>Try a different search or filter.</p></div>`;
  }

  function renderBankComparison() {
    const toggleContainer = document.getElementById("bank-toggles");
    if (!toggleContainer.children.length) {
      toggleContainer.innerHTML = banks.map((bank) => `<button class="bank-toggle active" data-bank="${bank.id}" aria-pressed="true">${escapeHtml(bank.name)}</button>`).join("");
    }
    const selected = banks.filter((bank) => toggleContainer.querySelector(`[data-bank="${bank.id}"]`).classList.contains("active"));
    const table = document.getElementById("comparison-table");
    table.innerHTML = `<thead><tr><th>Requirement</th>${selected.map((bank) => `<th>${escapeHtml(bank.name)}<br><small>${escapeHtml(bank.short)}-SCTI-API v3.4</small></th>`).join("")}</tr></thead>
      <tbody>${comparisonRows.map((row) => `<tr><td><strong>${escapeHtml(row.field)}</strong><small>${escapeHtml(row.hint)}</small></td>${selected.map((bank) => {
        const value = row[bank.id];
        return `<td><div class="requirement-value${value[2] ? " difference" : ""}"><strong>${escapeHtml(value[0])}</strong><span class="marker">${escapeHtml(value[1])}</span></div></td>`;
      }).join("")}</tr>`).join("")}</tbody>`;
  }

  function loadClientOverrides() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveClientOverrides(overrides) {
    try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(overrides)); } catch (_) { showToast("This browser could not save the demo state."); }
  }

  function currentClients() {
    const overrides = loadClientOverrides();
    return defaultClients.map((client) => Object.assign({}, client, overrides[client.id] ? { status: overrides[client.id] } : {}));
  }

  function renderClients() {
    const query = document.getElementById("client-search").value.toLowerCase().trim();
    const filter = document.getElementById("client-status-filter").value;
    const filtered = currentClients().filter((client) => (!query || [client.name, client.ref, client.owner].join(" ").toLowerCase().includes(query)) && (filter === "all" || client.status === filter));
    document.getElementById("client-count").textContent = filtered.length + " demo clients";
    document.getElementById("client-table-body").innerHTML = filtered.length ? filtered.map((client) => `
      <tr>
        <td><span class="client-name"><i class="client-logo">${escapeHtml(client.initials)}</i><div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.ref)}</small></div></span></td>
        <td>${escapeHtml(client.segment)}</td><td>${escapeHtml(client.channel)}</td><td>${escapeHtml(client.test)}</td>
        <td><label><span class="sr-only">Readiness for ${escapeHtml(client.name)}</span><select class="readiness-select" data-client-id="${client.id}">${["Ready", "Testing", "Blocked", "Not assessed"].map((state) => `<option${state === client.status ? " selected" : ""}>${state}</option>`).join("")}</select></label></td>
        <td><span class="person"><i>${escapeHtml(client.ownerInitials)}</i>${escapeHtml(client.owner)}</span></td>
      </tr>`).join("") : `<tr><td colspan="6" class="empty-row">No matching clients. Try another filter.</td></tr>`;
  }

  function updateClientState(clientId, state) {
    const overrides = loadClientOverrides();
    const baseline = defaultClients.find((client) => client.id === clientId);
    if (baseline && baseline.status === state) delete overrides[clientId];
    else overrides[clientId] = state;
    saveClientOverrides(overrides);
    track("demo_state_updated", { readiness: state });
    showToast("Synthetic readiness updated to " + state + ".");
    renderClients();
  }

  function renderValidation(result) {
    const status = document.getElementById("validation-status");
    status.textContent = result.passed ? "Passed" : "Action required";
    status.className = "status " + (result.passed ? "status-teal" : "status-red");
    const summary = document.getElementById("validation-summary");
    summary.className = "validation-summary-card " + (result.passed ? "pass" : "fail");
    summary.innerHTML = `<div class="score">${result.score}</div><div><h3>${result.passed ? "Illustrative checks passed" : result.counts.errors + " blocking " + (result.counts.errors === 1 ? "finding" : "findings")}</h3><p>${result.counts.errors} errors · ${result.counts.warnings} warnings · ${result.counts.info} information</p></div>`;
    document.getElementById("findings-list").innerHTML = result.findings.length ? result.findings.map((item) => `
      <article class="finding ${item.severity}">
        <div class="finding-head"><h3>${escapeHtml(item.message)}</h3><code>${escapeHtml(item.code)}</code></div>
        <p><strong>Path:</strong> ${escapeHtml(item.path)}</p>
        <p><strong>Correction:</strong> ${escapeHtml(item.correction)}</p>
        <p><strong>Source:</strong> ${escapeHtml(item.source)}</p>
      </article>`).join("") : `<article class="finding info"><div class="finding-head"><h3>No findings returned</h3></div><p>The supplied message did not trigger an illustrative address rule.</p></article>`;
    track("validation_completed", { result: result.passed ? "pass" : "fail", errors: result.counts.errors, warnings: result.counts.warnings });
  }

  function renderImpact(type) {
    const data = impactData[type];
    document.querySelectorAll("[data-change]").forEach((button) => {
      const active = button.dataset.change === type;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    const cards = data.counts.map((item, index) => `<article class="impact-card"><div class="impact-top"><span class="impact-number">${item[0]}</span><span class="impact-icon">${["◎", "◫", "⌘", "✓"][index]}</span></div><h3>${item[1]}</h3><p>${item[2]}</p><ul>${item[3].map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`).join("");
    document.getElementById("impact-grid").innerHTML = `
      <article class="change-brief"><div><span class="status ${data.statusClass}">${escapeHtml(data.eyebrow)}</span><h2>${escapeHtml(data.title)}</h2><p>${escapeHtml(data.description)}</p></div><div class="change-meta">${data.meta.map((row) => `<div><span>${escapeHtml(row[0])}</span><strong>${escapeHtml(row[1])}</strong></div>`).join("")}</div></article>
      ${cards}
      <article class="panel impact-action-list"><div class="panel-heading"><div><p class="eyebrow">Response plan</p><h2>Required actions</h2></div></div><div class="action-table-wrap"><table class="data-table"><thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>State</th></tr></thead><tbody>${data.actions.map((row) => `<tr><td><strong>${escapeHtml(row[0])}</strong></td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td><td><span class="status ${statusClass(row[3] === "Blocked" ? "Blocked" : row[3] === "In review" ? "Under review" : "Effective")}">${escapeHtml(row[3])}</span></td></tr>`).join("")}</tbody></table></div></article>
      <aside class="panel decision-card"><div class="panel-heading"><div><p class="eyebrow">Controlled assessment</p><h2>Impact decision</h2></div></div><dl>${data.decision.map((row) => `<div><dt>${escapeHtml(row[0])}</dt><dd>${escapeHtml(row[1])}</dd></div>`).join("")}</dl><p class="table-footnote">Every production decision retains reviewer, rationale and rule-version evidence.</p></aside>`;
    track("change_selected", { change: type });
  }

  function exportClients() {
    const rows = [["Client", "Reference", "Segment", "Channel", "Latest test", "Readiness", "Owner"], ...currentClients().map((client) => [client.name, client.ref, client.segment, client.channel, client.test, client.status, client.owner])];
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rulerail-demo-client-readiness.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Synthetic portfolio exported.");
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const navigation = event.target.closest("[data-view]");
      const go = event.target.closest("[data-go]");
      const clientFilter = event.target.closest("[data-client-filter]");
      const ruleSource = event.target.closest("[data-rule-source], [data-track-source]");
      if (navigation) { event.preventDefault(); showView(navigation.dataset.view, true); }
      if (go) { event.preventDefault(); showView(go.dataset.go, true); }
      if (clientFilter) {
        document.getElementById("client-status-filter").value = clientFilter.dataset.clientFilter;
        renderClients();
        showView("clients", true);
      }
      if (ruleSource) track("source_opened", { source: ruleSource.dataset.ruleSource || ruleSource.dataset.trackSource });
    });
    window.addEventListener("hashchange", () => showView(location.hash.slice(1), false));
    document.getElementById("menu-button").addEventListener("click", () => document.body.classList.add("nav-open"));
    document.getElementById("close-nav").addEventListener("click", () => document.body.classList.remove("nav-open"));
    document.getElementById("nav-scrim").addEventListener("click", () => document.body.classList.remove("nav-open"));
    ["rule-search", "rule-authority", "rule-status"].forEach((id) => document.getElementById(id).addEventListener(id === "rule-search" ? "input" : "change", () => { renderRules(); track("rule_filter_changed", { authority: document.getElementById("rule-authority").value, state: document.getElementById("rule-status").value }); }));
    document.getElementById("bank-toggles").addEventListener("click", (event) => {
      const button = event.target.closest("[data-bank]");
      if (!button) return;
      const activeCount = document.querySelectorAll(".bank-toggle.active").length;
      if (button.classList.contains("active") && activeCount === 1) { showToast("Keep at least one bank in the comparison."); return; }
      button.classList.toggle("active");
      button.setAttribute("aria-pressed", String(button.classList.contains("active")));
      renderBankComparison();
      track("comparison_updated", { profiles: document.querySelectorAll(".bank-toggle.active").length });
    });
    document.getElementById("refresh-comparison").addEventListener("click", () => { renderBankComparison(); showToast("Profiles resolved for the selected scenario."); });
    document.getElementById("sample-select").addEventListener("change", (event) => { document.getElementById("xml-input").value = samples[event.target.value]; track("sample_loaded", { sample: event.target.value }); });
    document.getElementById("validate-button").addEventListener("click", () => renderValidation(window.RuleRailValidation.validatePaymentXml(document.getElementById("xml-input").value)));
    document.getElementById("xml-input").addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); document.getElementById("validate-button").click(); } });
    ["client-search", "client-status-filter"].forEach((id) => document.getElementById(id).addEventListener(id === "client-search" ? "input" : "change", () => { renderClients(); track("client_filter_changed", { readiness: document.getElementById("client-status-filter").value }); }));
    document.getElementById("client-table-body").addEventListener("change", (event) => { const select = event.target.closest("[data-client-id]"); if (select) updateClientState(select.dataset.clientId, select.value); });
    document.getElementById("reset-demo").addEventListener("click", () => { try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch (_) {} renderClients(); showToast("RuleRail demo state reset."); });
    document.getElementById("export-demo").addEventListener("click", exportClients);
    document.querySelector(".change-selector").addEventListener("click", (event) => { const tab = event.target.closest("[data-change]"); if (tab) renderImpact(tab.dataset.change); });
  }

  function initialize() {
    document.getElementById("xml-input").value = samples.hybrid;
    renderRules();
    renderBankComparison();
    renderClients();
    renderImpact("epc");
    bindEvents();
    showView(location.hash.slice(1), false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();

/**
 * Main GUI Binding file for the AgencyOS Frontend Dashboard
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize data loads
    refreshCampaigns();

    // 2. Connect the Realtime Activity Logging WS
    wsClient.subscribe(handleWsEvent);
    wsClient.connect();

    // 3. Bind UI Modals and Forms
    const form = document.getElementById("campaignForm");
    form.addEventListener("submit", handleCampaignSubmit);
});

/* Modal Helper */
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.classList.toggle("active");
}

/* API Data Hydration */
async function refreshCampaigns() {
    const campaigns = await api.getCampaigns(10);
    const tbody = document.getElementById("campaign-table-body");

    // We will render these into our Quick KPIs as well
    document.getElementById("kpi-campaigns").innerText = campaigns ? campaigns.length : 0;

    if (!campaigns || campaigns.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' class='text-muted' style='text-align:center; padding: 2rem;'>No active initiatives. Launch a new campaign to begin.</td></tr>";
        return;
    }

    let totalSpend = 0;
    tbody.innerHTML = campaigns.map(c => {
        totalSpend += (c.spent_budget || 0);
        return `
            <tr>
                <td><strong>${c.name}</strong><br><small class="text-muted">ID: #${c.id}</small></td>
                <td><span class="badge badge-info">${c.workflow_type.replace('_', ' ').toUpperCase()}</span></td>
                <td>$${c.total_budget.toFixed(2)}</td>
                <td>${renderStatusBadge(c.status)}</td>
                <td>
                    ${c.status === 'draft'
                ? `<button class="btn btn-outline" style="padding:0.4rem; color:var(--success); border-color:var(--success);" onclick="runCampaign(${c.id})">Execute AI</button>`
                : `<button class="btn btn-outline" style="padding:0.4rem;" disabled>Running...</button>`
            }
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("kpi-spend").innerText = `$${totalSpend.toFixed(2)}`;
}

function renderStatusBadge(status) {
    if (status === 'completed') return `<span class="badge badge-success">COMPLETED</span>`;
    if (status === 'running') return `<span class="badge badge-warning">PROCESSING</span>`;
    if (status === 'failed' || status === 'blocked') return `<span class="badge badge-danger">${status.toUpperCase()}</span>`;
    return `<span class="badge badge-neutral">${status.toUpperCase()}</span>`;
}

/* Form Handlers */
async function handleCampaignSubmit(e) {
    e.preventDefault();

    const payload = {
        name: document.getElementById("cp_name").value,
        brand_guidelines: document.getElementById("cp_guidelines").value,
        workflow_type: document.getElementById("cp_workflow").value,
        total_budget: parseFloat(document.getElementById("cp_budget").value)
    };

    const res = await api.createCampaign(payload);
    if (res && res.id) {
        // Close modal, clear form, refresh table
        toggleModal('createCampaignModal');
        e.target.reset();
        await refreshCampaigns();

        // Broadcast local WS mimic for UI reactiveness
        appendActivity({
            actor: "System",
            event: "CAMPAIGN_DRAFT",
            details: `Initiative created successfully: ${payload.name}`
        });
    } else {
        alert("Failed creating campaign check terminal logs");
    }
}

async function runCampaign(id) {
    const res = await api.runCampaign(id);
    if (res && res.status === "accepted") {
        await refreshCampaigns();
    }
}

/* WS Event Handlers */
function handleWsEvent(msg) {
    if (msg.type === "WS_STATUS") {
        const btn = document.getElementById("ws-status-btn");
        if (msg.status === "connected") {
            btn.innerHTML = "🟢 Live Connection";
            btn.style.color = "var(--success)";
            btn.style.borderColor = "var(--success)";
        } else {
            btn.innerHTML = "🔴 Reconnecting...";
            btn.style.color = "var(--danger)";
            btn.style.borderColor = "var(--danger)";
        }
        return;
    }

    // Capture standard payload
    if (msg.event_type || msg.type === "DECISION_CHAT") {
        let msgDetails = msg.message || msg.details?.message || msg.details?.title || JSON.stringify(msg.details);
        let actor = msg.actor || "System";
        let eventLabel = msg.event_type || msg.decision || "LOG";

        appendActivity({
            actor: actor,
            event: eventLabel,
            details: msgDetails
        });
    }

    // Trigger UI refresh on completion mapping
    if (msg.event_type === "CAMPAIGN_COMPLETED") {
        refreshCampaigns();
    }
}

function appendActivity(data) {
    const feed = document.getElementById("activity-feed");

    const div = document.createElement('div');
    div.className = "feed-item";

    // Choose icon
    let icon = "⚙️";
    if (data.actor === "strategist") icon = "🧠";
    if (data.actor === "content_writer") icon = "✍️";
    if (data.actor === "approver") icon = "⚖️";
    if (data.actor === "risk_agent") icon = "🚨";
    if (data.actor === "finance_controller") icon = "💰";

    let eventClass = "badge-neutral";
    if (data.event === "BLOCKED" || data.event === "FAILED") eventClass = "badge-danger";
    if (data.event === "COMPLETED" || data.event === "APPROVED") eventClass = "badge-success";

    div.innerHTML = `
        <div class="feed-icon">${icon}</div>
        <div class="feed-content">
            <p><strong>${data.actor.toUpperCase()}:</strong> <span class="badge ${eventClass}">${data.event}</span></p>
            <p class="text-muted" style="margin-top: 5px; font-size: 0.9rem;">${data.details}</p>
        </div>
    `;

    feed.prepend(div);
}

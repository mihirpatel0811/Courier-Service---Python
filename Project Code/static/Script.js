// --- Constants & Config ---
const BASE_RATE = 50;
const RATE_PER_KG = 20;
const RATE_PER_KM = 10;
const GST_PERCENT = 0.18;

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showMainApp();
    }
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${iconClass}"></i><div class="toast-msg">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// --- Login & Auth ---
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === "admin.17193@gmail.com" && p === "admin@17193") {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showToast("Login Successful!", "success");
        setTimeout(showMainApp, 1000);
    } else {
        document.getElementById('login-error').innerText = "Invalid Credentials";
    }
});

function showMainApp() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    loadStats();
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

// --- Navigation ---
function showSection(id) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');

    if (id === 'add-shipment' && document.getElementById('edit_id').value !== "") resetForm();

    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active-nav'));
    const activeBtn = document.querySelector(`.sidebar li[onclick="showSection('${id}')"]`);
    if (activeBtn) activeBtn.classList.add('active-nav');

    if (id === 'view-shipment') loadShipments();
    if (id === 'dashboard') loadStats();
}

// --- ID FORMATTING LOGIC ---
function formatID(id) {
    return 'MB_17193' + String(id).padStart(3, '0');
}

function extractIdFromInput(inputVal) {
    if (!inputVal) return null;
    let cleanVal = inputVal.trim().toUpperCase();
    if (cleanVal.startsWith("MB_17193")) {
        let numPart = cleanVal.replace("MB_17193", "");
        return parseInt(numPart, 10);
    }
    return parseInt(cleanVal, 10);
}

// --- Calculation Logic ---
const weightInput = document.getElementById('weight');
const distInput = document.getElementById('distance');
const amountInput = document.getElementById('totalAmount');

function calculateTotal() {
    const w = parseFloat(weightInput.value) || 0;
    const d = parseFloat(distInput.value) || 0;
    const baseCost = BASE_RATE + (w * RATE_PER_KG) + (d * RATE_PER_KM);
    const gstAmount = baseCost * GST_PERCENT;
    const total = baseCost + gstAmount;
    amountInput.value = total.toFixed(2);
}

if (weightInput && distInput) {
    weightInput.addEventListener('input', calculateTotal);
    distInput.addEventListener('input', calculateTotal);
}

// --- Add / Update Shipment ---
document.getElementById('shipmentForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    if (formData.get('s_phone').length !== 10 || formData.get('r_phone').length !== 10) {
        showToast("Phone numbers must be 10 digits.", "error");
        return;
    }
    const res = await fetch('/api/save_shipment', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.status === 'success') {
        showToast(data.message, "success");
        resetForm();
        setTimeout(() => showSection('view-shipment'), 1000);
    } else {
        showToast(data.message, "error");
    }
});

function resetForm() {
    document.getElementById('shipmentForm').reset();
    document.getElementById('edit_id').value = "";
    document.getElementById('submitBtn').innerText = "Save Shipment";
}

// --- View Shipments (With Serial Number Logic) ---
async function loadShipments() {
    const res = await fetch('/api/shipments');
    const data = await res.json();
    const tbody = document.querySelector('#shipmentTable tbody');
    tbody.innerHTML = '';

    data.forEach((item, index) => {
        const serialNo = index + 1; // Visual Serial Number
        const statuses = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered'];
        let options = '';
        statuses.forEach(s => {
            options += `<option value="${s}" ${item.status === s ? 'selected' : ''}>${s}</option>`;
        });

        let statusColor = '#fff';
        if (item.status === 'Delivered') statusColor = '#22c55e';
        else if (item.status === 'In Transit') statusColor = '#f59e0b';
        else if (item.status === 'Out for Delivery') statusColor = '#06b6d4';

        const row = `<tr>
            <td style="color: var(--text-muted); font-weight: bold;">${serialNo}</td>
            <td style="font-weight:bold; color:var(--accent);">${formatID(item.id)}</td>
            <td><strong style="color:white;">${item.sender_name}</strong><br><small style="color:var(--text-muted);">${item.sender_phone}</small></td>
            <td><strong style="color:white;">${item.receiver_name}</strong><br><small style="color:var(--text-muted);">${item.receiver_city}</small></td>
            <td>
                <select onchange="updateStatus(${item.id}, this.value)" style="border:1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color:${statusColor}; padding: 5px; border-radius:5px;">
                    ${options}
                </select>
            </td>
            <td>₹${item.total_amount}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editShipment(${item.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-del" onclick="deleteShipment(${item.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

async function editShipment(id) {
    const res = await fetch(`/api/shipment/${id}`);
    if (res.ok) {
        const data = await res.json();
        showSection('add-shipment');
        document.getElementById('page-title').innerText = "Edit Shipment";
        document.getElementById('submitBtn').innerText = "Update Shipment";

        document.getElementById('edit_id').value = data.id;
        document.getElementById('s_name').value = data.sender_name;
        document.getElementById('s_phone').value = data.sender_phone;
        document.getElementById('s_addr').value = data.sender_address;
        document.getElementById('s_city').value = data.sender_city;
        document.getElementById('r_name').value = data.receiver_name;
        document.getElementById('r_phone').value = data.receiver_phone;
        document.getElementById('r_addr').value = data.receiver_address;
        document.getElementById('r_city').value = data.receiver_city;
        document.getElementById('weight').value = data.weight;
        document.getElementById('distance').value = data.distance;
        document.getElementById('totalAmount').value = data.total_amount;
        document.getElementById('c_desc').value = data.courier_desc;
    }
}

async function updateStatus(id, newStatus) {
    await fetch('/api/update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: newStatus })
    });
    showToast(`Status updated to ${newStatus}`, "success");
}

async function deleteShipment(id) {
    if (confirm("Are you sure you want to remove this shipment?")) {
        await fetch(`/api/delete_shipment/${id}`, { method: 'DELETE' });
        showToast("Shipment deleted", "success");
        loadShipments();
    }
}

// --- Dashboard & Stats ---
async function loadStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById("stat-total").innerText = data.total;
    document.getElementById("stat-delivered").innerText = data.delivered;
    document.getElementById("stat-transit").innerText = data.transit;
}

// --- Real Time Tracking with Animation ---
async function realTimeTracking() {
    const rawInput = document.getElementById('trackInput').value;
    const inputId = extractIdFromInput(rawInput);
    const ui = document.getElementById('tracking-ui');
    const loader = document.getElementById('tracking-loader');

    ui.classList.add('hidden');
    loader.classList.add('hidden');

    if (!inputId || isNaN(inputId)) { showToast("Invalid Shipment ID", "error"); return; }

    loader.classList.remove('hidden');

    setTimeout(async () => {
        const res = await fetch(`/api/shipment/${inputId}`);
        loader.classList.add('hidden');

        if (res.ok) {
            const data = await res.json();
            ui.classList.remove('hidden');

            document.getElementById('track-id-display').innerText = "Tracking: " + formatID(data.id);
            document.getElementById('track-from').innerText = `${data.sender_name}, ${data.sender_city}`;
            document.getElementById('track-to').innerText = `${data.receiver_name}, ${data.receiver_city}`;
            document.getElementById('track-status').innerText = data.status;

            const steps = { 'Booked': 'step-Booked', 'In Transit': 'step-Transit', 'Out for Delivery': 'step-Out', 'Delivered': 'step-Delivered' };
            const order = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered'];
            const currentIdx = order.indexOf(data.status);

            Object.keys(steps).forEach((key, index) => {
                const el = document.getElementById(steps[key]);
                if (index <= currentIdx) el.classList.add('active');
                else el.classList.remove('active');
            });
        } else {
            showToast("Shipment ID not found.", "error");
        }
    }, 2000);
}

// NEW: Reset Tracking Function
function resetTracking() {
    document.getElementById('trackInput').value = '';
    document.getElementById('tracking-ui').classList.add('hidden');
    document.getElementById('tracking-loader').classList.add('hidden');

    // Reset Timeline Visuals
    const steps = ['step-Booked', 'step-Transit', 'step-Out', 'step-Delivered'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    showToast("Tracking cleared", "success");
}

// --- New Colorful A4 Invoice Format ---
async function fetchInvoiceDetails() {
    const rawInput = document.getElementById('printInputId').value;
    const id = extractIdFromInput(rawInput);

    if (!id || isNaN(id)) { showToast("Invalid Shipment ID", "error"); return; }

    const res = await fetch(`/api/shipment/${id}`);
    if (res.ok) {
        const data = await res.json();
        const preview = document.getElementById('invoice-preview');
        const actions = document.getElementById('print-actions');
        const date = new Date().toLocaleDateString();

        // Calculate some dummy tax breakdown for the bill
        const basePrice = (data.total_amount / 1.18).toFixed(2);
        const taxAmt = (data.total_amount - basePrice).toFixed(2);

        // MODIFIED: Updated Brand Name to MB TurboDeliver
        preview.innerHTML = `
            <div class="inv-header">
                <div class="inv-brand">
                    <h1>GoParcel</h1>
                    <p><i class="fas fa-globe"></i> Global Courier Services</p>
                </div>
                <div class="inv-meta">
                    <h2>INVOICE</h2>
                    <p>#INV-${data.id}</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${date}</p>
                </div>
            </div>

            <div class="inv-body">
                
                <div class="inv-address-grid">
                    <div class="inv-addr-box">
                        <h4>Billed To (Receiver)</h4>
                        <p><strong>${data.receiver_name}</strong></p>
                        <p>${data.receiver_address}</p>
                        <p>${data.receiver_city}</p>
                        <p><i class="fas fa-phone-alt"></i> ${data.receiver_phone}</p>
                    </div>
                    <div class="inv-addr-box" style="text-align: right;">
                        <h4>Shipped From (Sender)</h4>
                        <p><strong>${data.sender_name}</strong></p>
                        <p>${data.sender_address}</p>
                        <p>${data.sender_city}</p>
                        <p><i class="fas fa-phone-alt"></i> ${data.sender_phone}</p>
                    </div>
                </div>

                <table class="inv-table">
                    <thead>
                        <tr>
                            <th width="50%">Description</th>
                            <th>Weight / Dist</th>
                            <th class="right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${data.courier_desc || 'Standard Courier Package'}</strong><br>
                                <small style="color:#64748b">Logistics Service Charge</small>
                            </td>
                            <td>${data.weight} Kg / ${data.distance} Km</td>
                            <td class="right">₹${basePrice}</td>
                        </tr>
                        <tr>
                            <td>GST (18%)</td>
                            <td>-</td>
                            <td class="right">₹${taxAmt}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="inv-total-section">
                    <div class="inv-total-box">
                        <span>Grand Total Payable</span>
                        <h1>₹${data.total_amount}</h1>
                    </div>
                </div>

                <div style="margin-top: 40px;">
                    <h4 style="color: var(--primary); font-size: 0.9rem; margin-bottom: 10px;">Terms & Conditions:</h4>
                    <p style="color: #64748b; font-size: 0.8rem; line-height: 1.5;">
                        1. Goods are carried at owner's risk.<br>
                        2. No claims will be entertained after 30 days of delivery.<br>
                        3. This is a computer-generated invoice and requires no signature.
                    </p>
                </div>
            </div>

            <div class="inv-footer">
                <p><strong>MB TurboDeliver Head Office:</strong> 45/A, Tech Park, Hinjewadi, Pune, MH - 411057</p>
                <p>support@mbturbodeliver.com | www.mbturbodeliver.com</p>
            </div>
        `;

        preview.classList.remove('hidden');
        actions.classList.remove('hidden');
    } else {
        showToast("Shipment ID not found.", "error");
    }
}

// NEW: Reset Invoice Function
function resetInvoice() {
    document.getElementById('printInputId').value = '';
    const preview = document.getElementById('invoice-preview');
    preview.innerHTML = '';
    preview.classList.add('hidden');
    document.getElementById('print-actions').classList.add('hidden');
    showToast("Invoice section reset", "success");
}

function printInvoiceNow() {
    window.print();
}
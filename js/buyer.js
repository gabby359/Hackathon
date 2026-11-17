function initMemberHeader() {
  const user = getCurrentUser();
  const barangayName = user.barangay || "Brgy. San Francisco, General Trias";

  document.getElementById("active-user-subtitle").innerHTML =
    `Logged in as <mark class="user-highlight">${user.name}</mark> (${user.badge})`;

  document.getElementById("user-barangay-badge").textContent =
    `📍 ${barangayName} Pool Only`;

  document.getElementById("welcome-headline").innerHTML =
    `Welcome, <mark class="user-highlight">${user.name}</mark>! Order with your ${barangayName} neighbors or ambag to your local pantry.`;
}

function renderImpactStats() {
  const harvests = getHarvests();
  const members = getVerifiedMembers();
  const totalPooledKg = harvests.reduce(
    (sum, item) => sum + item.currentPooledKg,
    0,
  );
  const totalPantryAmbagKg = harvests.reduce(
    (sum, item) => sum + (item.pantryAmbagKg || 0),
    0,
  );

  document.getElementById("impact-stats").innerHTML = `
    <div class="stat-box">
      <span class="stat-value">${members.length} Members</span>
      <span class="stat-label">Verified in Your Barangay</span>
    </div>
    <div class="stat-box">
      <span class="stat-value">${totalPooledKg.toLocaleString()} kg</span>
      <span class="stat-label">Your Barangay's Total Pool</span>
    </div>
    <div class="stat-box">
      <span class="stat-value">${totalPantryAmbagKg.toLocaleString()} kg</span>
      <span class="stat-label">🧺 Brgy. Pantry Ambag</span>
    </div>
  `;
}

function renderHarvests() {
  renderImpactStats();
  const grid = document.getElementById("harvest-grid");
  const selectedMonth = document.getElementById("month-filter").value;
  const allHarvests = getHarvests();
  const totalVerifiedMembers = getVerifiedMembers().length;

  const filtered =
    selectedMonth === "All"
      ? allHarvests
      : allHarvests.filter((item) => item.harvestMonth === selectedMonth);

  grid.innerHTML = filtered
    .map((item) => {
      const percent = Math.min(
        100,
        Math.round((item.currentPooledKg / item.targetBulkKg) * 100),
      );
      const isLocked = item.currentPooledKg >= item.targetBulkKg;
      const savings = item.marketPricePerKg - item.bulkPricePerKg;
      const remainingKg = Math.max(0, item.targetBulkKg - item.currentPooledKg);
      const joinedCount = Math.min(
        totalVerifiedMembers,
        item.brgyMembersJoined || 0,
      );
      const donorCount = Math.min(
        totalVerifiedMembers,
        item.ambagDonorsCount || 0,
      );

      return `
        <div class="card">
          <div class="card-img-wrap">
            <img src="${item.imageUrl}" alt="${item.cropName}" class="card-img" />
            <span class="status-ribbon ${isLocked ? "locked" : ""}">
              ${isLocked ? "✓ Brgy. Quota Locked" : `${remainingKg} kg needed to lock`}
            </span>
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="badge">📅 ${item.harvestMonth}</span>
              <span class="location">📍 ${item.location}</span>
            </div>

            <h3>${item.cropName}</h3>
            <p class="farmer-name">Posted by <strong>${item.farmerName}</strong></p>

            <div class="price-box">
              <div class="bulk-price">₱${item.bulkPricePerKg}<span>/kg</span></div>
              <div class="market-compare">
                <span class="old-price">Market: ₱${item.marketPricePerKg}/kg</span>
                <span class="savings-pill">Save ₱${savings}/kg</span>
              </div>
            </div>

            <div class="ambag-box">
              <div>
                <span class="ambag-title">🧺 Brgy. Pantry Ambag: ${item.pantryAmbagKg || 0} kg</span>
                <span class="ambag-sub">${donorCount} of ${totalVerifiedMembers} verified brgy. members chipped in</span>
              </div>
              ${
                isLocked
                  ? ""
                  : `<button class="ambag-btn" onclick="openAmbagOnlyModal('${item.id}')">+ Ambag</button>`
              }
            </div>

            <div class="pool-section">
              <div class="pool-labels">
                <span>${item.currentPooledKg} / ${item.targetBulkKg} kg (Your Brgy.)</span>
                <span>${percent}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${isLocked ? "locked" : ""}" style="width: ${percent}%"></div>
              </div>
              <p class="pool-note ${isLocked ? "success" : ""}">
                ${
                  isLocked
                    ? "🎉 Target reached! Locked for Brgy. San Francisco Hall delivery."
                    : `🏘️ ${joinedCount} of ${totalVerifiedMembers} verified brgy. members joined • Harvest: ${item.harvestWindow}`
                }
              </p>
            </div>

            ${
              isLocked
                ? `<div class="order-row" style="justify-content: center; background: #fef3c7; border-radius: 9px; padding: 0.65rem; border: 1px solid #fde68a;">
                     <span style="font-size: 0.8rem; font-weight: 700; color: #92400e;">
                       🔒 Pool Closed &amp; Locked for Brgy. San Francisco
                     </span>
                   </div>`
                : `<div class="order-row">
                     <input type="number" id="qty-${item.id}" min="1" max="${remainingKg}" placeholder="kg" />
                     <button class="order-btn" onclick="openCheckoutModal('${item.id}')">Pre-Order Share</button>
                   </div>`
            }
          </div>
        </div>
      `;
    })
    .join("");
}

function openCheckoutModal(batchId) {
  const input = document.getElementById(`qty-${batchId}`);
  const personalKg = Number(input.value);
  if (!personalKg || personalKg <= 0) {
    showToast("⚠️ Enter how many kilograms you want to pre-order.");
    input.focus();
    return;
  }

  const user = getCurrentUser();
  const item = getHarvests().find((h) => h.id === batchId);
  const personalCost = personalKg * item.bulkPricePerKg;

  document.getElementById("modal-title").textContent =
    "Confirm Barangay Member Pre-Order";
  document.getElementById("modal-body").innerHTML = `
    <div class="receipt-row"><span>Verified Member:</span><strong>${user.name}</strong></div>
    <div class="receipt-row"><span>Barangay Pool:</span><span>${user.barangay || "Brgy. San Francisco"}</span></div>
    <div class="receipt-row"><span>Personal Order:</span><strong>${personalKg} kg ${item.cropName} (₱${personalCost.toLocaleString()})</strong></div>

    <div class="ambag-addon-box">
      <label class="ambag-addon-label">
        <input type="checkbox" id="ambag-check" checked onchange="updateModalTotal(${personalCost}, ${item.bulkPricePerKg})" />
        🧺 Add +1 kg (₱${item.bulkPricePerKg}) to Brgy. San Francisco Pantry
      </label>
      <p class="ambag-addon-note">Recorded under your verified barangay member ledger.</p>
    </div>

    <div class="receipt-total">
      <span>Total Escrow Deposit:</span>
      <span id="modal-total-display">₱${(personalCost + item.bulkPricePerKg).toLocaleString()}</span>
    </div>

    <div class="escrow-note">
      🛡️ <strong>All-or-Nothing Escrow:</strong> If your barangay pool doesn't reach 100% by the cutoff, 100% of your money is automatically refunded.
    </div>

    <button class="confirm-pay-btn" onclick="confirmPoolOrder('${item.id}', ${personalKg}, false)">
      Confirm &amp; Pool via E-Wallet
    </button>
  `;

  document.getElementById("checkout-modal").classList.remove("hidden");
}

function updateModalTotal(personalCost, pricePerKg) {
  const checked = document.getElementById("ambag-check").checked;
  document.getElementById("modal-total-display").textContent =
    `₱${(checked ? personalCost + pricePerKg : personalCost).toLocaleString()}`;
}

function openAmbagOnlyModal(batchId) {
  const user = getCurrentUser();
  const item = getHarvests().find((h) => h.id === batchId);

  document.getElementById("modal-title").textContent =
    "🧺 Direct Barangay Pantry Ambag";
  document.getElementById("modal-body").innerHTML = `
    <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.9rem;">
      Contributing as <strong>${user.name}</strong> (Verified Member of <strong>${user.barangay || "Brgy. San Francisco"}</strong>). Every ₱${item.bulkPricePerKg} buys 1 kg of fresh ${item.cropName} for your barangay's community pantry.
    </p>
    <div class="form-group">
      <label>Kilograms to Ambag (₱${item.bulkPricePerKg}/kg)</label>
      <input type="number" id="ambag-only-kg" value="2" min="1" oninput="updateAmbagOnlyTotal(${item.bulkPricePerKg})" />
    </div>
    <div class="receipt-total" style="margin-bottom: 0.9rem;">
      <span>Total Ambag Contribution:</span>
      <span id="ambag-only-total">₱${(2 * item.bulkPricePerKg).toLocaleString()}</span>
    </div>
    <button class="confirm-pay-btn ambag-confirm" onclick="confirmPoolOrder('${item.id}', 0, true)">
      Confirm Barangay Pantry Ambag
    </button>
  `;

  document.getElementById("checkout-modal").classList.remove("hidden");
}

function updateAmbagOnlyTotal(pricePerKg) {
  const kg = Math.max(
    0,
    Number(document.getElementById("ambag-only-kg").value) || 0,
  );
  document.getElementById("ambag-only-total").textContent =
    `₱${(kg * pricePerKg).toLocaleString()}`;
}

function closeModal() {
  document.getElementById("checkout-modal").classList.add("hidden");
}

function confirmPoolOrder(batchId, personalKg, isAmbagOnly) {
  let ambagKg = 0;
  if (isAmbagOnly) {
    ambagKg = Number(document.getElementById("ambag-only-kg").value) || 0;
    if (ambagKg <= 0) return showToast("⚠️ Enter a valid kilogram amount.");
  } else {
    const check = document.getElementById("ambag-check");
    if (check && check.checked) ambagKg = 1;
  }

  const totalAddedKg = personalKg + ambagKg;
  const maxMembers = getVerifiedMembers().length;
  let unlockedNow = false;
  let cropTitle = "";

  const updated = getHarvests().map((item) => {
    if (item.id !== batchId) return item;
    const wasLocked = item.currentPooledKg >= item.targetBulkKg;
    const newTotal = item.currentPooledKg + totalAddedKg;
    if (!wasLocked && newTotal >= item.targetBulkKg) unlockedNow = true;
    cropTitle = item.cropName;

    return {
      ...item,
      currentPooledKg: newTotal,
      brgyMembersJoined: Math.min(
        maxMembers,
        (item.brgyMembersJoined || 0) + (personalKg > 0 ? 1 : 0),
      ),
      pantryAmbagKg: (item.pantryAmbagKg || 0) + ambagKg,
      ambagDonorsCount: Math.min(
        maxMembers,
        (item.ambagDonorsCount || 0) + (ambagKg > 0 ? 1 : 0),
      ),
    };
  });

  saveHarvests(updated);

  const user = getCurrentUser();
  const targetCrop = updated.find((h) => h.id === batchId);
  if (ambagKg > 0 && targetCrop) {
    recordMemberAmbag(
      user.name,
      user.barangay,
      targetCrop.cropName,
      ambagKg,
      targetCrop.bulkPricePerKg,
    );
  }

  closeModal();
  renderHarvests();

  showToast(
    unlockedNow
      ? `🎉 100% Bulk Goal Unlocked for ${cropTitle}!`
      : `🧺 Salamat! Added ${totalAddedKg} kg to Brgy. San Francisco's pool.`,
  );
}

function resetDemoData() {
  saveHarvests(INITIAL_HARVESTS);
  saveVerifiedMembers(INITIAL_MEMBERS);
  renderHarvests();
  showToast("↺ Demo reset to initial state.");
}

document.addEventListener("DOMContentLoaded", () => {
  initMemberHeader();
  renderHarvests();
});

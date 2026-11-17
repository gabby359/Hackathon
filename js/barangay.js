function renderBarangayDashboard() {
  const harvests = getHarvests();
  const members = getVerifiedMembers();

  const totalPantryKg = harvests.reduce(
    (sum, item) => sum + (item.pantryAmbagKg || 0),
    0,
  );
  const totalMemberKg = harvests.reduce(
    (sum, item) => sum + (item.currentPooledKg - (item.pantryAmbagKg || 0)),
    0,
  );
  const estimatedFamiliesFed = Math.round(totalPantryKg * 1.5);

  // 1. Render Top KPI Summary Cards
  document.getElementById("barangay-summary-cards").innerHTML = `
    <div class="card" style="padding: 1.25rem;">
      <span class="subtitle">🧺 Total Member Ambag Stock</span>
      <h2 style="font-size: 1.75rem; color: var(--primary); margin: 0.25rem 0;">${totalPantryKg} kg</h2>
      <p class="pool-note">Free produce for Community Pantry (~${estimatedFamiliesFed} families)</p>
    </div>
    <div class="card" style="padding: 1.25rem;">
      <span class="subtitle">🏘️ Active Barangay Contributors</span>
      <h2 style="font-size: 1.75rem; margin: 0.25rem 0;">${members.length} Members</h2>
      <p class="pool-note">Verified residents in Brgy. San Francisco</p>
    </div>
    <div class="card" style="padding: 1.25rem;">
      <span class="subtitle">🚛 Combined Truckload Volume</span>
      <h2 style="font-size: 1.75rem; color: var(--accent); margin: 0.25rem 0;">${totalPantryKg + totalMemberKg} kg</h2>
      <p class="pool-note">${totalMemberKg} kg personal orders + ${totalPantryKg} kg pantry ambag</p>
    </div>
  `;

  // 2. Render Verified Barangay Members & Their Current Ambag
  document.getElementById("verified-member-count").textContent =
    `${members.length} Verified Members`;
  document.getElementById("verified-members-body").innerHTML = members
    .map(
      (member) => `
        <tr>
          <td><strong>${member.name}</strong></td>
          <td><span class="subtitle">${member.purok}</span></td>
          <td><span class="badge">✓ ${member.status}</span></td>
          <td>${member.lastContribution}</td>
          <td><strong style="color: var(--primary);">${member.totalAmbagKg} kg</strong></td>
          <td><strong>₱${member.totalAmbagPhp.toLocaleString()}</strong></td>
        </tr>
      `,
    )
    .join("");

  // 3. Render Incoming Harvest Batches Table
  document.getElementById("barangay-manifest-body").innerHTML = harvests
    .map((item) => {
      const memberOnlyKg = item.currentPooledKg - (item.pantryAmbagKg || 0);
      const isLocked = item.currentPooledKg >= item.targetBulkKg;

      return `
        <tr>
          <td>
            <strong>${item.cropName}</strong><br />
            <span class="subtitle">${item.farmerName} (${item.location})</span>
          </td>
          <td>${item.harvestWindow}</td>
          <td>${memberOnlyKg} kg</td>
          <td><strong style="color: var(--primary);">${item.pantryAmbagKg || 0} kg</strong> (${item.ambagDonorsCount || 0} donors)</td>
          <td>
            <span class="badge" style="${isLocked ? "background:#fef3c7;color:#92400e;" : ""}">
              ${isLocked ? "✓ Locked for Delivery" : `${item.currentPooledKg}/${item.targetBulkKg} kg`}
            </span>
          </td>
          <td>
            <button class="ambag-btn" onclick="sponsorBarangayTopUp('${item.id}')">
              +20 kg Brgy. Pantry Sponsor
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function sponsorBarangayTopUp(batchId) {
  const updated = getHarvests().map((item) => {
    if (item.id !== batchId) return item;
    return {
      ...item,
      currentPooledKg: item.currentPooledKg + 20,
      pantryAmbagKg: (item.pantryAmbagKg || 0) + 20,
      ambagDonorsCount: (item.ambagDonorsCount || 0) + 1,
    };
  });

  saveHarvests(updated);
  renderBarangayDashboard();
  showToast(
    "🏛️ Added +20 kg Barangay Nutrition Fund sponsorship to Community Pantry!",
  );
}

document.addEventListener("DOMContentLoaded", renderBarangayDashboard);

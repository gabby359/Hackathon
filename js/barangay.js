function renderBarangayDashboard() {
  const harvests = getHarvests();
  const members = getVerifiedMembers();
  const currentUser = getCurrentUser();

  const adminSubtitle = document.getElementById("barangay-admin-subtitle");
  if (adminSubtitle) {
    adminSubtitle.innerHTML = `Logged in as <mark class="user-highlight">${currentUser.name}</mark> • Brgy. San Francisco, General Trias`;
  }

  const totalPantryKg = harvests.reduce(
    (sum, item) => sum + (item.pantryAmbagKg || 0),
    0,
  );
  const totalMemberKg = harvests.reduce(
    (sum, item) =>
      sum + Math.max(0, item.currentPooledKg - (item.pantryAmbagKg || 0)),
    0,
  );
  const estimatedFamiliesFed = Math.round(totalPantryKg * 1.5);

  const summaryContainer = document.getElementById("barangay-summary-cards");
  if (summaryContainer) {
    summaryContainer.innerHTML = `
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
        <span class="subtitle">🚛 Total Barangay Delivery Volume</span>
        <h2 style="font-size: 1.75rem; color: var(--accent); margin: 0.25rem 0;">${totalPantryKg + totalMemberKg} kg</h2>
        <p class="pool-note">${totalMemberKg} kg personal orders + ${totalPantryKg} kg pantry ambag</p>
      </div>
    `;
  }

  const memberCountBadge = document.getElementById("verified-member-count");
  if (memberCountBadge) {
    memberCountBadge.textContent = `${members.length} Verified Members`;
  }

  const membersBody = document.getElementById("verified-members-body");
  if (membersBody) {
    membersBody.innerHTML = members
      .map((member) => {
        const isCurrentUser =
          member.name.toLowerCase() === currentUser.name.toLowerCase();

        return `
          <tr style="${isCurrentUser ? "background: #fefce8;" : ""}">
            <td>
              ${
                isCurrentUser
                  ? `<mark class="user-highlight">${member.name}</mark> <span style="font-size:0.72rem; color:#15803d; font-weight:700;">(You)</span>`
                  : `<strong>${member.name}</strong>`
              }
            </td>
            <td><span class="subtitle">${member.purok}</span></td>
            <td><span class="badge">✓ ${member.status}</span></td>
            <td>${member.lastContribution}</td>
            <td><strong style="color: var(--primary);">${member.totalAmbagKg} kg</strong></td>
            <td><strong>₱${member.totalAmbagPhp.toLocaleString()}</strong></td>
          </tr>
        `;
      })
      .join("");
  }

  const manifestBody = document.getElementById("barangay-manifest-body");
  if (manifestBody) {
    manifestBody.innerHTML = harvests
      .map((item) => {
        const ambagKg = item.pantryAmbagKg || 0;
        const memberOnlyKg = Math.max(0, item.currentPooledKg - ambagKg);
        const isLocked = item.currentPooledKg >= item.targetBulkKg;

        return `
          <tr>
            <td>
              <strong>${item.cropName}</strong><br />
              <span class="subtitle">${item.farmerName} (${item.location})</span>
            </td>
            <td>${item.harvestWindow}</td>
            <td>${memberOnlyKg} kg</td>
            <td><strong style="color: var(--primary);">${ambagKg} kg</strong> (${item.ambagDonorsCount || 0} donors)</td>
            <td>
              <span class="badge" style="${isLocked ? "background:#fef3c7;color:#92400e;" : ""}">
                ${isLocked ? "✓ Locked for Delivery" : `${item.currentPooledKg} / ${item.targetBulkKg} kg`}
              </span>
            </td>
            <td>
              <button class="ambag-btn" onclick="sponsorBarangayTopUp('${item.id}')">
                +10 kg Brgy. Pantry Sponsor
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  renderReadOnlyHarvestFeed("barangay-harvest-feed");
}

function sponsorBarangayTopUp(batchId) {
  const updated = getHarvests().map((item) => {
    if (item.id !== batchId) return item;
    return {
      ...item,
      currentPooledKg: item.currentPooledKg + 10,
      pantryAmbagKg: (item.pantryAmbagKg || 0) + 10,
      ambagDonorsCount: (item.ambagDonorsCount || 0) + 1,
    };
  });

  saveHarvests(updated);
  renderBarangayDashboard();
  showToast(
    "🏛️ Added +10 kg Barangay Nutrition Fund sponsorship to Community Pantry!",
  );
}

document.addEventListener("DOMContentLoaded", renderBarangayDashboard);

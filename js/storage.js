const STORAGE_KEY = "anidirect_single_brgy_v5";
const USER_SESSION_KEY = "anidirect_active_user_v1";
const MEMBERS_STORAGE_KEY = "anidirect_verified_members_v5";

const DEMO_ACCOUNTS = {
  "member-sf": {
    id: "member-sf",
    role: "member",
    name: "Juan Dela Cruz",
    barangay: "Brgy. San Francisco, General Trias",
    badge: "Verified Barangay Member",
  },
  "barangay-sf": {
    id: "barangay-sf",
    role: "barangay",
    name: "Kap. Elena Mendoza",
    barangay: "Brgy. San Francisco, General Trias",
    badge: "Barangay Pantry Coordinator",
  },
  "farmer-renato": {
    id: "farmer-renato",
    role: "farmer",
    name: "Mang Renato Bautista",
    location: "Indang, Cavite",
    badge: "Verified Local Farmer",
  },
};

// 4 Verified Members of Brgy. San Francisco
const INITIAL_MEMBERS = [
  {
    id: "mem-1",
    name: "Juan Dela Cruz",
    purok: "Purok 2 • Block 4 Lot 12",
    barangay: "Brgy. San Francisco, General Trias",
    status: "Verified Resident",
    totalAmbagKg: 10,
    totalAmbagPhp: 420,
    lastContribution: "Highland Carrots (+10 kg)",
  },
  {
    id: "mem-2",
    name: "Aling Nena Villanueva",
    purok: "Purok 1 • Phase 2",
    barangay: "Brgy. San Francisco, General Trias",
    status: "Verified Resident",
    totalAmbagKg: 25,
    totalAmbagPhp: 875,
    lastContribution: "Queen Pineapples (+25 kg)",
  },
  {
    id: "mem-3",
    name: "Carlo & Bea Magbanua",
    purok: "Purok 4 • Mabini St.",
    barangay: "Brgy. San Francisco, General Trias",
    status: "Verified Resident",
    totalAmbagKg: 8,
    totalAmbagPhp: 336,
    lastContribution: "Highland Carrots (+8 kg)",
  },
  {
    id: "mem-4",
    name: "Dr. Ramon Evangelista",
    purok: "Purok 3 • Camella Section",
    barangay: "Brgy. San Francisco, General Trias",
    status: "Verified Resident",
    totalAmbagKg: 15,
    totalAmbagPhp: 1020,
    lastContribution: "Red Creole Onions (+15 kg)",
  },
];

// Harvest pools showing ONLY Brgy. San Francisco members & totals
const INITIAL_HARVESTS = [
  {
    id: "batch-1",
    cropName: "Highland Carrots (Grade A)",
    farmerName: "Mang Renato Bautista",
    location: "La Trinidad, Benguet",
    harvestMonth: "November 2026",
    harvestWindow: "Nov 25 – Nov 30",
    bulkPricePerKg: 42,
    marketPricePerKg: 85,
    targetBulkKg: 50, // 50 kg bulk crate for Brgy. San Francisco only
    currentPooledKg: 38, // 20 kg household orders + 18 kg pantry ambag (Add 12 kg in demo to lock 100%!)
    brgyMembersJoined: 3, // 3 of 4 verified Brgy. San Francisco members
    pantryAmbagKg: 18, // Juan (10 kg) + Carlo & Bea (8 kg)
    ambagDonorsCount: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "batch-2",
    cropName: "Queen Pineapples (Sweet)",
    farmerName: "Aling Marites Reyes",
    location: "Silang, Cavite",
    harvestMonth: "November 2026",
    harvestWindow: "Nov 22 – Nov 28",
    bulkPricePerKg: 35,
    marketPricePerKg: 65,
    targetBulkKg: 60, // 60 kg bulk crate for Brgy. San Francisco only
    currentPooledKg: 45, // 20 kg household orders + 25 kg pantry ambag
    brgyMembersJoined: 4, // All 4 verified Brgy. San Francisco members
    pantryAmbagKg: 25, // Aling Nena (25 kg)
    ambagDonorsCount: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "batch-3",
    cropName: "Red Creole Onions",
    farmerName: "Kuya Dante Soriano",
    location: "Bongabon, Nueva Ecija",
    harvestMonth: "December 2026",
    harvestWindow: "Dec 5 – Dec 12",
    bulkPricePerKg: 68,
    marketPricePerKg: 130,
    targetBulkKg: 50, // 50 kg sack goal for Brgy. San Francisco only
    currentPooledKg: 25, // 10 kg household orders + 15 kg pantry ambag
    brgyMembersJoined: 2, // 2 of 4 verified Brgy. San Francisco members
    pantryAmbagKg: 15, // Dr. Ramon (15 kg)
    ambagDonorsCount: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
  },
];

function getCurrentUser() {
  const saved = localStorage.getItem(USER_SESSION_KEY);
  if (!saved) {
    localStorage.setItem(
      USER_SESSION_KEY,
      JSON.stringify(DEMO_ACCOUNTS["member-sf"]),
    );
    return DEMO_ACCOUNTS["member-sf"];
  }
  return JSON.parse(saved);
}

function setCurrentUserById(accountId) {
  const account = DEMO_ACCOUNTS[accountId] || DEMO_ACCOUNTS["member-sf"];
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(account));
}

function setCustomMemberUser(name, barangay) {
  const customUser = {
    id: `member-${Date.now()}`,
    role: "member",
    name,
    barangay,
    badge: "Verified Barangay Member",
  };
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(customUser));

  const members = getVerifiedMembers();
  if (!members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
    members.unshift({
      id: customUser.id,
      name,
      purok: "Newly Verified Resident",
      barangay,
      status: "Verified Resident",
      totalAmbagKg: 0,
      totalAmbagPhp: 0,
      lastContribution: "No ambag yet",
    });
    saveVerifiedMembers(members);
  }
}

function redirectUserByRole() {
  const user = getCurrentUser();
  if (user.role === "farmer") window.location.href = "farmer.html";
  else if (user.role === "barangay") window.location.href = "barangay.html";
  else window.location.href = "index.html";
}

function getHarvests() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HARVESTS));
    return INITIAL_HARVESTS;
  }
  return JSON.parse(saved);
}

function saveHarvests(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addNewHarvest(newBatch) {
  const updated = [newBatch, ...getHarvests()];
  saveHarvests(updated);
}

function getVerifiedMembers() {
  const saved = localStorage.getItem(MEMBERS_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
    return INITIAL_MEMBERS;
  }
  return JSON.parse(saved);
}

function saveVerifiedMembers(members) {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}

function recordMemberAmbag(
  memberName,
  barangay,
  cropName,
  ambagKg,
  pricePerKg,
) {
  if (ambagKg <= 0) return;
  const members = getVerifiedMembers();
  const amountPhp = ambagKg * pricePerKg;
  const existingIndex = members.findIndex(
    (m) => m.name.toLowerCase() === memberName.toLowerCase(),
  );

  if (existingIndex !== -1) {
    members[existingIndex].totalAmbagKg += ambagKg;
    members[existingIndex].totalAmbagPhp += amountPhp;
    members[existingIndex].lastContribution = `${cropName} (+${ambagKg} kg)`;
  } else {
    members.unshift({
      id: `mem-${Date.now()}`,
      name: memberName,
      purok: "Verified Resident",
      barangay: barangay || "Brgy. San Francisco, General Trias",
      status: "Verified Resident",
      totalAmbagKg: ambagKg,
      totalAmbagPhp: amountPhp,
      lastContribution: `${cropName} (+${ambagKg} kg)`,
    });
  }

  saveVerifiedMembers(members);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3500);
}

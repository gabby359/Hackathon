document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  if (user.role === "farmer") {
    document.getElementById("farmerName").value = user.name;
    document.getElementById("location").value =
      user.location || "Indang, Cavite";
    document.getElementById("farmer-account-subtitle").textContent =
      `${user.name} • ${user.location}`;
  }
});

function previewFarmerImage(event) {
  const file = event.target.files?.[0];
  const preview = document.getElementById("photo-preview");
  if (!file) {
    preview.classList.add("hidden");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function handleFarmerSubmit(event) {
  event.preventDefault();

  const fileInput = document.getElementById("cropPhoto");
  const newBatch = {
    id: `batch-${Date.now()}`,
    cropName: document.getElementById("cropName").value,
    farmerName: document.getElementById("farmerName").value,
    location: document.getElementById("location").value,
    harvestMonth: document.getElementById("harvestMonth").value,
    harvestWindow: document.getElementById("harvestWindow").value,
    bulkPricePerKg: Number(document.getElementById("bulkPrice").value),
    marketPricePerKg: Number(document.getElementById("marketPrice").value),
    targetBulkKg: Number(document.getElementById("targetKg").value),
    currentPooledKg: 0,
    brgyMembersJoined: 0,
    pantryAmbagKg: 0,
    ambagDonorsCount: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
  };

  const saveAndRedirect = (finalImageUrl) => {
    newBatch.imageUrl = finalImageUrl;
    addNewHarvest(newBatch);
    sessionStorage.setItem("justPublishedCrop", newBatch.cropName);
    window.location.href = "index.html";
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => saveAndRedirect(reader.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    saveAndRedirect(newBatch.imageUrl);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  let items = JSON.parse(localStorage.getItem("items")) || [];
  let uploadedImage = null;

  const matchesContainer = document.getElementById("matches");
  const imageInput = document.getElementById("image");
  const preview = document.getElementById("preview");

  /* IMAGE PREVIEW */
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  /* CHARACTER SIMILARITY */
  function stringSimilarity(a, b) {
    if (!a || !b) return 0;

    let matches = 0;
    const len = Math.max(a.length, b.length);

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }

    return matches / len;
  }

  /* CONFIDENCE CALCULATION */
  function calculateConfidence(a, b) {
    let score = 0;

    if (a.category === b.category) score += 0.45;
    score += stringSimilarity(a.description, b.description) * 0.35;
    score += stringSimilarity(a.location, b.location) * 0.20;

    let percent = score * 100;
    percent += Math.random() * 6 - 3; // realism
    percent = Math.max(45, Math.min(percent, 95));

    return Math.round(percent);
  }

  function getConfidenceClass(value) {
    if (value >= 81) return "high";
    if (value >= 66) return "medium";
    return "low";
  }

  /* SUBMIT */
  window.submitItem = function () {
    const item = {
      type: document.getElementById("type").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value.toLowerCase(),
      location: document.getElementById("location").value.toLowerCase(),
      contact: document.getElementById("contact").value,
      image: uploadedImage,
      time: Date.now()
    };

    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
    findMatches(item);

    document.querySelector("form").reset();
    preview.style.display = "none";
    uploadedImage = null;
  };

  /* MATCHING */
  function findMatches(newItem) {
    const opposite = newItem.type === "lost" ? "found" : "lost";
    let html = "";

    items.forEach(item => {
      if (item.type === opposite && item.category === newItem.category) {
        const confidence = calculateConfidence(newItem, item);
        if (confidence < 50) return;

        html += `
          <div class="match">
            <div class="match-content">

              ${item.image ? `
                <img src="${item.image}" class="match-image"
                     onclick="openModal('${item.image}')">
              ` : ""}

              <div class="match-info">
                <div class="match-top">
                  <strong>${item.category}</strong>
                  <span class="tag ${item.type}">${item.type}</span>
                </div>

                <p>${item.description}</p>
                <p class="location">📍 ${item.location}</p>

                <div class="confidence ${getConfidenceClass(confidence)}">
                  <div style="width:${confidence}%"></div>
                </div>
                <small>${confidence}% match confidence</small>

                <p class="contact">${item.contact}</p>
              </div>

            </div>
          </div>
        `;
      }
    });

    matchesContainer.innerHTML = html || `
      <p class="empty">
        Nothing yet.<br>
        But every report increases the chance of a return.
      </p>`;
  }

});

/* IMAGE MODAL */
window.openModal = function (src) {
  document.getElementById("modalImage").src = src;
  document.getElementById("imageModal").style.display = "flex";
};

window.closeModal = function () {
  document.getElementById("imageModal").style.display = "none";
};

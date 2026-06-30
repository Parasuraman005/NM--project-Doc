const phaseLinks = {
  "Phase -1": "Phase-1.pdf",
  "Phase -2": "Phase-2.pdf",
  "Phase -3": "Phase-3.pdf",
  "Phase -4": "Phase-4.pdf",
  "Phase -5": "Phase-5.pdf"
};

document.querySelectorAll(".phase-btn").forEach(button => {
  button.addEventListener("click", () => {
    const pdfPath = phaseLinks[button.textContent.trim()];
    if (pdfPath) {
      window.open(pdfPath, "_blank");
    } else {
      alert("PDF not found.");
    }
  });
});

function goBack() {
  if (document.referrer && document.referrer.includes(window.location.host)) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}
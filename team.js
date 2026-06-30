// Future enhancements can be added here
console.log("NM Project page loaded.");

function goBack() {
  if (document.referrer && document.referrer.includes(window.location.host)) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}
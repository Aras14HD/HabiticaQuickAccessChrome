document.addEventListener("DOMContentLoaded", function () {
  var submit = document.getElementById("submit");
  submit.addEventListener("click", function () {
    setDetails();
  });
  var clv = document.getElementById("checklist_visibility");
  clv.addEventListener("click", function () {
    chrome.storage.sync.get(["clv"], function (result) {
      if (result.clv) {
        chrome.storage.sync.set({ clv: false });
      } else chrome.storage.sync.set({ clv: true });
    });
  });
});
function setDetails() {
  var form = document.getElementById("tokens");
  form.style.display = "none";
  UserID = document.forms["tokens"]["ID"].value;
  APItoken = document.forms["tokens"]["API"].value;

  chrome.storage.sync.set({ userid: UserID }, function () {
    console.log("User ID is set to " + UserID);
  });
  chrome.storage.sync.set({ token: APItoken }, function () {
    console.log("API token is set");
  });
}

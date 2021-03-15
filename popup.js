document.addEventListener("DOMContentLoaded", function () {
  //init values
  playerUserID = "";
  playerAPItoken = "";
  chrome.storage.sync.get(["clv"], function (result) {
    if (result.clv) {
      clv = "block";
    } else clv = "none";
  });
  //read Settings
  chrome.storage.sync.get(["userid", "token", "tab"], function (result) {
    playerUserID = result.userid;
    playerAPItoken = result.token;
    tab = result.tab;
    console.log("UserID currently is " + playerUserID);
    displayData();
    update();
  });
  displayData();
  //EventListeners
  var submit = document.getElementById("submit");
  submit.addEventListener("click", function () {
    setDetails();
  });
  //tab selection
  var todo = document.getElementById("todo");
  todo.addEventListener("click", function () {
    tab = 0;
    chrome.storage.sync.set({ tab: tab }, function () {});
    displayData();
  });
  var dailies = document.getElementById("dailies");
  dailies.addEventListener("click", function () {
    tab = 1;
    chrome.storage.sync.set({ tab: tab }, function () {});
    displayData();
  });
  var habits = document.getElementById("habits");
  habits.addEventListener("click", function () {
    tab = 2;
    chrome.storage.sync.set({ tab: tab }, function () {});
    displayData();
  });
});

function update() {
  //AJAX request
  $.ajax({
    url: "https://habitica.com/api/v3/tasks/user",
    type: "GET",
    dataType: "json",
    cache: false,
    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        "x-client",
        "d2195ddc-a540-4dad-b3d5-34fb1ba8d319-HabitcaQuickAccess"
      );
      xhr.setRequestHeader("x-api-user", playerUserID);
      xhr.setRequestHeader("x-api-key", playerAPItoken);
    },
    success: function (response) {
      if (typeof response !== "undefined") {
        //convert object to array
        for (const [key, value] of Object.entries(response)) {
          if (key === "data") {
            data = value;
            console.log("received tasks");
          }
        }
        saveData(data);
      } else errorlog();
    },
  });
}
function saveData(data) {
  chrome.storage.local.set({ tasks: data }, function () {
    console.log("saved tasks");
  });
  displayData();
}
function displayData() {
  if (playerUserID == "" || playerAPItoken == "") {
    //show the form
    var form = document.getElementById("tokens");
    form.style.display = "block";
  } else {
    //hide the form
    var form = document.getElementById("tokens");
    form.style.display = "none";
    //get stored tasks
    chrome.storage.local.get(["tasks"], function (result) {
      //remove "tasks:" and convert to array
      for (const [key, value] of Object.entries(result)) {
        data = value;
      }

      html = "";
      ids = [];
      lids = [];
      lcids = [];
      switch (tab) {
        case 0:
          var title = "To Do's";
          for (i = 0; i < data.length; i++) {
            //check if the task is a todo
            for (const [key, value] of Object.entries(data[i])) {
              if (key === "type") {
                type = value;
              }
            }
            if (type == "todo") {
              checklist_o = {};
              isDue = true;
              //get the needed information out of the object
              for (const [key, value] of Object.entries(data[i])) {
                switch (key) {
                  case "text":
                    text = value;
                    break;
                  case "checklist":
                    checklist_o = value;
                    break;
                  case "id":
                    id = value;
                    break;
                  case "value":
                    health = value;
                    break;
                  case "isDue":
                    isDue = value;
                    break;
                }
              }
              if (!isDue) {
                color = "task-disabled-task";
              } else {
                if (health > 11) {
                  color = "task-";
                } else if (health > 5) {
                  color = "task-better";
                } else if (health > 0) {
                  color = "task-good";
                } else if (health == 0) {
                  color = "task-neutral";
                } else if (health > -9) {
                  color = "task-bad";
                } else if (health > -16) {
                  color = "task-worse";
                } else {
                  color = "task-worst";
                }
              }
              list = "";
              if (checklist_o.length > 0) {
                list =
                  "<div class='checklist'><button type='button' id='lbutton-" +
                  id +
                  "'>" +
                  checklist_o.length +
                  "</button><div id='list-" +
                  id +
                  "' style='display: " +
                  clv +
                  "'>";
                for (const [key, value] of Object.entries(checklist_o)) {
                  checklist = value;
                  lc = false;
                  for (const [key1, value1] of Object.entries(checklist)) {
                    switch (key1) {
                      case "text":
                        ltext = value1;
                        break;
                      case "id":
                        lid = value1;
                        break;
                      case "completed":
                        lc = value1;
                    }
                  }
                  list +=
                    "<div class='litem'><input type='checkbox' id='litem-" +
                    lid +
                    "'>" +
                    ltext +
                    "</div>";
                  lids.push(lid);
                  if (lc) lcids.push(lid);
                }
                list += "</div></div>";
              }
              //construct html
              html +=
                "<div class='task'><div class='left-control " +
                color +
                "'><div class='button' id='button-" +
                id +
                "'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 10'><path fill-rule='evenodd' d='M4.662 9.832c-.312 0-.61-.123-.831-.344L0 5.657l1.662-1.662 2.934 2.934L10.534 0l1.785 1.529-6.764 7.893a1.182 1.182 0 0 1-.848.409l-.045.001'></path></svg></div></div><div class='content'><div class='title' id='task_title'>" +
                text +
                "</div>" +
                list +
                "</div></div>";
              console.log("added task");
              ids.push(id);
            }
          }
          break;
        case 1:
          var title = "Dailies";
          for (i = 0; i < data.length; i++) {
            for (const [key, value] of Object.entries(data[i])) {
              if (key === "type") {
                type = value;
              }
            }
            if (type == "daily") {
              checklist_o = {};
              isDue = true;
              //get the needed information out of the object
              for (const [key, value] of Object.entries(data[i])) {
                switch (key) {
                  case "text":
                    text = value;
                    break;
                  case "checklist":
                    checklist_o = value;
                    break;
                  case "id":
                    id = value;
                    break;
                  case "value":
                    health = value;
                    break;
                  case "isDue":
                    isDue = value;
                    break;
                }
              }
              if (!isDue) {
                color = "task-disabled-task";
              } else {
                if (health > 11) {
                  color = "task-";
                } else if (health > 5) {
                  color = "task-better";
                } else if (health > 0) {
                  color = "task-good";
                } else if (health == 0) {
                  color = "task-neutral";
                } else if (health > -9) {
                  color = "task-bad";
                } else if (health > -16) {
                  color = "task-worse";
                } else {
                  color = "task-worst";
                }
              }
              list = "";
              if (checklist_o.length > 0) {
                //if the id were to be located after the checklist this code would break
                list =
                  "<div class='checklist'><button type='button' id='lbutton-" +
                  id +
                  "'>" +
                  checklist_o.length +
                  "</button><div id='list-" +
                  id +
                  "' style='display: " +
                  clv +
                  "'>";
                for (const [key, value] of Object.entries(checklist_o)) {
                  checklist = value;
                  lc = false;
                  for (const [key1, value1] of Object.entries(checklist)) {
                    switch (key1) {
                      case "text":
                        ltext = value1;
                        break;
                      case "id":
                        lid = value1;
                        break;
                      case "completed":
                        lc = value1;
                    }
                  }
                  list +=
                    "<div class='litem'><input type='checkbox' id='litem-" +
                    lid +
                    "'>" +
                    ltext +
                    "</div>";
                  lids.push(lid);
                  if (lc) lcids.push(lid);
                }
                list += "</div></div>";
              }
              //construct html
              html +=
                "<div class='task'><div class='left-control " +
                color +
                "'><div class='button' id='button-" +
                id +
                "'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 10'><path fill-rule='evenodd' d='M4.662 9.832c-.312 0-.61-.123-.831-.344L0 5.657l1.662-1.662 2.934 2.934L10.534 0l1.785 1.529-6.764 7.893a1.182 1.182 0 0 1-.848.409l-.045.001'></path></svg></div></div><div class='content'><div class='title' id='task_title'>" +
                text +
                "</div>" +
                list +
                "</div></div>";
              console.log("added task");
              ids.push(id);
            }
          }
          break;
        case 2:
          var title = "Habits";
          for (i = 0; i < data.length; i++) {
            for (const [key, value] of Object.entries(data[i])) {
              if (key === "type") {
                type = value;
              }
            }
            if (type == "habit") {
              checklist_o = {};
              //get the needed information out of the object
              for (const [key, value] of Object.entries(data[i])) {
                switch (key) {
                  case "text":
                    text = value;
                    break;
                  case "checklist":
                    checklist_o = value;
                    break;
                  case "id":
                    id = value;
                    break;
                  case "value":
                    health = value;
                    break;
                  case "up":
                    up = value;
                    break;
                  case "down":
                    down = value;
                    break;
                }
              }
              if (!up) {
                colorU = "task-disabled-task";
              } else {
                if (health > 11) {
                  colorU = "task-";
                } else if (health > 5) {
                  colorU = "task-better";
                } else if (health > 0) {
                  colorU = "task-good";
                } else if (health == 0) {
                  colorU = "task-neutral";
                } else if (health > -9) {
                  colorU = "task-bad";
                } else if (health > -16) {
                  colorU = "task-worse";
                } else {
                  colorU = "task-worst";
                }
              }
              if (!down) {
                colorD = "task-disabled-task";
              } else {
                if (health > 11) {
                  colorD = "task-best";
                } else if (health > 5) {
                  colorD = "task-better";
                } else if (health > 0) {
                  colorD = "task-good";
                } else if (health == 0) {
                  colorD = "task-neutral";
                } else if (health > -9) {
                  colorD = "task-bad";
                } else if (health > -16) {
                  colorD = "task-worse";
                } else {
                  colorD = "task-worst";
                }
              }
              //construct html
              html +=
                "<div class='habit'><div class='left-control " +
                colorU +
                "'><div class='habit-up' id='button-" +
                id +
                "'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path fill-rule='evenodd' d='M6 4V0H4v4H0v2h4v4h2V6h4V4H6z'></path></svg></div></div><div class='content'><div class='title' id='task_title'>" +
                text +
                "</div></div><div class='right-control " +
                colorD +
                "'><div class='habit-down' id='button-" +
                id +
                "'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 2'><path fill-rule='evenodd' d='M0 0h10v2H0z'></path></svg></div></div></div>";
              console.log("added task");
              ids.push(id);
            }
          }
      }
      document.getElementById("title").innerHTML = title;
      document.getElementById("tasks").innerHTML = html;
      console.log("changed html");
      //EventListeners for opening/closing of checklists (and in future completing tasks)
      for (i = 0; i < ids.length; i++) {
        id = ids[i];
        var lbutton = document.getElementById("lbutton-" + id);
        if (lbutton !== null) {
          lbutton.addEventListener("click", function (e) {
            var list = document.getElementById(
              e.target.id.replace("lbutton", "list")
            );
            if (list.style.display === "block") {
              list.style.display = "none";
            } else {
              list.style.display = "block";
            }
          });
        }
        //EventListeners for scoring tasks
        var button = document.getElementById("button-" + id);
        button.addEventListener("click", function (e) {
          var button = e.target.parentNode;
          id = button.id.replace("button-", "");
          switch (button.className) {
            case "button":
              direction = "up";
              break;
            case "habit-up":
              direction = "up";
              break;
            case "habit-down":
              direction = "down";
          }
          $.ajax({
            url:
              "https://habitica.com/api/v3/tasks/" + id + "/score/" + direction,
            type: "POST",
            cache: false,
            dataType: "json",
            beforeSend: function (xhr) {
              xhr.setRequestHeader(
                "x-client",
                "d2195ddc-a540-4dad-b3d5-34fb1ba8d319-HabitcaQuickAccess"
              );
              xhr.setRequestHeader("x-api-user", playerUserID);
              xhr.setRequestHeader("x-api-key", playerAPItoken);
            },
            success: function () {
              if (button.className == "button") {
                button.parentNode.parentNode.style.display = "none";
              }
              for (const [key, value] of Object.entries(response)) {
                switch (key) {
                  case "delta":
                    delta = +value.toFixed(2);
                    break;
                  case "_tmp":
                    for (const [key1, value1] of Object.entries(value)) {
                      switch (key1) {
                        case "quest":
                          for (const [key2, value2] of Object.entries(value1)) {
                            switch (key2) {
                              case "progressDelta":
                                pDelta = +value2.toFixed(2);
                                break;
                              case "collection":
                                collection = +value2.toFixed(2);
                            }
                          }
                          break;
                        case "drop":
                          drop = value1;
                      }
                    }
                }
                MpDelta = "";
                Mcollection = "";
                if (pDelta) MpDelta = ", dealt " + pDelta + " Damage";
                if (collection)
                  Mcollection = ", got " + collection + " Quest items";
                alert("You got " + delta + "Exp" + MpDelta + Mcollection);
              }
              window.setTimeout(update(), 500);
            },
          });
        });
      }

      for (i = 0; i < lcids.length; i++) {
        id = lcids[i];
        var lbutton = document.getElementById("litem-" + id);
        lbutton.checked = true;
      }
      //EventListeners for checking/unchecking checkboxes
      for (i = 0; i < lids.length; i++) {
        id = lids[i];
        var lbutton = document.getElementById("litem-" + id);
        lbutton.addEventListener("click", function (e) {
          item = document.getElementById(e.target.id);
          lid = e.target.id.replace("litem-", "");
          id = item.parentNode.parentNode.id.replace("list-", "");
          checked = item.checked;
          $.ajax({
            url:
              "https://habitica.com/api/v3/tasks/" +
              id +
              "/checklist/" +
              lid +
              "/score",
            type: "POST",
            cache: false,
            dataType: "json",
            beforeSend: function (xhr) {
              xhr.setRequestHeader(
                "x-client",
                "d2195ddc-a540-4dad-b3d5-34fb1ba8d319-HabitcaQuickAccess"
              );
              xhr.setRequestHeader("x-api-user", playerUserID);
              xhr.setRequestHeader("x-api-key", playerAPItoken);
            },
            success: (item.checked = !checked),
            error: (item.checked = checked),
          });
        });
      }
    });
  }
}
function errorlog() {
  console.log("Auth Error");
  var form = document.getElementById("tokens");
  form.style.display = "block";
}
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

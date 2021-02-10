document.addEventListener('DOMContentLoaded', function() {
  //init values
  playerUserID = "";
  playerAPItoken = "";
  tab = 0;
  //read UserID and APItoken from storage
  chrome.storage.sync.get(['userid', 'token'], function(result) {
    playerUserID = result.userid;
    playerAPItoken = result.token;
    console.log('UserID currently is ' + playerUserID);
    displayData();
    update()
  });
  displayData();
  //EventListeners
  var submit = document.getElementById('submit');
  submit.addEventListener('click', function() {
      setDetails();
  });
  //tab selection
  var todo = document.getElementById('todo');
  todo.addEventListener('click', function() {
      tab = 0
      displayData();
  });
  var dailies = document.getElementById('dailies');
  dailies.addEventListener('click', function() {
      tab = 1
      displayData();
  });
  var habits = document.getElementById('habits');
  habits.addEventListener('click', function() {
      tab = 2
      displayData();
  });
});

function update() {
  //AJAX request
  $.ajax({
    url: 'https://habitica.com/api/v3/tasks/user',
    type: 'GET',
    dataType: 'json',
    cache: false,
    beforeSend: function(xhr){
      xhr.setRequestHeader('x-client', '456b5feb-bd5c-4046-b5b3-83606a1f6a76-HabitcaQuickAccess');
      xhr.setRequestHeader('x-api-user', playerUserID);
      xhr.setRequestHeader('x-api-key',  playerAPItoken);
    },
    success: function(response) {
      if (typeof response !== 'undefined') {
        //convert object to array
        for (const [key, value] of Object.entries(response)) {
          if (key === "data") {
            data = value;
            console.log("received tasks")
          }
        }
        saveData(data)
      } else errorlog()
    }
  });
}
function saveData(data) {
  chrome.storage.local.set({tasks: data}, function() {
    console.log('saved tasks')
  });
  displayData()
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
    chrome.storage.local.get(['tasks'], function(result) {
      //remove "tasks:" and convert to array
      for (const [key, value] of Object.entries(result)) {
        data = value;
      }

      html = "";
      ids = [];
      lids = [];
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
              //get the needed information out of the object
              for (const [key, value] of Object.entries(data[i])) {
                switch (key) {
                  case "text":
                    text = value;
                    break
                  case "checklist":
                    checklist_o = value;
                    break
                  case "id":
                    id = value;
                    break
                }
              }
              list = "";
              if (checklist_o.length > 0) {
                //if the id were to be located after the checklist this code would break
                list = "<div class='checklist'><button type='button' id='lbutton-" + id + "'>" + checklist_o.length + "</button><div id='list-" + id + "' style='display: block'>";
                for (const [key, value] of Object.entries(checklist_o)) {
                  checklist = value;
                  for (const [key1, value1] of Object.entries(checklist)) {
                    switch (key1) {
                      case "text":
                        ltext = value1;
                        break;
                      case "id":
                        lid = value1;
                        break;
                      case "completed":
                        if (value1 === "false") {
                          lcompleted = ""
                        } else lcompleted = "";
                    }
                  }
                  list += "<div class='litem'><input type='checkbox' id='litem-" + lid + "'>" + ltext + "</div>"
                  lids.push(lid)
                }
                list += "</div></div>";
              }
              //construct html
              html += "<div class='task'><div class='left-control'> </div><div class='content'><div class='title' id='task_title'>" + text + "</div>" + list + "</div></div>"
              console.log("added task");
              ids.push(id);
            }
          }
          break
        case 1:
          var title = "Dailies";
          for (i = 0; i < data.length; i++) {
            for (const [key, value] of Object.entries(data[i])) {
              if (key === "type") {
                type = value;
              }
            }
            if (type == "daily") {

            }
          }
          break
        case 2:
          var title = "Habits";
          for (i = 0; i < data.length; i++) {
            for (const [key, value] of Object.entries(data[i])) {
              if (key === "type") {
                type = value;
              }
            }
            if (type == "habit") {

            }
          }
      }
      document.getElementById("title").innerHTML = title;
      document.getElementById("task").innerHTML = html;
      //EventListeners for opening/closing of checklists (and in future completing tasks)
      for (i = 0; i < ids.length; i++) {
        id = ids[i]
        var lbutton = document.getElementById("lbutton-" + id);
        if (lbutton !== null) {
          lbutton.addEventListener('click', function() {
            var list = document.getElementById(event.target.id.replace('lbutton', 'list'));
            if (list.style.display === "block") {
              list.style.display = "none";
            } else {
              list.style.display = "block"
            }
          });
        }

      }
      //EventListeners for checking/unchecking checkboxes
      for (i = 0; i < ids.length; i++) {
        id = lids[i]
        var lbutton = document.getElementById("litem-" + id);
        lbutton.addEventListener('click', function() {
          item = document.getElementById(event.target.id);
          id = event.target.id.replace('litem-', '');
          if (item.checked) {

          } else {

          }

        });
      }
    })
  }
}
function errorlog() {
  console.log('Auth Error');
  var form = document.getElementById("tokens");
  form.style.display = "block";
}
function setDetails() {
  var form = document.getElementById("tokens");
  form.style.display = "none";
  UserID = document.forms["tokens"]["ID"].value;
  APItoken = document.forms["tokens"]["API"].value;

  chrome.storage.sync.set({userid: UserID}, function() {
    console.log('User ID is set to ' + UserID)
  });
  chrome.storage.sync.set({token: APItoken}, function() {
    console.log('API token is set')
  })
}

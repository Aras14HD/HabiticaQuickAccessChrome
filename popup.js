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

      switch (tab) {
        case 0:
          var title = "To Do's";
          html = "";
          for (i = 0; i < data.length; i++) {
            //check if the task is a todo
            for (const [key, value] of Object.entries(data[i])) {
              if (key === "type") {
                type = value;
              }
            }
            if (type == "todo") {
              //get the needed information out of the object
              for (const [key, value] of Object.entries(data[i])) {
                if (key === "text") {
                  text = value;
                }
              }
              console.log("added task");
              //construct html
              html += "<div class='task'><div class='left-control'>  </div><div class='content'><div class='title' id='task_title'>" + text + "</div></div></div>"
            }
          }
          break
        case 1:
          var title = "Dailies";
          html = "";
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
          html = "";
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

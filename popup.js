playerUserID = "";
playerAPItoken = "";
//read UserID and APItoken from storage
chrome.storage.sync.get(['userid', 'token'], function(result) {
  console.log('UserID currently is ' + result.userid);
  playerUserID = result.userid;
  playerAPItoken = result.token
});
update();
document.addEventListener('DOMContentLoaded', function() {
    update();
    var link = document.getElementById('submit');
    // onClick's logic below:
    link.addEventListener('click', function() {
        setDetails();
    });
});

function update() {
  if (playerUserID == "" || playerAPItoken == "") {
    console.log("no token")
  } else {
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
          var data = response.data;
          saveData(data)
        } else errorlog()
      }
    });
  }
}
function saveData(data) {
  chrome.storage.local.set({tasks: data}, function() {
    console.log('tasks saved!')
  });
  displayData()
}
function displayData() {
  chrome.storage.local.get(['tasks'] function(result) {
    
  })
}
function errorlog() {
  console.log('Auth Error')
}
function setDetails() {
  UserID = document.forms["tokens"]["ID"].value;
  APItoken = document.forms["tokens"]["API"].value;

  chrome.storage.sync.set({userid: UserID}, function() {
    console.log('User ID is set to ' + UserID)
  });
  chrome.storage.sync.set({token: APItoken}, function() {
    console.log('API token is set')
  })
}

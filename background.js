String playerUserID = "";
String playerAPItoken = "";

setInterval(update, 300000);

function update() {
  if (playerUserID == "" || playerAPItoken == ""){
    
  } else {
    $.ajax({
      url: 'https://habitica.com/api/v3/user',
      type: 'GET',
      dataType: 'json',
      cache: false,
      beforeSend: function(xhr){
        xhr.setRequestHeader('x-client', 'd2195ddc-a540-4dad-b3d5-34fb1ba8d319-HabiticaQuickAccessChrome');
        xhr.setRequestHeader('x-api-user', playerUserID);
        xhr.setRequestHeader('x-api-key',  playerAPItoken);
      },
      success: yourFunctionToProcessTheData,
      error: yourFunctionToReportAnError,
    });

  }
}

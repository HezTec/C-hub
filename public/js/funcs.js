$(function() {
  $('#reportButton').click(function(event) {
    event.preventDefault();

    let username = $('#username').val();
    $('#reportButton').attr('disabled', 'disabled');
    //this ajax call posts the data to the backend without reloading the page
    $.ajax({
      url: "report",
      type: "POST",
      async: true,
      dataType: 'json',
      data: { reason: $('#reason').val(), comment: $('#comment').val(), username: username },
      success: function() {
        //this code below allows the button to be used more than once per page load
        // $('#button').removeAttr('disabled');
      },
      error: function() {
        console.log('ajax error');
      },
      timeout: 1
    });

    alert("report successful!");

  })
});

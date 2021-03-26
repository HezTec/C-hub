$(function() {
  $('#button').click(function(event) {
    event.preventDefault();

    let username = $('#username').val();

    //this ajax call posts the data to the backend without reloading the page
    $.ajax({
      url: username,
      type: "POST",
      data: { reason: $('#reason').val(), comment: $('#comment').val() }
    });

    alert("report successful!");

  })
});

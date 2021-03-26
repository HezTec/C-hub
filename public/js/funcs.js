$(function() {
  $('#button').click(function(event) {
    event.preventDefault();

    let username = $('#username').val();

    //this ajax call posts the data to the backend without reloading the page
    $.ajax({
      url: "report",
      type: "POST",
      data: { reason: $('#reason').val(), comment: $('#comment').val(), username: username }
    });

    alert("report successful!");

  })
});


// require('mongoose');
// const User = require('../../models/user.js');
//
//
// function deleteEntry(userID, inTitle, inLink) {
//   console.log("tit: ", inTitle);
//   console.log("lnk: ", inLink);
//   //user.urls.splice(index,1);
//
//   User.findById(userID, function(err, user) {
//     if (err) {
//       console.log(err)
//     } else {
//       // $push: {urls: { title: inTitle, url: inLink};
//       if (inTitle == null || inLink == null) {
//
//       }
//       else {
//         this.urls.pull({ title: inTitle, url: inLink });
//         this.save();
//       }
//     }
//   });
// };

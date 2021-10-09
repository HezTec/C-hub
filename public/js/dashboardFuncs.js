/*
------NOTES FOR LATER------


twitch embeds for some reason want us to enter in the current websites url
i.e. content-Hub.me so to avoid others doin all that and getting frustrated im gonna do
it for them but for some reason editing iframes that arent actual elements and and rather
are string inputs from the user es muy hard
*/

//shows the link input sections
function showURL() {
  //document.getElementById("linkForm").hidden = toggle;
  if (document.getElementById("linkForm").hidden == true) {
    document.getElementById("linkForm").hidden = false;
  } else {
    document.getElementById("linkForm").hidden = true;
  }
}

//shows the embed input secitons
function showEmbed() {
  //document.getElementById("linkForm").hidden = toggle;
  if (document.getElementById("EmbedForm").hidden == true) {
    document.getElementById("EmbedForm").hidden = false;
  } else {
    document.getElementById("EmbedForm").hidden = true;
  }
}

//hiding and revealing the editing funcitons of the dashboard
function editProf() {
  //document.getElementById("linkForm").hidden = toggle;
  if (document.getElementById("linkBtn").hidden == true) {
    document.getElementById("linkBtn").hidden = false;
    document.getElementById("EmbedBtn").hidden = false;
    var ele = document.getElementsByClassName("remove-btn"); //hiding all the delete buttons by the current links

    for (i = 0; i < ele.length; i++) {
      ele[i].hidden = false;
    }

    var move_ele = document.getElementsByClassName("move-btn"); //hiding all the move buttons by the currentl links

    for (i = 0; i < ele.length; i++) {
      move_ele[i].hidden = false;
    }

  } else {
    document.getElementById("linkBtn").hidden = true;
    document.getElementById("EmbedBtn").hidden = true;
    var ele = document.getElementsByClassName("remove-btn"); //revealing all the remove buttons

    for (i = 0; i < ele.length; i++) {
      ele[i].hidden = true;
    }

    var move_ele = document.getElementsByClassName("move-btn"); //revealing all the move buttons

    for (i = 0; i < ele.length; i++) {
      move_ele[i].hidden = true;
    }

  }
}

//shows the embeded video that is linked to the button
function showEmbedContent(id) {
  if (document.getElementById(id).hidden == true) {
    document.getElementById(id).hidden = false;
  } else {
    document.getElementById(id).hidden = true;
  }
}

/**
The move contents function below houses JS event listeners that allow objects to be dynamically
moved on the page
*/
function moveContents(movEle, elementId) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  movEle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    movEle.style.position = "absolute";
    if (e.clientY > 120) {
      movEle.style.top = (movEle.offsetTop - pos2) + "px"
    }

    movEle.style.left = (movEle.offsetLeft - pos1) + "px"

  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;

    event.preventDefault();
    let username = $('#username').val();
    let top = movEle.style.top;
    let left = movEle.style.left;
    //this ajax call posts the data to the backend without reloading the page
    $.ajax({
      url: 'moveElement',
      type: 'POST',
      async: true,
      dataType: 'json',
      data: { top: top, left: left, username: username, elementId: elementId },
      success: function() {
        console.log('success')
      },
      error: function(e) {

      },
      timeout: 1
    });
  }
}

/**
  funcitons that call to the backend
*/

//sends ID to backend to be deleted
function delLink(id) {
  $.post('/dashboard', {
    linkId: id
  });
  window.location.reload();
}

//sends ID to backend to be deleted
function delEmb(id) {
  $.post('/dashboard', {
    embID: id
  });
  window.location.reload();
}

/*
------NOTES FOR LATER------


twitch embeds for some reason want us to enter in the current websites url
i.e. content-Hub.me so to avoid others doin all that and getting frustrated im gonna do
it for them but for some reason editing iframes that arent actual elements and and rather
are string inputs from the user es muy hard
*/

let savePacket = new Map();//the array that has all of the save data of the dashboard to be sent to the backend
window.onload = load;

function load() {

  document.getElementById('saveButton').addEventListener('mouseup', () => {
    document.getElementById('saveButton').innerHTML = 'Saving...'
  });

}



/**
this function takes a string and adds a random assortment of numbers to it to create a unique ID
@param {String} stringPrefix The string that will have numbers added on to it
*/
function tempID(stringPrefix) {
  var randGenerator = Math.random().toString(36).substr(2, 10);
  return stringPrefix + '_' + randGenerator
}

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
  if (document.getElementById("embedForm").hidden == true) {
    document.getElementById("embedForm").hidden = false;
  } else {
    document.getElementById("embedForm").hidden = true;
  }
}

//hiding and revealing the editing funcitons of the dashboard
function editProf() {
  //document.getElementById("linkForm").hidden = toggle;
  if (document.getElementById("linkBtn").hidden == true) {
    document.getElementById("linkBtn").hidden = false;
    document.getElementById("EmbedBtn").hidden = false;
    document.getElementById("saveButton").hidden = false;
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
    document.getElementById("saveButton").hidden = true;
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
@param movEle the element to be moved
@param {string} id the id of the object
*/
function moveContents(movEle, id) {
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

    if (e.clientX > 0) {
      movEle.style.left = (movEle.offsetLeft - pos1) + "px"
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;

    let newPacket;//the new packet to be saved to the list of changes

    /*
    if the new packet is already in the list of changes alter that entry
    else create a new entry
    */
    if (savePacket.has(id)) {
      newPacket = savePacket.get(id);
      newPacket.top = movEle.style.top;
      newPacket.left = movEle.style.left;
    } else {
      newPacket = {
        action: 'save',
        _id: id,
        top: movEle.style.top,
        left: movEle.style.left,
        position: 'absolute'
      }
    }
    //adding the new packet to the map of changes
    savePacket.set(id, newPacket);

    //turning the savePacket map into a JSON string and saving it to the element to be posted
    let mapArray = [...savePacket.values()]
    let mapString = JSON.stringify(mapArray);
    document.getElementById('editData').value = mapString;
  }
}

/**
  funcitons that call to the backend
*/

//sends ID to backend to be deleted
function delLink(id, elementID) {

  let newPacket = {
    action: 'delete',
    _id: id
  };

  savePacket.set(id, newPacket);
  let mapArray = [...savePacket.values()];
  let mapString = JSON.stringify(mapArray);

  document.getElementById('editData').value = mapString;
  document.getElementById(elementID).parentElement.remove();


}

//sends ID to backend to be deleted
function delEmb(id) {
  $.post('/dashboard', {
    embID: id
  });
  window.location.reload();
}

/**
Method for adding a embed though an ajax call
@deprecated
*/
function ajaxAddEmbed() {
  $.ajax({
    url: '',
    type: 'POST',
    async: true,
    dataType: 'json',
    data: { embedUrl: $('#embedUrl').val(), embedTitle: $('#embedTitle').val(), user: $('#username').val() },
    success: function() {
      console.log('ajax succcess');
    },
    error: function(e) {
      console.log(e);
    },
    timeout: 1
  });
};
/**
Method for adding a link though an ajax call
@deprecated
*/
function ajaxAddLink() {
  $.ajax({
    url: '',
    type: 'POST',
    async: true,
    dataType: 'json',
    data: { LinkUrl: $('#linkUrl').val(), LinkTitle: $('#linkTitle').val(), user: $('#username').val() },
    success: function() {
      console.log('ajax succcess');
    },
    error: function(e) {
      console.log(e);
    },
    timeout: 1
  });
};

/**
This function builds out a new link button to be placed on the
client side html
*/
function clientAddLink() {

  var formCheck;

  formCheck = $('#linkTitle').val()
  if (formCheck == '') {
    alert('Enter a valid link title');
    return false;
  }

  formCheck = $('#linkUrl').val()
  if (formCheck == '') {
    alert('Enter a valid link URL');
    return false;
  }

  var temp = tempID('temp')//the temp id for the client side link

  //div with the row class so that the button can be placed in the bootstrap container
  var $newRow = $('<div></div>', {
    id: temp
  });

  //this div contains the styling data for link button placement
  var $newStyleDiv = $('<div></div>', {
    class: 'col-md-12'
  })

  //-------------------MOVE BUTTON--------------------
  //TODO: add the ablity to actually use this to move the element
  //The move button icon creation
  var $newMoveButtonIcon = $('<i class="bi bi-arrows-move" aria-hidden="true"></i>');
  //The move button for editing
  var $newMoveButton = $('<button></button>', {
    class: 'btn move-btn btn-secondary',
    onmousedown: 'moveContents(document.getElementById("' + temp + '").parentElement,"' + temp + '")'
  });

  //-------------------DELETE BUTTON------------------
  //the icon for the delete button
  var $newDeleteButtonIcon = $('<i class="fa fa-trash" aria-hidden="true"></i>')
  //the delete button to remove elements
  var $newDeleteButton = $('<button></button>', {
    class: 'btn remove-btn btn-outline-danger',
    onclick: 'document.getElementById("' + temp + '").parentElement.parentElement.remove();removeClientButton("' + temp + '")'//the client side link delete attribute
  });

  //the new button to be added
  var $newButton = $('<a></a>', {
    class: 'btn btn-primary btn-lg btn-default',
    style: 'margin: 10px; width: 75%;',
    href: $('#linkUrl').val(),
    text: $('#linkTitle').val()
  });

  var $newContainerDiv = $('<div></div>', {
    class: 'row'
  });

  //building the html structure to be added back to the webpage
  $newMoveButton.append($newMoveButtonIcon);//adding the icon to the move button
  $newStyleDiv.append($newRow);//adding the main div body to its container
  $newStyleDiv.append($newMoveButton);//adding the move button to the main div body
  $newStyleDiv.append($newButton);//adding the actaul butotn to the main div body
  $newDeleteButton.append($newDeleteButtonIcon);//adding the the delete button icon to the delete button
  $newStyleDiv.append($newDeleteButton);//adding the delte button to the main div body
  $newContainerDiv.append($newStyleDiv);//inserting the newly made button into a container
  $('#linkDiv').append($newContainerDiv);//adding the entire button to the page
  saveLinkToPacket(temp, $('#linkTitle').val(), $('#linkUrl').val(), 0, 0)
  /**
  this function takes a string and adds a random assortment of numbers to it to create a unique ID
  @param {String} stringPrefix The string that will have numbers added on to it
  */
  function tempID(stringPrefix) {
    var randGenerator = Math.random().toString(36).substr(2, 10);
    return stringPrefix + '_' + randGenerator
  }

}

function clientAddEmbed() {

  var formCheck;

  formCheck = $('#embedTitle').val()
  if (formCheck == '') {
    alert('Enter a valid embed title');
    return false;
  }

  formCheck = $('#embedUrl').val()
  if (formCheck == '') {
    alert('Enter a valid embed URL');
    return false;
  }

  var temp = tempID('temp');//creating a temporary ID to for the hidden element
  var tempEmbed = tempID('tempEmbed');

  //div with the row class so that the button can be placed in the bootstrap container
  var $newRow = $('<div></div>', {
    id: temp
  });

  //this div contains the styling data for the embed button placement
  var $newStyleDiv = $('<div></div>', {
    class: 'col-md-12',
    style: 'z-index=999;'
  });

  //-------------------MOVE BUTTON--------------------
  //The move button icon creation
  var $newMoveButtonIcon = $('<i class="bi bi-arrows-move" aria-hidden="true"></i>');
  //The move button for editing
  var $newMoveButton = $('<button></button>', {
    class: 'btn move-btn btn-secondary',
    onmousedown: 'moveContents(document.getElementById("' + temp + '").parentElement,"' + temp + '")'
  });

  //-------------------DELETE BUTTON------------------
  //the icon for the delete button
  var $newDeleteButtonIcon = $('<i class="fa fa-trash" aria-hidden="true"></i>')
  //the delete button to remove elements
  var $newDeleteButton = $('<button></button>', {
    class: 'btn remove-btn btn-outline-danger',
    onclick: 'document.getElementById("' + temp + '").parentElement.parentElement.remove();removeClientButton("' + temp + '");'//the client side link delete attribute'//the client side link delete attribute

  });

  //the new button to be added
  var $newButton = $('<a></a>', {
    class: 'btn btn-primary btn-lg btn-default',
    style: 'margin: 10px; width: 75%;',
    text: $('#embedTitle').val(),
    onclick: 'showEmbedContent("' + tempEmbed + '")'
  });

  //create a new hidden element for the new iframe embed
  var $newEmbed = $('<div hidden id="' + tempEmbed + '">' + $('#embedUrl').val() + '</div>')

  //the final div that will house the entire button
  var $newContainerDiv = $('<div></div>', {
    class: 'row'
  });
  //building the new button to add to the page
  $newMoveButton.append($newMoveButtonIcon);//adding the icon to the move button
  $newStyleDiv.append($newMoveButton);//adding the move button to the main div body
  $newStyleDiv.append($newButton);//adding the main button to the style div
  $newDeleteButton.append($newDeleteButtonIcon);//adding the the delete button icon to the delete button
  $newStyleDiv.append($newDeleteButton);//adding the delte button to the main div body
  $newRow.append($newEmbed);//adding the embed to the button
  $newStyleDiv.append($newRow);//adding the new row to the existing style div
  $newContainerDiv.append($newStyleDiv);//adding the newyly created button to a container
  $('#embedDiv').append($newContainerDiv);//adding everyting to the embed div container
  saveEmbedToPacket(temp, $('#embedTitle').val(), $('#embedUrl').val(), 0, 0);
  /**
  this function takes a string and adds a random assortment of numbers to it to create a unique ID
  @param {String} stringPrefix The string that will have numbers added on to it
  */
  function tempID(stringPrefix) {
    var randGenerator = Math.random().toString(36).substr(2, 10);
    return stringPrefix + '_' + randGenerator
  }
}

/**
creates a new entry for the save packet to send a link to the backend
@param id the id of the objec to be edited
@param title the tile of the button
@param url the url of the button to be added
@param top the top paramerter of the buttons style attribute
@param left the left paramerter of the buttons style attribute
*/
function saveLinkToPacket(id, title, url, top, left) {

  let newPacket = {
    action: 'save',
    title: title,
    url: url,
    top: top,
    left: left,
    position: 'absolute'
  };

  savePacket.set(id, newPacket);

  //turning the savePacket map into a JSON string and saving it to the element to be posted
  let mapArray = [...savePacket.values()]
  let mapString = JSON.stringify(mapArray);
  document.getElementById('editData').value = mapString;

}
/**
creates a new entry for the save packet that send a new embed to the backend
@param id the id of the objec to be edited
@param title the tile of the button
@param url the url of the button to be added
@param top the top paramerter of the buttons style attribute
@param left the left paramerter of the buttons style attribute
*/
function saveEmbedToPacket(id, title, url, top, left) {

  let newPacket = {
    action: 'save',
    embedTitle: title,
    embedUrl: url,
    top: top,
    left: left,
    position: 'absolute'
  };

  savePacket.set(id, newPacket);

  //turning the savePacket map into a JSON string and saving it to the element to be posted
  let mapArray = [...savePacket.values()]
  let mapString = JSON.stringify(mapArray);
  document.getElementById('editData').value = mapString;
}

function removeClientButton(id) {
  savePacket.delete(id);
  let mapArray = [...savePacket.values()]
  let mapString = JSON.stringify(mapArray);

  document.getElementById('editData').value = mapString;
}

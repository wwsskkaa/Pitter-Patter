$(function() {

  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var messages=$('.messages')[0];
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  var socket = io();
  var canvas=$('.whiteboard')[0];
  var ctx = canvas.getContext("2d");
  var current = {
    color: 'black'
  };
  var drawing = false;
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  canvas.addEventListener('touchstart', onTouchDown, false);
  canvas.addEventListener('touchend', onTouchUp, false);
  canvas.addEventListener('touchleave', onTouchUp, false);
  canvas.addEventListener('touchmove', throttle(onTouchMove, 10), false);
  
  window.addEventListener('resize', onResize, false);
  onResize();

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function onTouchDown(e){
    drawing = true;
    //console.log("down",current.x, current.y, e.clientX, e.clientY);
    current.x = e.changedTouches[0].clientX;
    current.y = e.changedTouches[0].clientY;
    console.log("touch",current.x,current.y);
  }

  function onTouchUp(e){
    if (!drawing) { return; }
    drawing = false;
    ctx.clearRect(e.changedTouches[0].clientX-20, e.changedTouches[0].clientY-20, 60,60);
    //drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    //console.log("up",current.x, current.y, e.clientX, e.clientY);
    socket.emit('removeentry',{
      username:username
    });
  }


  function onTouchMove(e){
    if (!drawing) { return; }
    console.log("move",e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    drawLine(current.x, current.y, e.changedTouches[0].clientX, e.changedTouches[0].clientY, current.color, true);
    //var msg=[e.clientX, e.clientY];
    //socket.emit('new catcher',msg);
    //console.log(current.x, current.y, e.clientX, e.clientY);
    current.x = e.changedTouches[0].clientX;
    current.y = e.changedTouches[0].clientY;
  }


  function onMouseDown(e){
    drawing = true;
    //console.log("down",current.x, current.y, e.clientX, e.clientY);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    ctx.clearRect(e.clientX-20, e.clientY-20, 60,60);
    //drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    //console.log("up",current.x, current.y, e.clientX, e.clientY);
    socket.emit('removeentry',{
      username:username
    });
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    //var msg=[e.clientX, e.clientY];
    //socket.emit('new catcher',msg);
    //console.log(current.x, current.y, e.clientX, e.clientY);
    current.x = e.clientX;
    current.y = e.clientY;
  }
  function drawLine(x0, y0, x1, y1, color, emit){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(x1-20,y1);
    ctx.lineTo(x1+20,y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('new catcher',{
      x1:x1/canvas.width,
      y1:y1/canvas.height,
      color:color,
      username:username
    });
  }


  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }


  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  
  

  function addParticipantsMessage (data) {
    /*var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);*/
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage;
      //.focus();

      // Tell the server your username
      socket.emit('add user', username);
      current.color=getUsernameColor(username);

    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      /*addChatMessage({
        username: username,
        message: message
      });*/
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement(data.message,$messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    /*data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);*/
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    /*
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
    */
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (str,el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    
    messages.innerHTML = str;
    /*if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }*/
    //$messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Start typing on the textfield down the page, then press return.";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });


  socket.on('returnmsgclient', function (data) {
    //console.log(data.username,username);
    if(data.username==username){
      addChatMessage({username:"",message:data.message,typing:false});
    }
      //console.log(data.sentence);}
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    //addChatMessage(data);
  });

  socket.on('catcher', function (data) {
    console.log("received: ",data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var value;
    for (var username in data) {
    value = data[username];
    ctx.beginPath();
    ctx.moveTo(value.x1*canvas.width-20,value.y1*canvas.height);
    ctx.lineTo(value.x1*canvas.width+20,value.y1*canvas.height);
    ctx.lineStyle=value.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
    }
    //addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    //log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    //log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
    //log('you have been disconnected');
  });

  socket.on('reconnect', function () {
    //log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function () {
    //log('attempt to reconnect has failed');
  });

});

// import { io } from "socket.io-client";

const socket = io();                                // Same-domain
// const socket = io("https://server-domain.com");  // when server is on diff domain

////////// Elements
const msgInput = document.getElementById('msgInput');
const infoBox = document.querySelector('.infoBox');
const infoBoxNote = document.querySelector('.infoBox .note');
const infoBoxProfile = document.querySelector('.infoBox .profile span');
const chatBox = document.querySelector('.chatBox');
const chatBoxWindow = document.querySelector('.chatBox .chatBoxWindow');
const msgBox = document.querySelector('.msgBox');
const sendMsgButton = document.querySelector('.sendMsgButton');
const setUsernameBox = document.querySelector('.setUsernameBox');
const setUsernameInp = document.querySelector('#setUsername');
const setUsernameBtn = document.querySelector('.setUsernameSubmit');
const usernameDataList = document.getElementById('usernames');

let username;
let typingTimer;
let isLoggedIn;

////////// Actions

// List any stored names on login screen
const addStoredNames = ()=>{

    const storedUsername = localStorage.getItem('username');
    if(!storedUsername || usernameDataList.querySelector('option')) return;

    const storedUsernameOpt = document.createElement('option');
    storedUsernameOpt.value = storedUsername;
    usernameDataList.insertAdjacentElement('afterbegin',storedUsernameOpt);

};

// Login
const login = ()=>{
    username = setUsernameInp.value;
    // Unhide chat contents/hide login screen
    chatBox.classList.remove('hidden');
    msgBox.classList.remove('hidden');
    setUsernameBox.classList.add('hidden');
    // Add username to screen
    infoBoxProfile.textContent = username;
    // add to localStorage
    localStorage.setItem('username', username);
    // Emit entered chat msg
    socket.emit('enteredChat', username);
    isLoggedIn = true;
};

// Send message
const  sendMsgHandler = ()=>{

    const message = msgInput.value;
    socket.emit('nottyping'); 
    socket.emit('sendMsg', { username, message } ); 
    msgInput.value = '';
    
};

// Handle stopped typing
const handleNoInput = ()=>{

    socket.emit('nottyping');

};



////////// Listeners

// Login listener
setUsernameBtn.addEventListener('click', login);
setUsernameInp.addEventListener('click', addStoredNames );
setUsernameInp.addEventListener('keyup', e => e.keyCode === 13 ? login() : 0);

// Send message listener on input
msgInput.addEventListener('keyup', function(e){
    
    const msgInputValue = msgInput.value;
    if(msgInputValue === '') return handleNoInput(); 
    if(e.keyCode === 13) return sendMsgHandler();

    // if not empty or submitted, show typing
    clearInterval(typingTimer);
    socket.emit('typing', username );
    typingTimer = setTimeout(()=>socket.emit('nottyping'),1000);
    
});

// Send message listener on button
sendMsgButton.addEventListener('click', function(){

    const msgInputValue = msgInput.value;
    if(msgInputValue === '') return handleNoInput(); 
    sendMsgHandler();
    
});


////////// Socket event Handling


socket.on('sendMsg', ( { username: msgUsername, message, time } ) => {
    const newMessage = document.createElement('div');
    const namePlate = document.createElement('span');
    const messageBubbleBox = document.createElement('div');
    const messageBubble = document.createElement('p');
    const timeBox = document.createElement('p');
    namePlate.textContent = msgUsername;
    messageBubble.textContent = message;
    timeBox.textContent = time;
    newMessage.insertAdjacentElement('afterbegin', namePlate);
    messageBubbleBox.insertAdjacentElement('beforeend', messageBubble);
    messageBubbleBox.insertAdjacentElement('beforeend', timeBox);
    newMessage.insertAdjacentElement('beforeend', messageBubbleBox);
    newMessage.classList.add('messageBox');
    if (username === msgUsername) newMessage.classList.add('myMessage');

    document.querySelector('.chatBox > div').insertAdjacentElement('beforeend', newMessage); 

    const body = document.body,
    html = document.documentElement;
    const height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

    window.scrollTo({
        top: height,
        behavior: 'smooth'
      });

});

socket.on('typing', username => {
    
    infoBoxNote.textContent = `${username} is typing...`;

});

socket.on('nottyping', sid => infoBoxNote.textContent = ``);

socket.on('enteredChat', username => { 
    if (!isLoggedIn) return;
    
    const chatNotification = document.createElement('div');
    chatNotification.classList.add('chatNotification','messageBox');
    chatNotification.textContent = `📢 ${username} has joined the chat`;
    chatBoxWindow.insertAdjacentElement('beforeend',chatNotification);

    // alert(username + ' has joined the chat!')
});


socket.on('leaving', username => {
    if (!isLoggedIn || !username) return;
    
    const chatNotification = document.createElement('div');
    chatNotification.classList.add('chatNotification','messageBox');
    chatNotification.textContent = `📢 ${username} has left the chat`;
    chatBoxWindow.insertAdjacentElement('beforeend',chatNotification);
});

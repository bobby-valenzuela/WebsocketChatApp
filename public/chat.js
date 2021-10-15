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
const activeUserListBtn = document.querySelector('.viewActiveUers');
const activeUserList = document.querySelector('.chatBoxWindow .activeUserList');
const closeActiveUserListBtn = document.querySelector('.closeActiveUserList');

let activeUsers;
let username;
let typingTimer;
let isLoggedIn;

////////// Utility functions

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
const handleNoInput = ()=> socket.emit('nottyping');

const updateActiveUsers = users => activeUsers = users;

const createChatNotification = ( note, username, users ) =>{

    if (!isLoggedIn || !username) return;
    const chatNotification = document.createElement('div');
    chatNotification.classList.add('chatNotification','messageBox');
    chatNotification.textContent = note;
    chatBoxWindow.insertAdjacentElement('beforeend',chatNotification);
    M.toast({html: note})
    updateActiveUsers(users);
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

// View active user list
activeUserListBtn.addEventListener('click', function(){

    // Clear chat list
    [...activeUserList.querySelectorAll('p')].forEach(p=>p.remove());

    for ( let [k,v] of Object.entries(activeUsers) ){

        const userRecord = document.createElement('p');
        userRecord.textContent = v;
        const icon = document.createElement('i');
        icon.classList.add('material-icons');
        icon.textContent = 'person';
        userRecord.insertAdjacentElement('afterbegin',icon);
        activeUserList.insertAdjacentElement('beforeend', userRecord);

    }

    activeUserList.classList.remove('hidden');

});

// Close active user list
closeActiveUserListBtn.addEventListener('click', ()=> activeUserList.classList.add('hidden') );


////////// Socket event Handling

socket.on('nottyping', sid => infoBoxNote.textContent = ``);
socket.on('typing', username => infoBoxNote.textContent = `${username} is typing...`);
socket.on('enteredChat', ( username, users ) => createChatNotification(`📢 ${username} has joined the chat`, username, users));
socket.on('leavingChat', ( username, users ) => createChatNotification(`📢 ${username} has left the chat`, username, users));

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


////// to do
// socket.emit('join-room','room');

// use last para as cb for some function to execute for thi soket after server action complete
// socket('send-private-msg', username, ()=> console.log('Msg Sent!'))
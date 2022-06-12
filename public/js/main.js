const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById("room-name")
const userInfo = document.getElementById("users")

//getting username and rooom from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();
//joining room
socket.emit("joinRoom", { username, room })

//get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})


//message from server
socket.on("message", message => {
    console.log(message)
    outputmessage(message);
    //scrolling down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//message submission
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    //getting message text 
    const msg = e.target.elements.msg.value;
    //emitting msg to server
    socket.emit("chatmessage", msg);
    //clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

//output message to DOM
function outputmessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div)
}

//room  info to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//users info to DOM
function outputUsers(users) {
    userInfo.innerHTML = `${users.map(user=>`<li>${user.username}</li>`).join("")}`
};
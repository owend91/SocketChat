import './App.css';
import io from 'socket.io-client'
import React, {useEffect, useState} from "react"

let socket;
const CONNECTION_PORT='http://localhost:3001/'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [room, setRoom] = useState("Class of 2020")
  const [userName, setUserName] = useState("")

  const [message, setMessage] = useState("")
  const [messageList, setMessageList] = useState([])

  useEffect(() => {
    socket = io(CONNECTION_PORT)
  }, [CONNECTION_PORT])

  useEffect(() => {
    socket.on("receive_message", data => {
      console.log(`received message: `, data)
      console.log('Before: ', messageList)
      setMessageList([...messageList, data])
      console.log('After: ', messageList)

    })
  })

  function handeNameChange(event) {
    setUserName(event.target.value)
  }

  function handleRoomChange(event) {
    setRoom(event.target.value)
  }

  function handleMessageChange(event) {
    setMessage(event.target.value)
  }

  const connectToRoom = () => {
    setLoggedIn(true)
    socket.emit('join_room', room);
  }

  const sendMessage = async () => {
    const msg = {
      room: room,
      content: {
        author: userName,
        message: message
      }
    }
    setMessage('')
    await socket.emit('send_message', msg);
    setMessageList([...messageList, msg.content])

  }

  return (
    <div className="App">
    {!loggedIn ? (
      <div className='logIn'>
        <div className='inputs'>
          <input type='text' placeholder='Name...' onChange={handeNameChange}/>
          <input type='text' placeholder='Room...' onChange={handleRoomChange}/>
        </div>
        <button onClick={connectToRoom}>Enter Chat</button>
      </div>
    ) :
    (
      <div className="chatContainer">
        <div className='messages'>
          {
            messageList.map((val, key) => {
              return (
                <div className='messageContainer' id={val.author === userName ? "You" : "Other"}>
                  <h3>{val.author} </h3>
                  <div className='messageBox'>
                     {val.message}
                  </div>
                </div>
                
              )
            })
          }
        </div>
        <div className='messageInputs'>
          <input type='text' placeholder='Message...' onChange={handleMessageChange} value={message}/>
          <button onClick={sendMessage}>Send</button>



        </div>
      </div>
    )}
      
    </div>
  );
}

export default App;

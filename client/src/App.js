import './App.css';
import io from 'socket.io-client'
import React, {useRef, useEffect, useState} from "react"


let socket;
const CONNECTION_PORT='http://localhost:3001/'

function App() {
  const messageBottom = useRef(null);
  const [loggedIn, setLoggedIn] = useState(false)
  const [room, setRoom] = useState("")
  const [connectedRoom, setConnectedRoom] = useState("")

  const [userName, setUserName] = useState("")

  const [message, setMessage] = useState("")
  const [messageList, setMessageList] = useState([])

  useEffect(() => {
    console.log('connecting...')
    socket = io(CONNECTION_PORT)
  }, [CONNECTION_PORT])

  useEffect( () => {
    // socket.on("receive_message", data => {
    //   setMessageList([...messageList, data])
    //   messageBottom.current.scrollIntoView({ behavior: 'smooth' });
    // })
    console.log('use effect...')
    socket.on("populate_chats", data => {
      console.log('room data: ', data);
      setMessageList(data)
      messageBottom.current.scrollIntoView({ behavior: 'smooth' });
      console.log('messages: ', messageList)

    })
  }, [])

  // useEffect(() => {
  //   console.log('populating room')
    
  // }, [connectedRoom])

  function handeNameChange(event) {
    setUserName(event.target.value)
  }

  function handleRoomChange(event) {
    setRoom(event.target.value)
  }

  function handleMessageChange(event) {
    setMessage(event.target.value)
  }

  const connectToRoom =  async () => {
    setLoggedIn(true)
    await socket.emit('join_room', room);
    setConnectedRoom(room)

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
    messageBottom.current.scrollIntoView({ behavior: 'smooth' });

  }

  function handleKeyPress(event) {
    if(event.key === 'Enter'){
      sendMessage()
    }
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
              console.log('val: ', val)
              return (
                <div className='messageContainer' id={val.author === userName ? "You" : "Other"}>
                  <h3>{val.author} </h3>
                  
                  <div className='messageBox'>
                     <p>{val.message}</p>
                  </div>
                </div>
                
              )
            })
          }
          <div className="messageEnd" ref={messageBottom}></div>
        </div>
        <div className='messageInputs'>
          <input type='text' placeholder='Message...' onChange={handleMessageChange} onKeyPress={handleKeyPress} value={message}/>
          <button onClick={sendMessage}>Send</button>



        </div>
      </div>
    )}
      
    </div>
  );
}

export default App;

import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { AppContext } from '../../context/AppContext'

const Chat = () => {
  const { chatData, userData } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (chatData !== null && userData) {
      setLoading(false)
    }
  }, [chatData, userData])

  return (
    <div className='chat'>
      {loading ? (
        <div className='loading-wrapper'>
          <div className='spinner'></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className='chat-container'>
          <LeftSidebar />
          <ChatBox />
          <RightSidebar />
        </div>
      )}
    </div>
  )
}

export default Chat

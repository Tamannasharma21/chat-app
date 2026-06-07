import React, { useContext, useEffect, useRef, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'

const ChatBox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollEnd = useRef()
  const typingTimeout = useRef()

  const sendMessage = async () => {
    if (!input.trim() || !messagesId) return
    try {
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          // ✅ sId is always the logged in user's id
          sId: userData.id,
          text: input.trim(),
          createdAt: new Date(),
        }),
      })

      const userIDs = [chatUser.rId, userData.id]
      userIDs.forEach(async (id) => {
        const ref = doc(db, 'chats', id)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          const idx = data.chatsData.findIndex(c => c.messageId === messagesId)
          if (idx !== -1) {
            data.chatsData[idx].lastMessage = input.trim()
            data.chatsData[idx].updatedAt = Date.now()
            if (data.chatsData[idx].rId === userData.id) {
              data.chatsData[idx].messageSeen = false
            }
            await updateDoc(ref, { chatsData: data.chatsData })
          }
        }
      })
    } catch (error) {
      toast.error(error.message)
    }
    setInput('')
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    setIsTyping(true)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1500)
  }

  // ✅ Fixed time format
  const convertTimestamp = (timestamp) => {
    const date = timestamp.toDate()
    const hour = date.getHours()
    const minute = String(date.getMinutes()).padStart(2, '0')
    if (hour >= 12) return `${hour === 12 ? 12 : hour - 12}:${minute} PM`
    return `${hour === 0 ? 12 : hour}:${minute} AM`
  }

  const getDateLabel = (timestamp) => {
    const date = timestamp.toDate()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const sendImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const fileUrl = await upload(file)
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        })
        const userIDs = [chatUser.rId, userData.id]
        userIDs.forEach(async (id) => {
          const ref = doc(db, 'chats', id)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data()
            const idx = data.chatsData.findIndex(c => c.messageId === messagesId)
            if (idx !== -1) {
              data.chatsData[idx].lastMessage = '📷 Image'
              data.chatsData[idx].updatedAt = Date.now()
              await updateDoc(ref, { chatsData: data.chatsData })
            }
          }
        })
      }
    } catch (error) {
      toast.error(error.message)
    }
    e.target.value = ''
  }

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse())
      })
      return () => unSub()
    }
  }, [messagesId])

  const isOnline = chatUser && Date.now() - chatUser.userData?.lastSeen <= 70000

  // ✅ Group messages by date
  const groupedMessages = []
  let lastDate = null
  const reversed = [...messages].reverse()
  reversed.forEach((msg) => {
    const dateLabel = getDateLabel(msg.createdAt)
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: 'divider', label: dateLabel })
      lastDate = dateLabel
    }
    groupedMessages.push({ type: 'msg', ...msg })
  })

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? '' : 'hidden'}`}>

      {/* Header */}
      <div className='chat-user'>
        <img
          src={chatUser.userData?.avatar || assets.profile_img}
          alt='avatar'
        />
        <div className='chat-user-details'>
          <p className='chat-user-name'>
            {chatUser.userData?.name}
            {isOnline
              ? <img className='dot' src={assets.green_dot} alt='online' />
              : null}
          </p>
          <span className={`chat-user-status ${!isOnline ? 'offline' : ''}`}>
            {isTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <img
          onClick={() => setChatVisible(false)}
          className='arrow'
          src={assets.arrow_icon}
          alt='back'
        />
      </div>

      {/* Messages */}
      <div className='chat-msg'>
        <div ref={scrollEnd}></div>

        {/* Typing indicator */}
        {isTyping && (
          <div className='r-msg typing-row'>
            <div className='typing-bubble'>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {groupedMessages.map((item, index) => {
          // Date divider
          if (item.type === 'divider') return (
            <div key={`d-${index}`} className='date-divider'>
              <span>{item.label}</span>
            </div>
          )

          // ✅ KEY FIX: compare sId with userData.id to determine sent/received
          
const isSent = item.sId === userData?.id

          return (
            <div key={index} className={isSent ? 's-msg' : 'r-msg'}>
              {item.image
                ? <img className='msg-img' src={item.image} alt='shared' />
                : <p className='msg'>{item.text}</p>
              }
              <div className='msg-meta'>
                <img
                  src={
                    isSent
                      ? userData?.avatar || assets.avatar_icon
                      : chatUser.userData?.avatar || assets.avatar_icon
                  }
                  alt=''
                />
                <p>
                  {convertTimestamp(item.createdAt)}
                  {isSent ? ' ✓✓' : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className='chat-input'>
        <div className='chat-input-field'>
          <input
            onKeyDown={(e) => e.key === 'Enter' ? sendMessage() : null}
            onChange={handleInputChange}
            value={input}
            type='text'
            placeholder='Type a message...'
          />
          <input
            onChange={sendImage}
            type='file'
            id='image'
            accept='image/png,image/jpeg'
            hidden
          />
          <label htmlFor='image' className='attach-btn' title='Send image'>
            <img src={assets.gallery_icon} alt='gallery' />
          </label>
        </div>
        <button className='send-btn' onClick={sendMessage} title='Send'>
          <img src={assets.send_button} alt='send' />
        </button>
      </div>
    </div>

  ) : (
    <div className={`chat-welcome ${chatVisible ? '' : 'hidden'}`}>
      <div className='welcome-icon'>
        <img src={assets.logo_icon} alt='logo' />
      </div>
      <p>Chat anytime, anywhere</p>
      <span>Select a conversation from the left to start messaging</span>
    </div>
  )
}

export default ChatBox
import React, { useContext, useEffect, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { db, logout } from '../../config/firebase'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const LeftSidebar = () => {
  const {
    chatData,
    userData,
    chatUser,
    setChatUser,
    setMessagesId,
    messagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext)

  const [user, setUser] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()

  // ✅ Fixed: setChat defined BEFORE addChat so it can be called inside it
  const setChat = async (item) => {
    setMessagesId(item.messageId)
    setChatUser(item)
    try {
      const userChatsRef = doc(db, 'chats', userData.id)
      const userChatsSnapshot = await getDoc(userChatsRef)
      const userChatsData = userChatsSnapshot.data()
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      )
      if (chatIndex !== -1) {
        userChatsData.chatsData[chatIndex].messageSeen = true
        await updateDoc(userChatsRef, { chatsData: userChatsData.chatsData })
      }
    } catch (error) {
      toast.error(error.message)
    }
    setChatVisible(true)
  }

  const inputHandler = async (e) => {
    try {
      const input = e.target.value
      if (input) {
        setShowSearch(true)
        const userRef = collection(db, 'users')
        const q = query(userRef, where('username', '==', input.toLowerCase()))
        const querySnap = await getDocs(q)
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const foundUser = querySnap.docs[0].data()
          const alreadyExists = chatData?.some((c) => c.rId === foundUser.id)
          setUser(alreadyExists ? null : foundUser)
        } else {
          setUser(null)
        }
      } else {
        setShowSearch(false)
        setUser(null)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addChat = async () => {
    const messagesRef = collection(db, 'messages')
    const chatsRef = collection(db, 'chats')
    try {
      const newMessageRef = doc(messagesRef)
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      })

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: '',
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      })

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: '',
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      })

      const uSnap = await getDoc(doc(db, 'users', user.id))
      // ✅ Now setChat is defined above, so this works correctly
      await setChat({
        messageId: newMessageRef.id,
        lastMessage: '',
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uSnap.data(),
      })
      setShowSearch(false)
      setUser(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, 'users', chatUser.userData.id)
        const userSnap = await getDoc(userRef)
        setChatUser((prev) => ({ ...prev, userData: userSnap.data() }))
      }
    }
    updateChatUserData()
  }, [chatData])

  return (
    <div className={`ls ${chatVisible ? 'hidden' : ''}`}>
      <div className='ls-top'>
        <div className='ls-nav'>
          <img className='logo' src={assets.logo} alt='logo' />
          <div className='menu'>
            <img src={assets.menu_icon} alt='menu' />
            <div className='sub-menu'>
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p onClick={() => logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className='ls-search'>
          <img src={assets.search_icon} alt='search' />
          <input onChange={inputHandler} type='text' placeholder='Search users...' />
        </div>
      </div>
      <div className='ls-list'>
        {showSearch && user ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar || assets.avatar_icon} alt='' />
            <div>
              <p>{user.name || user.username}</p>
              <span>Click to start chat</span>
            </div>
          </div>
        ) : chatData && chatData.length > 0 ? (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId ? '' : 'border'
              }`}
            >
              <img src={item.userData?.avatar || assets.avatar_icon} alt='' />
              <div>
                <p>{item.userData?.name}</p>
                <span>{item.lastMessage?.slice(0, 30) || 'No messages yet'}</span>
              </div>
            </div>
          ))
        ) : (
          <p className='no-chats'>Search for users to start chatting</p>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar

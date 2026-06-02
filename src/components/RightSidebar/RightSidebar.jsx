import React, { useContext, useEffect, useState } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext)
  const [msgImages, setMsgImages] = useState([])

  useEffect(() => {
    const images = messages.filter((msg) => msg.image).map((msg) => msg.image)
    setMsgImages(images)
  }, [messages])

  return chatUser ? (
    <div className='rs'>
      <div className='rs-profile'>
        <img src={chatUser.userData?.avatar || assets.avatar_icon} alt='profile' />
        <h3>
          {Date.now() - chatUser.userData?.lastSeen <= 70000 ? (
            <img className='dot' src={assets.green_dot} alt='online' />
          ) : null}
          {chatUser.userData?.name}
        </h3>
        <p>{chatUser.userData?.bio}</p>
      </div>
      <hr />
      <div className='rs-media'>
        <p>Shared Media</p>
        <div>
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <img
                onClick={() => window.open(url)}
                key={index}
                src={url}
                alt='media'
              />
            ))
          ) : (
            <p className='no-media'>No media shared yet</p>
          )}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default RightSidebar

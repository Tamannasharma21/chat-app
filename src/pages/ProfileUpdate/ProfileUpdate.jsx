import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import upload from '../../lib/upload'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'

const ProfileUpdate = () => {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [uid, setUid] = useState('')
  const [prevImage, setPrevImage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUserData } = useContext(AppContext)

  const profileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const docRef = doc(db, 'users', uid)
      if (image) {
        const imgUrl = await upload(image)
        setPrevImage(imgUrl)
        await updateDoc(docRef, { avatar: imgUrl, bio, name })
      } else {
        await updateDoc(docRef, { bio, name, avatar: prevImage || '' })
      }
      const snap = await getDoc(docRef)
      setUserData(snap.data())
      toast.success('Profile updated!')
      navigate('/chat')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        const data = docSnap.data()
        if (data.name) setName(data.name)
        if (data.bio) setBio(data.bio)
        if (data.avatar) setPrevImage(data.avatar)
      } else { navigate('/') }
    })
    return () => unSub()
  }, [])

  return (
    <div className='profile'>
      <div className='profile-container'>
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor='avatar'>
            <input onChange={(e) => setImage(e.target.files[0])} id='avatar'
              type='file' accept='.png,.jpg,.jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) : assets.avatar_icon} alt='avatar' />
            Click to upload photo
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name}
            placeholder='Your display name' type='text' required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio}
            placeholder='Write a short bio...' required />
          <button type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
        <div className='profile-preview-panel'>
          <span className='preview-label'>Preview</span>
          <img className='profile-pic'
            src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon}
            alt='preview' />
        </div>
      </div>
    </div>
  )
}

export default ProfileUpdate
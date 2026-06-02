import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase'

const Login = () => {
  const [currState, setCurrState] = useState('Sign up')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = (e) => {
    e.preventDefault()
    if (currState === 'Sign up') signup(userName, email, password)
    else login(email, password)
  }

  return (
    <div className='login'>
      <div className='login-inner'>
        <div className='login-brand'>
          <img className='logo' src={assets.logo_big} alt='Chatapp' />
          <div className='login-brand-text'>
            <h1>Connect with<br />everyone.</h1>
            <p>Fast, private, and beautifully simple.</p>
          </div>
        </div>
        <form onSubmit={onSubmitHandler} className='login-form-wrap'>
          <h2>{currState}</h2>
          {currState === 'Sign up' && (
            <input onChange={(e) => setUserName(e.target.value)} value={userName}
              className='form-input' type='text' placeholder='Username' required />
          )}
          <input onChange={(e) => setEmail(e.target.value)} value={email}
            className='form-input' type='email' placeholder='Email address' required />
          <input onChange={(e) => setPassword(e.target.value)} value={password}
            className='form-input' type='password' placeholder='Password' required />
          <button type='submit'>
            {currState === 'Sign up' ? 'Create Account' : 'Login Now'}
          </button>
          <div className='login-term'>
            <input type='checkbox' required />
            <p>Agree to the terms of use &amp; privacy policy.</p>
          </div>
          <div className='login-divider' />
          <div className='login-forgot'>
            {currState === 'Sign up' ? (
              <p className='login-toggle'>Already have an account?{' '}
                <span onClick={() => setCurrState('Login')}>Login here</span></p>
            ) : (
              <p className='login-toggle'>Don't have an account?{' '}
                <span onClick={() => setCurrState('Sign up')}>Sign up</span></p>
            )}
            {currState === 'Login' && (
              <p className='login-toggle'>Forgot password?{' '}
                <span onClick={() => resetPass(email)}>Click here</span></p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'
import assets from '../assets/assets'

function LoginPage() {

  const { googleLogin } = useContext(AuthContext)

  useEffect(() => {
    const script = document.createElement("script")

    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: async (response) => {
          await googleLogin(response.credential)
        },
      })

      window.google.accounts.id.renderButton(
        document.getElementById("google-login"),
        {
          theme: "outline",
          size: "large",
          width: 350,
          text: "continue_with",
        }
      )
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [googleLogin])

  return (

    <div className='min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden px-4 py-8'>

      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-500/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>


      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center gap-12 lg:gap-24 max-md:flex-col">

        {/* ------- Left ------- */}

        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">

          <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_45px_rgba(20,184,166,0.4)] rotate-3 backdrop-blur-xl">
            <img src={assets.favicon} alt="Neighbourr" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(20,184,166,0.65)]" />
          </div>

          <div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-tight">

              Welcome to <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                Neighbourr
              </span>

            </h1>

            <p className="mt-4 text-gray-400 font-sans text-lg max-w-md">
              Connect with your community. Experience messaging reimagined.
            </p>

          </div>

        </div>


        {/* ------- Right ------- */}

        <div className='glass-panel p-8 sm:p-10 w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden'>

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-purple-500"></div>


          <div className='flex flex-col items-center gap-6 relative z-10'>

            <h2 className='font-heading font-semibold text-3xl text-white'>
              Login / Sign Up
            </h2>


            <p className="text-gray-400 text-center font-sans">
              Continue with your Google account to get started.
            </p>


            {/* Google Login */}
            <div
              id="google-login"
              className="flex justify-center mt-3"
            ></div>


            <p className="text-xs text-gray-500 text-center mt-2">
              By continuing, you agree to our Terms of Use & Privacy Policy.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default LoginPage
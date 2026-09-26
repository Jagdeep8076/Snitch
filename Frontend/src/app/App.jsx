import { RouterProvider } from 'react-router-dom'
import router from './app.routes'
import "./App.css"
import { useSelector } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth.js'
import { useEffect } from 'react'

function App() {

const { handleGetMe } = useAuth()

  const user = useSelector(state =>state.auth.user)
console.log(user)

useEffect(() =>{
  handleGetMe()
}, [])

  return (
    <>
   <RouterProvider router={router} />
   </>
  )
}

export default App

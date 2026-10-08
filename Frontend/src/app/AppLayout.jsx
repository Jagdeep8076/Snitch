import React from 'react'
import Nav from '../features/Shared/Components/Nav'
import { Outlet } from 'react-router-dom'


const AppLayout = () => {
  return (
    <>
     <Nav />
     <Outlet />
    </>
  )
}

export default AppLayout

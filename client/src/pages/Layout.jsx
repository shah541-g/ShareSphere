import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'
import { useState } from 'react'


const Layout = () => {
  const user = useSelector((state)=>state.user.value)
  const [sidebarOpen,setSidebarOpen] = useState(false)
  return user ? (
    <div className='w-full flex h-screen relative'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 w-[100%] bg-slate-50">
        <Outlet />
      </div>
      {
        sidebarOpen ?
        <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(prev => !prev)}/>
        :
        <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(prev => !prev)}/>
      }
    </div>
  ) : (
    <Loading />
  )
}

export default Layout

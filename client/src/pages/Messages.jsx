import React from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Messages = () => {
  const navigate = useNavigate()
  const {connections} = useSelector((state)=>state.connections)
  return (
    <div className='h-full overflow-y-scroll no-scrollbar min-h-screen relative bg-slate-50 '>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Messages
          </h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected Users */}
        <div className="flex flex-col gap-3">
          {connections.map((user)=>(
            <div key={user._id} className='flex flex-col flex-wrap gap-5 p-6 bg-white shadow rounded-md'>
            <div className='flex-1 flex'>
            <img className='rounded-full size-12' src={user.profile_picture} alt="" />
            <div className="flex flex-col">
              <p className='pl-1 font-medium text-slate-700'>{user.full_name}</p>
              <p className='pl-1 text-slate-500'>@{user.username}</p>
              </div>
            </div>
              <p className='text-sm text-gray-600'>{user.bio}</p>
            <div className="flex flex-row justify-end gap-2 mt-4">
              <button onClick={() => {
                const userId = user._id
                navigate(`/messages/${userId}`)}} className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1'>
                <MessageSquare className='w-4 h-4'/>
              </button>
              <button onClick={() => navigate(`/profile/${user._id}`)} className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
                <Eye className='w-4 h-4'/>
              </button>
            </div>
          </div>))}
        </div>
      </div>
      
    </div>
  )
}

export default Messages

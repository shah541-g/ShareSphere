import React, { useState } from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import SearchInput from '../components/SearchInput'

const Discover = () => {

  const [input, setInput ] = useState('')
  const [users, setUsers ] = useState(dummyConnectionsData)
  const [loading, setLoading ] = useState(false)

  const handleSearch = async(e) => {
    if(e.key==='Enter'){
      setUsers([])
      setLoading(prev => !prev)
      setTimeout(() => {
        setUsers(dummyConnectionsData);
        setLoading(prev => !prev)
    },1000)
    }
  }

  return (
    <div className='h-full width-layout overflow-y-scroll no-scrollbar min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>
          <p className="text-slate-600">Connect with amazing people and grow your network</p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
            <SearchInput setInput={setInput} input={input} handleSearch={handleSearch}/>
          </div>
        </div>

        {/* Users */}
        <div className='flex justify-center flex-wrap gap-6 px-6'>
          {
            users.map((user)=>(
              <UserCard user={user} key={user._id} />
            ))
          }
        </div>

        {
          loading && (<Loading height='60vh'/>)
        }
      </div>
      
  )
}

export default Discover

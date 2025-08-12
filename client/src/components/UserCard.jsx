import React from "react";
import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { fetchUser } from "../features/user/userSlice";
import toast from "react-hot-toast";

const UserCard = ({ user }) => {
  const currentUser =  useSelector((state)=>state.user.value);
  const {getToken} = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleFollow = async (e) => {
    try {
      const {data} = await api.post('/api/user/follow', {
        id: user._id
      }, {
        headers : {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchUser(await getToken()))
      }else{
        toast.error(data.message)
      }
    } catch (error) {
        toast.error(error.message)
      
    }
  };
  const handleConnectionRequest = async () => {
    if(currentUser.connections.includes(user._id)){
      return navigate('/messages/' + user._id)
    }
    try {
      const {data} = await api.post('/api/user/connect', {
        id: user._id
      }, {
        headers : {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if(data.success){
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };
  return (
    <div
      key={user._id}
      className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md"
    >
      <div className="text-center">
        <img className="rounded-full w-16 shadow-md mx-auto" src={user.profile_picture} alt="" />
        <p className="mt-4 font-semibold">{user.full_name}</p>
        {
          user.username && <p className="text-gray-500 font-light">@{user.username}</p>
        }
        {
          user.bio && <p className="text-gray-600 mt-2 text-center text-sm px-4">@{user.bio}</p>
        }
      </div>

      <div className="flex pills-layout items-center gap-2 mt-4 text-xs justify-center text-gray-600">
        <div className="flex items-center gap-1 border border-gray-3900 rounded-full px-3 py-1">
          <MapPin className="w-4 h-4"/>
          {user.location}
        </div>
        <div className="flex items-center gap-1 border border-gray-3900 rounded-full px-3 py-1">
          <span>{user.followers.length}</span> Followers
        </div>
      </div>


        <div className="flex mt-4 gap-2">
          {/* Follow Button */}
          <button disabled={ currentUser.following.includes(user._id)} onClick={handleFollow} className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer">
            <UserPlus className="w-4 h-4"/> {currentUser?.following.includes(user._id) ? 'Following' : 'Follow'}
          </button>

          {/* Connection Request button / Message Button */}
          <button onClick={handleConnectionRequest} className="flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition">
            {
              currentUser?.connections.includes(user._id) ? <MessageCircle  className="w-5 h-5 group-hover:scale-105 transition"/> : <Plus  className="w-5 h-5 group-hover:scale-105 transition"/>
            }
          </button>
        </div>

    </div>
  );
};

export default UserCard;

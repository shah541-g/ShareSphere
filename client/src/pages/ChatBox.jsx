import { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { addMessage, fetchMessages, resetMessage } from "../features/messages/messagesSlice";
import toast from "react-hot-toast";

const ChatBox = () => {
  const {messages} = useSelector((state)=>state.messages);
  const {userId} = useParams()
  const {getToken} = useAuth()
  const dispatch = useDispatch()


  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const connections = useSelector((state)=>state.connections.connections)

  const messagesEndRef = useRef(null);

  const fetchUserMessages = async () => {
    try {
      const token = await getToken()
      dispatch(fetchMessages({token, userId}))
    } catch (error) {
      toast.error(error.message)
    }
  }




  const sendMessage = async () => {
    try {
      if(!text && !image){
        return
      }
      const token = await getToken()
      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text', text)
      image && formData.append('image', image)

      const {data} = await api.post('/api/message/send', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(data.success){
        setText('')
        setImage(null)
        dispatch(addMessage(data.message))
      } else{
        throw new Error (data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(()=>{
    fetchUserMessages()
    return ()=> {
      dispatch(resetMessage())
    }
  },[userId])

  useEffect(()=>{
    if(connections.length > 0){
      const user = connections.find(connection=> connection._id === userId)
      console.log(connections, userId);

      setUser(user)
    }
  },[connections, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    user ? (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-2 md:px-10 bg-gradientt-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
          <img
            src={user.profile_picture}
            className="size-8 rounded-full"
            alt=""
          />
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
          </div>
        </div>

        <div className="p-5 md:px-10 h-full overflow-y-scroll no-scrollbar">
          <div className="space-y-4">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.to_user_id !== user._id
                      ? "items-start"
                      : "items-end"
                  }`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm  text-slate-700 rounded-lg shadow ${
                      message.to_user_id !== user._id
                        ? "rounded-bl-none bg-white"
                        : "rounded-br-none bg-gradient-to-r from-emerald-600 to-emerald-900 text-white"
                    }`}
                  >
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        className="w-full max-w-sm rounded-lg mb-1"
                        alt=""
                      />
                    )}
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-5 p-1.5 bg-white w-full max-w-full mx-auto border border-gray-200 shadow rounded-full mb-5">
            <input
              type="text"
              className="flex-1 min-w-0 outline-none text-slate-700"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key == "Enter" && sendMessage()}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
            <label htmlFor="image" className="flex-shrink-0">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  className="h-8 rounded"
                  alt=""
                />
              ) : (
                <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
            <button
              onClick={sendMessage}
              className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    ) : <p>User hi nahi ha</p>
  );
};

export default ChatBox;

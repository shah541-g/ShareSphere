

import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import Message from '../models/Message.js'
import { error } from 'console'
// Create an empty object to store Server Side Event Connections
const connections = {}

// Controller function for the Server Side Endpoint
export const ssController = (req,res) => {
  const {userId} = req.params
  console.log('New Client Connected: ', userId)

  // Set Server Side headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add the client's response object to the connection object
  connections[userId] = res

  // Send an initla event to the client
  res.write('log: Connected to Server Side Stream\n\n')

  // Handle client disconnection
  req.on('close', ()=> {
    // Remove the Client's Response object from the connections array
    delete connections[userId]
    console.log('Client disconnected')
  })

  
}

// Send Message

export const sendMessage = async(req,res) => {
  try {
    const {userId} = req.auth()
    const {to_user_id,text} = req.body
    const image = req.file

    let media_url = ''
    let message_type = image ? 'image' : 'text'
    if(message_type === 'image') {
      const fileBuffer = fs.readFileSync(image.path)
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });
      media_url = imagekit.url({
        path:response.filePath,
        transformation: [
          {quality:'auto'},
          {format:'webp'},
          {width:'1280'}
        ]
      })
    } 

    const message = await Message.create({
      from_user_id:userId,
      to_user_id,
      text,
      message_type,
      media_url
    })

    res.json({
      success:true,
      message
    })

    // Send message to to_user_id using Server Side Event
    const messageWithUserData = await Message.findById(message._id).populate('from_user_id')

    if(connections[to_user_id]){
      connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
    }
  } catch (error) {
    console.log(error)
    res.json({
      success:false,
      message: error.message
    })
  }
}

// Get Chat Messages 
export const getChatMessages = async (req,res) => {
  try {
    const {userId} = req.auth()
    const { to_user_id} = req.body
    const messages = await Message.find({
      $or: [
        {from_user_id: userId, to_user_id},
        {from_user_id: to_user_id, userId}
      ]
    }).sort({
      createdAt: -1
    })
    // mark message asseen
    await Message.updateMany({
      from_user_id: to_user_id, to_user_id: userId
    }, {seen: true})
    res.json({
      success:true,
      messages
    })
  } catch (error) {
  res.json({
    success:true,
    message: error.message
  })
    
  }
}

export const getUserRecentMessages =  async (req,res) => {
  try {
    const {userId} = req.auth()
    const messages = await Message.find({
      to_user_id: userId
    }).populate('from_user_id to_user_id').sort({
      createdAt: -1
    })
        res.json({
      success:true,
      messages
    })
  } catch (error) {  
    res.json({
    success:true,
    message: error.message
  })
  }
  
}
import imagekit from "../configs/imagekit.js"
import fs from 'fs'
import User from "../models/User.js"
import Connection from "../models/Connection.js"


// Get user data using user id

export const getUserData = async (req,res) => {
  try {
      const { userId } = await req.auth()
      const user = await User.findById(userId)
      if(!user){
        return res.json({
          success:false, 
          message: "User not found"
        })
      }
      res.json({
        success:true, user
      })
  } catch (error) {
    console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}

// Update User Data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    // If no new username, keep old one
    if (!username) username = tempUser.username;

    // If username is changing, check if it's taken
    if (username !== tempUser.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.json({
          success: false,
          message: "Username already taken"
        });
      }
    }

    const updatedUser = {
      username: username || tempUser.username,
      bio: bio || tempUser.bio,
      location: location || tempUser.location,
      full_name: full_name || tempUser.full_name,
      profile_picture: tempUser.profile_picture,
      cover_photo: tempUser.cover_photo
    };

    // Profile picture
    const profile = req.files?.profile?.[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      updatedUser.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: '512' }
        ]
      });
    }

    // Cover photo
    const cover = req.files?.cover?.[0];
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      updatedUser.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: '1280' }
        ]
      });
    }

    const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

    res.json({
      success: true,
      user,
      message: "Profile Updated Successfully"
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};



// Find user using username, email, location and name


export const discoverUsers = async (req,res) => {
  try {
      const { userId } = await req.auth()
      const {input} = req.body;

      const allUsers = await User.find(
        {
          $or: [
            {username: new RegExp(input, 'i')},
            {email: new RegExp(input, 'i')},
            {full_name: new RegExp(input, 'i')},
            {location: new RegExp(input, 'i')},
          ]
        }
      )
      const filteredUsers = allUsers.filter(user=> user._id!== userId)

      res.json({
        success: true,
        users: filteredUsers
      })
  } catch (error) {
    console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}



// Follow User


export const followUser = async (req,res) => {
  try {
      const { userId } = await req.auth()
      const {id} = req.body;

      const user = await User.findById(userId)

      if(user.following.includes(id)){
        return res.json({
          success: false,
          message: "You are already following this user"
        })

      }

      user.following.push(id);
      await user.save();

      const toUser = await User.findById(id)
      toUser.followers.push(userId)
      await toUser.save()

      res.json({
        success: true,
        message: "Now you are following this user"
      })
  } catch (error) {
    console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}


// UnFollow User


export const unFollowUser = async (req,res) => {
  try {
      const { userId } = await req.auth()
      const {id} = req.body;

      const user = await User.findById(userId)
      user.following = user.following.filter(user=> user!==id);

      await user.save()

      const toUser = await User.findById(id)
      toUser.followers = toUser.followers.filter(user=>user!==userId)
      await toUser.save()

      res.json({
        success: true,
        message: "You are no longer following this user"
      })
  } catch (error) {
    console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}

// Send Connection Request

export const sendConnectionRequest = async(req,res) => {
  try {
    const {userId} = await req.auth();
    const {id} = req.body;

    // Check if user has sent more than 20 requests in last 24 hours
    const last24Hours = new Date(Date.now() * 24 * 60 * 60 * 1000)
    const connectionRequests = await Connection.find({from_user_id: userId, created_at: { $gt: last24Hours}})
    if(connectionRequests.length >= 20){
      return res.json({
        success: false,
        message: "You have already sent more than 20 connection request in the last 24 hours"
      })
    }

    // Check if user is already connected
    const connection = await Connection.findOne({
      $or: [
        {from_user_id: userId, to_user_id: id},
        {from_user_id: id, to_user_id: userId},
      ]
    })

    if(!connection){
      await Connection.create({from_user_id: userId,
        to_user_id: id
      })
      return res.json({
        success: true,
        message: "Connection Request Sent Succesfully"
      })

    }else if(connection && connection.status === 'accepted'){
      return res.json({
        success: false,
        message: "You are already connected with this user"
      })
    }

    return res.json({
      status: false,
      message: "Connection request pending"
    })
  } catch (error) {
        console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}


// Get User Connections

export const getUserConnections = async(req,res) => {
  try {
    const {userId} = await req.auth()
    const user = await User.findById(userId).populate('connections followers following')

    const connections = user.connections
    const followers = user.followers
    const following = user.following

    const pendingConnections = (await Connection.find({to_user_id:userId, status:'pending'}).populate('from_user_id')).map((connection)=>(connection.from_user_id))

    res.json({
      success:true,
      connections,
      followers,
      following,
      pendingConnections
    })
  } catch (error) {
        console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}

// Accept the Connection Request

export const acceptConnectionRequest = async(req,res) => {
  try {
    const {userId} = await req.auth()
    const {id} = req.body;

    const connection = await Connection.findOne({from_user_id:id, to_user_id: userId})

    if(!connection){
      return res.json({
        success:false,
        message: 'Connection not found'
      })
    }

    const user = await User.findById(userId)
    user.connections.push(id)
    await user.save()

    const toUser = await User.findById(id)
    toUser.connections.push(userId)
    await toUser.save()

    connection.status = 'accepted'
    await connection.save()

    res.json({
      success: true,
      message: "Connection Accepted Succesfully"
    })

    
  } catch (error) {
        console.log(error)
    res.json({
      success:false, 
      message: error.message
    })
  }
}
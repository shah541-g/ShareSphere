import express from 'express'
import { getChatMessages, markMessagesSeen, sendMessage, ssController } from '../controllers/messageController.js'
import { upload } from '../configs/multer.js'
import { protect } from '../middlewares/auth.js'

const messageRouter = express.Router()

messageRouter.get('/:userId', ssController)
messageRouter.post('/send', upload.single('image'), protect, sendMessage)
messageRouter.post('/get', protect, getChatMessages)
messageRouter.post("/seen", protect, markMessagesSeen);


export default messageRouter
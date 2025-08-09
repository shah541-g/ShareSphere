import { Inngest } from "inngest";
import connectDB from "../configs/db.js";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "sharesphere" });

const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    await connectDB(); // ✅ ensure DB connected inside handler

    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    let username = email_addresses[0].email_address.split('@')[0];

    const user = await User.findOne({ username });
    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username
    };

    await User.create(userData);
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    await connectDB(); // ✅ here too

    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const updatedUserData = {
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url
    };
    await User.findByIdAndUpdate(id, updatedUserData);
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-from-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    await connectDB(); // ✅ here too

    const { id } = event.data; // fix: `event.data` not `event.delete`
    await User.findByIdAndDelete(id);
  }
);

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];

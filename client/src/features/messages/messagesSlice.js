import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  messages: [],
};

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }) => {
    const { data } = await api.post(
      "/api/message/get",
      {
        to_user_id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data.success ? data : null;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    markSeen: (state, action) => {
      const to_user_id = action.payload;
      state.messages = state.messages.map((msg) =>
        msg.to_user_id === to_user_id ? { ...msg, seen: true } : msg
      );
    },

    resetMessage: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      if (action.payload) {
        state.messages = action.payload.messages.map((msg) => ({
          ...msg,
          seen: true,
        }));
      }
    });
  },
});

export default messagesSlice.reducer;

export const { setMessages, addMessage, resetMessage, markSeen } =
  messagesSlice.actions;

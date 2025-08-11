import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connections: [],
  followers: [],
  pendingConnections: [],
  following:[]
}

const connectionsSlice = createSlice({
  name:'connections',
  initialState,
  reducers: {

  }
})

export default connectionsSlice.reducer;
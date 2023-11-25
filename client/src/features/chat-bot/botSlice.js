import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chatContainer: null, // this will be set to the id of the chatContainer
    chats: []
}

export const botSlice = createSlice({
    name: "bot",
    initialState,
    reducers: {
        setChatContainer: (state, action) => {
            state.chatContainer = action.payload
        },
        // this will be used to replace the current array with the new chat array
        setChats: (state, action) => {
            state.chats = action.payload
        },
        // this will be used to push the object to th existing array
        setChat: (state, action) => {
            state.chats.push(action.payload)
        }
    }
})

export const { setChatContainer, setChats, setChat } = botSlice.actions
export default botSlice.reducer
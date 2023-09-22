import { combineReducers } from "@reduxjs/toolkit";
import modeReducer from "../features/mode/modeSlice"
import fileReducer from "../features/editor/fileSlice"
import userDataReducer from "../features/authentication/userDataSlice"
import socketReducer from "../features/sockets/socketSlice"

export default combineReducers({
    mode: modeReducer,
    currentFile: fileReducer,
    userData: userDataReducer,
    socket: socketReducer
})
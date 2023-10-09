import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken } from '../features/authentication/userDataSlice';


const RoomJoin = () => {
    const [roomName, setRoomName] = useState("")
    const [Password, setPassword] = useState("")
    const navigate = useNavigate();
    const accessToken = useSelector((state) => state.userData.accessToken)
    const userData = useSelector((state) => state.userData.userData)
    const userName = userData.data.loggedInUser.username
    const dispatch = useDispatch()
    const [createOrJoin, setCreateOrJoin] = useState("Create")

    const createNewRoomRequest = async (accessToken) => {
        let body, url
        if (createOrJoin === "Create") {
            body = JSON.stringify({
                name: roomName,
                users: [userName],
                password: Password,
                admin: userName
            })
            url = "http://localhost:8080/api/v1/room/create-room"
            console.log("Create");
        } else {
            body = JSON.stringify({
                name: roomName,
                password: Password,
            })
            url = "http://localhost:8080/api/v1/room/join-room"
        }
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            body: body
        })
        const data = await response.json()
        if (data.data.statusCode === 201 || data.data.statusCode === 200) {
            toast.success(`${createOrJoin}ed a new room`, {
                style: {
                    background: "#E5E7EB",
                    color: "#333"
                }
            })
            navigate(`/room/${data.data.value._id}`)
            return;
        }
        else if (data.data.statusCode === 422) {
            toast.error(Object.values(data.data.value[0])[0], {
                style: {
                    background: "#E5E7EB",
                    color: "#333"
                }
            })
        }
        else {
            return data.data.statusCode
        }
    }

    const createNewRoom = async () => {
        if (!roomName) {
            toast.error("ROOM name is required", {
                style: {
                    background: "#E5E7EB",
                    color: "#333"
                }
            })
            return;
        }
        if (!Password) {
            toast.error("Password is required", {
                style: {
                    background: "#E5E7EB",
                    color: "#333"
                }
            })
            return;
        }
        try {
            let statusCode = await createNewRoomRequest(accessToken)
            if (statusCode === 403) {
                toast.error("Please enter another room name", {
                    style: {
                        background: "#E5E7EB",
                        color: "#333"
                    }
                })
                return;
            }
            else if (statusCode === 500) {
                toast.error(`Failed to ${createOrJoin.toLowerCase()} a new room`, {
                    style: {
                        background: "#E5E7EB",
                        color: "#333"
                    }
                })
                return;
            }
            else if (statusCode === 401 && createOrJoin === "Create") {
                const response = await fetch("http://localhost:8080/api/v1/users/refreshToken", {
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                let data = await response.json()
                dispatch(setAccessToken(data.data.accessToken))
                await createNewRoomRequest(data.data.accessToken)
            } else if (statusCode === 404) {
                toast.error("Room does not exist", {
                    style: {
                        background: "#E5E7EB",
                        color: "#333"
                    }
                })
            }
        } catch (error) {
            console.log(error.message);
        }

    }
    const handleEnter = (e) => {
        if (e.code === "Enter") {
            createNewRoom()
        }
    }

    const handleClickOrJoin = (e) => {
        e.preventDefault()
        if (createOrJoin === "Create") {
            setCreateOrJoin("Join")
        } else {
            setCreateOrJoin("Create")
        }
    }

    return (
        <div className="bg-[#22272e] h-screen w-screen flex flex-col justify-center text-center">
            <div className="border w-[30%] h-fit rounded-lg p-8 mx-auto bg-gray-900 flex flex-col gap-4">
                <h4 className="text-gray-300 text-lg font-bold">{createOrJoin} room</h4>
                <div className="flex flex-col gap-4 items-center">
                    <input
                        type="text"
                        className="p-2 rounded-lg bg-gray-200 outline-none border-none placeholder:text-black w-full font-semi-bold"
                        placeholder="Room Name"
                        onChange={(e) => setRoomName(e.target.value)}
                        value={roomName}
                        onKeyUp={handleEnter}
                    />
                    <input
                        type="password"
                        className="p-2 rounded-lg bg-gray-200 outline-none border-none placeholder:text-black w-full font-semi-bold"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={Password}
                        onKeyUp={handleEnter}
                    />
                    <button className="px-8 py-2 bg-[#FF6C00] w-fit rounded-lg text-white text-bold text-lg hover:shadow-4xl"
                        onClick={createNewRoom}
                    >
                        {createOrJoin}
                    </button>
                    <span className="text-gray-300">
                        {createOrJoin === "Join" ? "Create" : "Join"} &nbsp;
                        <a
                            onClick={handleClickOrJoin}
                            href=""
                            className="text-[#FF6C00] underline underline-offset-4 hover:text-[#ff6a00c6]"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
        </div>

    )
}

export default RoomJoin
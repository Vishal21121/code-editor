import React, { useState } from 'react'
import { User, Mail, Lock } from "react-feather"
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRegisterMutation } from '../features/authentication/authApiSlice'
import realtime from '../assets/realtime.svg'

const Signin = () => {
    const navigate = useNavigate()
    const [userDetails, setUserDetails] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [register] = useRegisterMutation()


    const registerUser = async () => {
        const { username, email, password, confirmPassword } = userDetails
        const data = {
            username,
            email,
            password
        }
        const toastId = toast.loading("Creating account...")
        try {
            const response = await register(data).unwrap()
            console.log({ response });
            toast.success("User created successfully", {
                id: toastId
            })
            navigate("/")
        } catch (error) {
            if (error.data.data.statusCode === 409) {
                toast.error(error.data.data.message, {
                    id: toastId
                })
                return
            }
            else if (error.data.data.statusCode === 422) {
                if (error.data.data.value[0].username) {
                    toast.error(data.data.value[0].username, {
                        id: toastId
                    })
                } else {
                    toast.error(error.data.data.value[0].password, {
                        id: toastId
                    })
                }
                return
            }
            toast.dismiss(toastId)
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        await registerUser()
    }

    return (
        <div className="flex justify-evenly items-center min-h-screen bg-gray-900">
            <img src={realtime} alt="" className='w-1/2' />
            <p className='w-48 text-gray-300 text-[2.5rem] leading-2 absolute right-0 bottom-28 left-[42rem] font-bold text-center '>Collaborate for Innovation</p>
            <div className="p-10 rounded-lg border-8 border-solid border-[#223243] shadow-3xl">
                <div className="flex justify-center items-center flex-col gap-4">
                    <h2 className="text-gray-300 text-xl font-bold tracking-widest ">Sign in</h2>
                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            required
                            className="pt-3 pr-4 pb-3 pl-12 w-full bg-[#223243] text-gray-300 font-light rounded-3xl text-lg shadow-lg duration-500 outline-none border border-solid border-[#0000001a] placeholder:text-base placeholder:font-light focus:ring-2 focus:ring-orange-500"
                            placeholder='Username'
                            onChange={(e) => setUserDetails((prev) => ({ ...prev, username: e.target.value }))}
                        />
                        <User className="relative bottom-[40px] left-5 w-6 py-[2px] pr-2 text-[#FF6C00] border-r border-solid border-r-[#FF6C00]" />
                    </div>
                    <div className="relative w-[300px]">
                        <input
                            type="email"
                            required
                            className="pt-3 pr-4 pb-3 pl-12 w-full bg-[#223243] text-gray-300 font-light rounded-3xl text-lg shadow-lg duration-500 outline-none border border-solid border-[#0000001a] placeholder:text-base placeholder:font-light focus:ring-2 focus:ring-orange-500"
                            placeholder='Email'
                            onChange={(e) => setUserDetails((prev) => ({ ...prev, email: e.target.value }))}
                        />
                        <Mail className="relative bottom-[40px] left-5 w-6 py-[2px] pr-2 text-[#FF6C00] border-r border-solid border-r-[#FF6C00]" />
                    </div>
                    <div className="relative w-[300px]">
                        <input
                            type="password"
                            required
                            className="pt-3 pr-4 pb-3 pl-12 w-full bg-[#223243] text-gray-300 font-light rounded-3xl text-lg shadow-lg duration-500 outline-none border border-solid border-[#0000001a] placeholder:text-base placeholder:font-light focus:ring-2 focus:ring-orange-500"
                            placeholder='Password'
                            onChange={(e) => setUserDetails((prev) => ({ ...prev, password: e.target.value }))}
                        />
                        <Lock className="relative bottom-[40px] left-5 w-6 py-[2px] pr-2 text-[#FF6C00] border-r border-solid border-r-[#FF6C00]" />
                    </div>
                    <div className="relative w-[300px]">
                        <input
                            type="password"
                            required
                            className="pt-3 pr-4 pb-3 pl-12 w-full bg-[#223243] text-gray-300 font-light rounded-3xl text-lg shadow-lg duration-500 outline-none border border-solid border-[#0000001a] placeholder:text-base placeholder:font-light focus:ring-2 focus:ring-orange-500"
                            placeholder='Confirm Password'
                            onChange={(e) => setUserDetails((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <Lock className="relative bottom-[40px] left-5 w-6 py-[2px] pr-2 text-[#FF6C00] border-r border-solid border-r-[#FF6C00]" />
                    </div>
                    <div className="relative w-[300px] flex flex-col justify-center">
                        <input type="submit" value="Create Account" className="pt-2 pr-4 pb-2 pl-4 w-full rounded-3xl text-lg shadow-lg duration-500 outline-none border border-solid border-[#0000001a] ring-2 ring-[#FF6C00] text-white py-[10px] px-2 font-medium cursor-pointer hover:shadow-4xl" onClick={handleSubmit} />
                        <p className='w-full mt-4 ml-16 text-gray-400'>Already a member? <Link to="/" className="hover:text-white">Log in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signin
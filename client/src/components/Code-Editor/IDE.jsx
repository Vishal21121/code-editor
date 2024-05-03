import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Terminal from './Terminal';
import CodeEditor from './CodeEditor';
import FileExplorer from './FileExplorer';


const IDE = () => {
    const [output, setOutput] = useState("")

    const handleSubmit = async (code, language, version) => {
        console.log({ language, version })
        if (!code) {
            return
        }
        // e.preventDefault()
        document.getElementById("terminal").classList.remove("invisible")
        document.getElementById("termEl").click()
        let data
        const toastId = toast.loading("Compiling code...")
        try {
            const result = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    language: language,
                    version: version,
                    "files": [{ content: code }],
                })
            })
            data = await result.json()
        } catch (error) {
            console.error(error);
        }
        console.log("code compiled: ", data);
        if (data.run.stdout) {
            setOutput(data.run.stdout)
            toast.success("Code compiled successfully", {
                id: toastId
            })
        } else if (data.run.stderr) {
            setOutput(data.run.stderr)
            toast.error("error in the code", {
                id: toastId
            })
        } else {
            toast.success("Code compiled", {
                id: toastId
            })
            setOutput("Nothing to print")
        }
    }

    const toggleTerminal = (event) => {
        let classList = document.getElementById("terminal").classList
        if (event.altKey && event.key == 'o') {
            console.log("invisible");
            if (classList.contains("invisible")) {
                classList.remove("invisible");
            } else {
                classList.add("invisible");
            }
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", toggleTerminal)
        return () => {
            document.removeEventListener("keydown", toggleTerminal)
        }
    }, [])


    return (
        <>
            <div className='h-screen overflow-hidden w-full'>
                <div className='w-full flex'>
                <div className='w-1/4 bg-white'>
                    <FileExplorer/>
                </div>
                <div className="w-1/2 bg-[#3A424D] h-[100vh] flex flex-col box-border ">
                    <div className='flex h-[100%]'>
                        <div className='flex flex-col box-border w-[100%] '>
                            <div className="flex justify-center flex-col">
                                <CodeEditor handleSubmit={handleSubmit} />
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <Terminal output={output} />
            </div>

        </>
    )
}

export default IDE
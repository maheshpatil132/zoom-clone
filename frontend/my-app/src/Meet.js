import React, { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import io from 'socket.io-client'
import { useParams } from 'react-router-dom'



const Meet = () => {
    const socket = io('https://zoomclone-mahesh.herokuapp.com/')
    const { name } = useParams()
    const { room } = useParams()

    const [ids, setIds] = useState('')
    const [audio, setAudio] = useState(true)
    const [vid, setVid] = useState(true)
    const mydiv = useRef()
    const myvideo = useRef()
    const peer = new Peer()


    let othername = ' '
    let myvideoStrm ;
    const callList = []
    const answerList = []

    const append = (video, stream, name) => {
        video.srcObject = stream
        const div = document.createElement('div')
        const h1 = document.createElement('h1')
        h1.classList.add('text-3xl', 'text-center', 'absolute', 'capitalize')
        video.classList.add('w-80')
        video.addEventListener('loadedmetadata',()=>{
            video.play()
        })
        h1.textContent = name
        div.classList.add('border', 'rounded', 'p-1', 'bg-slate-400', 'overflow-hidden', 'relative', 'h-fit')
        div.appendChild(h1)
        div.appendChild(video)
        mydiv.current.appendChild(div)
        RemoveUnusedDivs()

    }


    navigator.mediaDevices.getUserMedia({ video: true , audio:true}).then((strm) => {
        myvideoStrm = strm;
        if(myvideo.current){
            myvideo.current.srcObject = strm
        }

        socket.on('user-connect', (id, size, username, parties) => {
            // console.log(`new user : ${id}`);
            call(id,username,strm)
            socket.emit('tellname', name, id)
        })

        socket.on('addname', (name, id) => {
            othername = name
        })
        
        peer.on('call', (call) => {
                call.answer(strm)
                const video = document.createElement('video')
                call.on('stream', (remote) => {
                    append(video, remote, othername)
                })
                call.on('close', () => {
                    video.remove()
                    RemoveUnusedDivs()
                })
                answerList.push({ call })
            })

    })


    useEffect(() => {

        peer.once('open', (id) => {
            setIds(id)
            socket.emit('join', room, id, name)
        })

        
     console.log("called");

    }, [])

   

    


    socket.on('user-disconnected', (id) => {
        const index = callList.findIndex((peer) => peer.id = id)
        const index2 = answerList.findIndex((peer) => peer.peer = id)
        console.log(index2);
        if (index > -1) {
            console.log(callList[index].call);
            callList[index].call.close()
            callList.splice(index, 1);
        }
        if (index2 > -1) {
            answerList[index2].call.close()
            answerList.splice(index2, 1);
        }
    })

    

    const call = (id, username,strm) => {
            const call = peer.call(id, strm)
            const video = document.createElement('video')
            call.on('stream', (remote) => {
                append(video, remote, username)
            })
            call.on('close', () => {
                video.remove()
                RemoveUnusedDivs()
            })
            callList.push({ id, call })
    }
    const RemoveUnusedDivs = () => {
        let alldivs = mydiv.current.getElementsByTagName("div");
        for (var i = 0; i < alldivs.length; i++) {
            let e = alldivs[i].getElementsByTagName("video").length;
            if (e === 0) {
                alldivs[i].remove()
            }
        }
    };


    // video off/on
    
    const VideoControl = ()=>{
       console.log(typeof(myvideoStrm))
       console.log(myvideoStrm.getVideoTracks()[0].enabled)
        const enable = myvideoStrm.getVideoTracks()[0].enabled;
        if (enable) { // If Video on
            myvideoStrm.getVideoTracks()[0].enabled = false; // Turn off
            // document.getElementById("video").style.color = "red"; // Change Color
        } else {
            // document.getElementById("video").style.color = "white"; // Change Color
            myvideoStrm.getVideoTracks()[0].enabled = true; // Turn On 
        }
        
        // myvideoStrm.getVideoTracks()[0].enabled = !(myvideoStrm.getVideoTracks()[0].enabled);

    }

    const startVideo = ()=>{
        console.log("start");
    }
   
    const muteUnmute = () => { // Mute Audio
        const enabled = myvideoStrm.getAudioTracks()[0].enabled; // Audio tracks are those tracks whose kind property is audio. Chck if array in empty or not
        if (enabled) { // If not Mute
            myvideoStrm.getAudioTracks()[0].enabled = false; // Mute
        } else {
            myvideoStrm.getAudioTracks()[0].enabled = true; // UnMute
        }

    };

   console.log(myvideoStrm);

    return (
        <div>
            <div className='box-container relative container p-4 mx-auto h-screen bg-slate-300 overflow-scroll'>
                <h2 className='text-center text-green-600 text-3xl capitalize'>Voice chat</h2>
                <div className=" p-2 my-4 flex flex-wrap justify-center gap-4 mx-auto max-h-screen " ref={mydiv} >
                    <div className="left border rounded p-1 bg-slate-400 h-fit relative overflow-hidden " >
                        <h1 className='text-3xl text-center absolute capitalize'>You</h1>
                        <video muted={true} autoPlay={true} className='w-80' ref={myvideo}></video>
                    </div>
                </div>

                <div className="footer flex fixed container bottom-0 w-full left-1/2 -translate-x-1/2 justify-center  rounded mx-auto gap-8 bg-neutral-400 p-3 ">
                    {
                        audio ?
                            <div onClick={muteUnmute} className='h-fit w-fit bg-slate-500 p-3 rounded-full'>
                                <svg className="h-6 w-6   cursor-pointer text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />  <line x1="12" y1="19" x2="12" y2="23" />  <line x1="8" y1="23" x2="16" y2="23" /></svg>
                            </div>
                            :
                            <div className='h-fit w-fit bg-slate-500 p-3 rounded-full'>
                                <svg className="h-6 w-6  cursor-pointer text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <line x1="1" y1="1" x2="23" y2="23" />  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />  <line x1="12" y1="19" x2="12" y2="23" />  <line x1="8" y1="23" x2="16" y2="23" /></svg>
                            </div>
                    }

                    {
                        vid ?
                            <div onClick={VideoControl} className='bg-slate-500 p-3 rounded-full'>
                                <svg className="h-6 w-6   cursor-pointer text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <polygon points="23 7 16 12 23 17 23 7" />  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                            </div>
                            :
                            <div onClick={startVideo} className=' bg-slate-500 p-3 rounded-full'>
                                <svg className=" h-6 w-6 cursor-pointer  text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />  <line x1="1" y1="1" x2="23" y2="23" /></svg>
                            </div>
                    }
                    <div  className=' flex justify-center p-3 rounded-full items-center bg-red-600'>
                        <svg className="h-7 w-7 cursor-pointer text-gray " width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" /></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Meet
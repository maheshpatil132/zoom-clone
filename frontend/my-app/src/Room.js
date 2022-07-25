import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { useNavigate, useParams } from 'react-router-dom'
import Peer, { DataConnection } from 'peerjs'

const Room = () => {
    const socket = io('http://localhost:5000')
    const { room } = useParams()
    const { name } = useParams()
    const [id, setId] = useState('')
    // const [other, setOther] = useState('')
    let othername = " "
    const myvideo = useRef()
    const uservideo = useRef()
    const mydiv = useRef()
    const peermain = useRef()
    const arr = {}
    const arr2 = {}

    const navigate = useNavigate()
    const append = (video,stream,name)=>{
        video.srcObject = stream
        const div = document.createElement('div')
        const h1 = document.createElement('h1')
        h1.classList.add('text-3xl','text-center')
        h1.textContent = name
        div.classList.add('border','rounded' ,'p-1','bg-slate-400')
        div.appendChild(h1)
        div.appendChild(video)

        mydiv.current.appendChild(div)
        RemoveUnusedDivs()
    }
    useEffect(() => {
        const peer = new Peer()
        peer.on('open', (id) => {
            setId(id)
            socket.emit('join', room, id,name)
        })

        socket.on('addname',(data)=>{

            peer.on('call', (call) => {
                navigator.mediaDevices.getUserMedia({ video: true }).then((strm) => {
                    call.answer(strm)
                    // const uservideo = document.createElement('video')
                    call.on('stream', (remote) => {
                        // append(uservideo,remote,data)
                        // uservideo.play()
                        uservideo.current.srcObject = remote
                        // uservideo.current.play()
                    })  
    
                    call.on('close',()=>{
                        uservideo.remove()
                        RemoveUnusedDivs()
                        console.log("mahesh2 close video");
                    })  
                    arr2[id]=call
                   
                })
            })   
        })
        
        navigator.mediaDevices.getUserMedia({video:true}).then((strm)=>{
            myvideo.current.srcObject = strm
        })

        socket.on('user-disconnected',async(id)=>{
            if(arr[id]){
                console.log("disconnect");
                arr[id].close()
                delete arr[id]
            }           
        })
        // peer.on('call', (call) => {
        //     console.log(othername);
        //     navigator.mediaDevices.getUserMedia({ video: true }).then((strm) => {
        //         call.answer(strm)
        //         const uservideo = document.createElement('video')
        //         call.on('stream', (remote) => {
        //             append(uservideo,remote,othername)
        //             uservideo.play()
        //         })  

        //         call.on('close',()=>{
        //             uservideo.remove()
        //             RemoveUnusedDivs()
        //             console.log("mahesh2 close video");
        //         })  
        //         arr2[id]=call
               
        //     })
        // })   
        peermain.current = peer
      
    }, [])

    const RemoveUnusedDivs = () => { 
        console.log("cal")
       let alldivs = mydiv.current.getElementsByTagName("div"); 
        for (var i = 0; i < alldivs.length; i++) { 
          let  e = alldivs[i].getElementsByTagName("video").length;           
            if (e === 0) {
                alldivs[i].remove() 
            }
        }
    };
    
    

    const catcherror = (size)=>{
        let all = mydiv.current.getElementsByTagName('div').length
        if(size!==all){
            console.log("need to set");
        }
    }

    socket.on('user-connect',(id,size,username)=>{
        call(id,size,username)
        socket.emit('tellname',name)
        
    })


   
       
    const call = (id,size,username) => {
        console.log(username);
        navigator.mediaDevices.getUserMedia({ video: true }).then((strm) => {
            const call = peermain.current.call(id, strm)
            // const uservideo = document.createElement('video')
            call.on('stream', (remote) => {  
                // append(uservideo,remote,username)
                // uservideo.play()
                uservideo.current.srcObject = remote
                // uservideo.current.play()
            })
            // call.on('close',()=>{
            //     uservideo.remove()
            //     RemoveUnusedDivs()
            //     console.log("mahesh close video");
            // })  
            arr[id]=call
        })
       
    }
    return (
        <div className='container p-4 mx-auto'>
            <h2 className='text-center text-green-600 text-3xl capitalize'>chat message</h2>
            <div className=" p-2 my-4 flex flex-wrap  justify-center gap-8 mx-auto" ref={mydiv} >
                <div className="left border rounded p-1 bg-slate-400  " >
                    <video autoPlay={true} className=' w-full' ref={myvideo}></video>
                </div>
                
                <div className="left border rounded p-1 bg-slate-400  " >
                    <video autoPlay={true} className=' w-full' ref={uservideo}></video>
                </div>
               
            </div>
        </div>
    )
}

export default Room
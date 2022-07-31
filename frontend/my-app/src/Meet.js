import React, { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import io from 'socket.io-client'
import { useParams } from 'react-router-dom'



const Meet = () => {
    const socket = io('http://localhost:5000/')
    const {name} = useParams()
    const {room} = useParams()

    const [ids, setIds] = useState('')
    const mydiv = useRef()
    const myvideo = useRef()
    const peer = new Peer()
  
  
    let othername = ' '
    const callList = []
    const answerList = []

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
       
        peer.once('open',(id)=>{
            setIds(id)
            socket.emit('join',room,id,name)
         }) 
         
         navigator.mediaDevices.getUserMedia({video:true}).then((strm)=>{
            myvideo.current.srcObject = strm
        })
        
       
            peer.on('call',(call)=>{
                navigator.mediaDevices.getUserMedia({video:true}).then((strm)=>{
                    call.answer(strm)
                    const video = document.createElement('video')
                    call.on('stream',(remote)=>{
                        append(video,remote,othername)
                        video.play()
                    })
                    call.on('close',()=>{
                        video.remove()
                        RemoveUnusedDivs()
                        console.log("maheshw close video");
                    })  
                    answerList.push({call})
                })
            })

    }, [])
       
    socket.on('user-connect',(id,size,username,parties)=>{  
        console.log(`new user : ${id}`);
        call(id,username)
        socket.emit('tellname',name,id)
    })

    socket.on('user-disconnected',(id)=>{
      const index = callList.findIndex((peer)=>peer.id = id)
      const index2 = answerList.findIndex((peer)=>peer.peer = id)
      console.log(index2);
      if(index>-1){
        console.log(callList[index].call);
        callList[index].call.close()
        callList.splice(index,1);
      }
      if(index2>-1){
        answerList[index2].call.close()
        answerList.splice(index2,1);
      }
    })
    
   

    socket.on('addname',(name,id)=>{
        othername = name
    })

    const call = (id,username)=>{
        navigator.mediaDevices.getUserMedia({video:true}).then((strm)=>{
            const call = peer.call(id,strm)
            const video = document.createElement('video')
            call.on('stream',(remote)=>{
              append(video,remote,username)
              video.play()
            })
            call.on('close',()=>{
                    video.remove()
                    RemoveUnusedDivs()
                    console.log("mahesh close video");
                })  
            callList.push({id,call})
        })
    }
  
    const RemoveUnusedDivs = () => { 
        let alldivs = mydiv.current.getElementsByTagName("div"); 
         for (var i = 0; i < alldivs.length; i++) { 
           let  e = alldivs[i].getElementsByTagName("video").length;           
             if (e === 0) {
                 alldivs[i].remove() 
             }
         }
     };


  return (
    <div>

<div className='container p-4 mx-auto'>
            <h2 className='text-center text-green-600 text-3xl capitalize'>chat message</h2>
            <div className=" p-2 my-4 flex flex-wrap  justify-center gap-8 mx-auto" ref={mydiv} >
                <div className="left border rounded p-1 bg-slate-400  " >
                    <video autoPlay={true} className=' w-full' ref={myvideo}></video>
                </div>
            </div>
        </div>

    </div>
  )
}

export default Meet
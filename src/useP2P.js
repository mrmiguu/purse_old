import { useState, useRef, useEffect } from 'react'
import Peer from 'peerjs'
import merge from 'deepmerge'

let { getUserMedia } = navigator.mediaDevices

export default (uid, uid2, init) => {
  let debug = true
  let peerRef = useRef()
  let [conn, setConn] = useState()
  let [db, setDb] = useState({})

  useEffect(
    () => {
      if (!uid) return

      getUserMedia({ video: false, audio: true })

      peerRef.current = new Peer(uid)
      peerRef.current.on(
        'connection',
        c => {
          debug && console.log(`useP2P: received connection from ${c.peer}`)
          setConn(c)
        }
      )

      debug && console.log(`useP2P: initialized ${uid}`)
    },
    [uid]
  )

  useEffect(
    () => {
      if (!uid2) return

      setConn(peerRef.current.connect(uid2))

      debug && console.log(`useP2P: initiated connection w/ ${uid2}`)
    },
    [uid2]
  )

  useEffect(
    () => {
      if (!conn) return

      conn.on('data', d => {
        debug && console.log(`useP2P: ${JSON.stringify(db)} <-- ${JSON.stringify(d)}`)

        setDb(db => merge(db, d))
      })

      conn.on('open', () => {
        debug && console.log(`useP2P: opened ${uid}<==>${conn.peer}`)

        let d = { [uid]: { msg: 'hi!' } }
        // setDb(db => merge(db, d))

        setTimeout(() => {
          debug && console.log(`useP2P: ${JSON.stringify(d)} --> ${conn.peer}`)
          conn.send(d)
        }, 2000)
      })

      debug && console.log(`useP2P: initialized ${uid}<==>${conn.peer}`)
    },
    [conn]
  )

  return db
}

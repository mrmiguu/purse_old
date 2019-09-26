let debug = true

import { useState, useRef, useEffect, useCallback } from 'react'
import Peer from 'peerjs'
import merge from 'deepmerge'
import { pseudoUid } from './global'

let { values } = Object
let { getUserMedia } = navigator.mediaDevices

let uid = pseudoUid() // our fake uid

export default (init, uid2) => {
  // debug && console.log(`useP2P()`)

  let [videos, setVideos] = useState({})
  let peerRef = useRef()
  let connsRef = useRef({})
  let [db, setDb] = useState(init && init(uid) || {})

  let connSetup = useCallback(
    conn => {
      conn.on('data', d => {
        setDb(db => {
          debug && console.log(`useP2P: ${JSON.stringify(d)} <-- ${conn.peer}`)
          return merge(db, d)
        })
      })

      conn.on('open', () => {
        debug && console.log(`useP2P: opened ${uid}<==>${conn.peer}`)

        setDb(db => {
          conn.send(db)
          debug && console.log(`useP2P: ${JSON.stringify(db)} --> ${conn.peer}`)
          return db
        })
      })

      debug && console.log(`useP2P: initialized ${uid}<==>${conn.peer}`)
    },
    []
  )

  useEffect(
    () => {
      getUserMedia({ video: true, audio: true }).then(stream => {
        setVideos(videos => ({ ...videos, [uid]: stream }))
      })

      peerRef.current = new Peer(uid)
      peerRef.current.on(
        'connection',
        c => {
          debug && console.log(`useP2P: received connection from ${c.peer}`)
          connsRef.current = { ...connsRef.current, [c.peer]: c }
          connSetup(c)
        }
      )

      debug && console.log(`useP2P: initialized ${uid}`)
    },
    []
  )

  useEffect(
    () => {
      if (!videos[uid]) return

      peerRef.current.on('call', call => {
        call.answer(videos[uid])

        call.on('stream', stream => {
          debug && console.log(`useP2P: stream <-- ${call.peer} (answered)`)
          setVideos(videos => ({ ...videos, [call.peer]: stream }))
        })

        debug && console.log(`useP2P: answered call from ${call.peer}`)
      })
    },
    [videos]
  )

  useEffect(
    () => {
      if (!videos[uid] || !uid2 || videos[uid2]) return

      let call = peerRef.current.call(uid2, videos[uid])

      call.on('stream', stream => {
        debug && console.log(`useP2P: stream <-- ${call.peer} (picked up)`)
        setVideos(videos => ({ ...videos, [call.peer]: stream }))
      })

      debug && console.log(`useP2P: calling ${uid2}...`)
    },
    [videos, uid2]
  )

  useEffect(
    () => {
      if (!uid2) return

      connsRef.current = {
        ...connsRef.current,
        [uid2]: peerRef.current.connect(uid2)
      }

      connSetup(connsRef.current[uid2])

      debug && console.log(`useP2P: initiated connection w/ ${uid2}`)
    },
    [uid2]
  )

  let putDb = useCallback(
    dOrFn => {

      let d =
        typeof dOrFn === 'object' ? dOrFn
          : typeof dOrFn === 'function' ? dOrFn(db)
            : undefined

      if (!d) return

      setDb(db => merge(db, d))
      for (let conn of values(connsRef.current)) {
        conn.send(d)
        debug && console.log(`useP2P: ${JSON.stringify(d)} --> ${conn.peer}`)
      }

    },
    [db],
  )

  return {
    uid, videos, db, putDb,
  }
}

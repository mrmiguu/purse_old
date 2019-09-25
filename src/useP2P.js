let debug = true

import { useState, useRef, useEffect, useCallback } from 'react'
import Peer from 'peerjs'
import merge from 'deepmerge'
import { pseudoUid } from './global'

let uid = pseudoUid() // our fake uid

let { getUserMedia } = navigator.mediaDevices

export default (init, uids) => {
  // debug && console.log(`useP2P()`)

  let [uid2] = uids
  let peerRef = useRef()
  let [conn, setConn] = useState()
  let [db, setDb] = useState(init && init(uid) || {})

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
    [conn]
  )

  let putDb = useCallback(
    dOrFn => {

      let d =
        typeof dOrFn === 'object' ? dOrFn
          : typeof dOrFn === 'function' ? dOrFn(db)
            : undefined

      if (!d) return

      setDb(db => merge(db, d))
      if (conn) {
        conn.send(d)
        debug && console.log(`useP2P: ${JSON.stringify(d)} --> ${conn.peer}`)
      }

    },
    [conn, db],
  )

  return {
    uid, db, putDb,
  }
}

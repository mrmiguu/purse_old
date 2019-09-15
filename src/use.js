import { useState, useEffect } from 'react'

export let useWindowSize = () => {
  let [size, setSize] = useState([window.innerWidth, window.innerHeight])

  useEffect(
    () => {
      let onResize = () => setSize([window.innerWidth, window.innerHeight])
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    },
    []
  )

  return size
}

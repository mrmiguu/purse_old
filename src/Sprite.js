import styles from './styles/Sprite.module.scss'
import React, { useRef, useEffect } from 'react'
import anime from 'animejs'
import { border } from './global'

export default ({ x, y, dir, debug, children, ...props }) => {
  let ref = useRef()

  useEffect(
    () => {
      anime({
        targets: ref.current,
        translateX: x * 32 - 16,
        translateY: y * 32 - 32,
        scaleX: dir[0],
        // scaleY: dir[1],
        // easing: 'linear',
        duration: 1500,
      })
    },
    [x, y, dir]
  )

  return <>
    <div
      ref={ref}
      id={styles.Sprite}
      style={border(debug)}
      {...props}
    >
      {children}
    </div>
  </>
}

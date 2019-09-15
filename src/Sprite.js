import styles from './styles/Sprite.module.scss'
import React, { useRef, useEffect } from 'react'
import anime from 'animejs'
import { border } from './global'

export default ({ x, y, debug, ...props }) => {
  let ref = useRef()

  useEffect(
    () => {
      anime({
        targets: ref.current,
        translateX: x * 32,
        translateY: y * 32 - 32,
        easing: 'linear',
        duration: 500,
      })
    },
    [x, y]
  )

  return <>
    <div
      ref={ref}
      id={styles.Sprite}
      style={border(debug)}
      {...props}
    >
    </div>
  </>
}

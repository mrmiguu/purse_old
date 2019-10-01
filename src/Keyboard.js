import styles from './styles/Keyboard.module.scss'
import React, { useRef, useEffect } from 'react'
import { border } from './global'

let { keys } = Object

export default ({ onLeft, onRight, onUp, onDown, debug }) => {
  let ref = useRef()

  useEffect(
    () => {
      let keyToAct = {
        ArrowLeft: onLeft,
        ArrowRight: onRight,
        ArrowUp: onUp,
        ArrowDown: onDown,
      }

      let onKeyDown = e => {
        let fn = keyToAct[e.key]
        fn && fn()
      }

      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    },
    []
  )

  return <>
    <div
      ref={ref}
      id={styles.Keyboard}
    >
      <div
        id={styles.Left}
        onMouseDown={onLeft}
        onTouchStart={onLeft}
        style={border(debug)}
      ></div>

      <div
        id={styles.Right}
        onMouseDown={onRight}
        onTouchStart={onRight}
        style={border(debug)}
      ></div>

      <div
        id={styles.Top}
        onMouseDown={onUp}
        onTouchStart={onUp}
        style={border(debug)}
      ></div>

      <div
        id={styles.Bottom}
        onMouseDown={onDown}
        onTouchStart={onDown}
        style={border(debug)}
      ></div>
    </div>
  </>
}

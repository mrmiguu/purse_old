export let border = flag => ({ border: flag ? '' : 'none' })

export let hexToHSL = hex => {
  const [, red, green, blue] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  let r = parseInt(red, 16)
  let g = parseInt(green, 16)
  let b = parseInt(blue, 16)
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default:
    }

    h /= 6
  }

  return { h: h, s: s, l: l }
}

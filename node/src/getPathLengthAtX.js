/*adapted from https://wiredcraft.com/blog/dashed-line-segmentation-d3js/*/
function getPathLengthAtX(path, x) {
  const EPSILON = 0.01
  let point
  let target
  let start = 0
  let end = path.getTotalLength()
  while (true) {
    target = ((start + end) / 2)
    point = path.getPointAtLength(target)
    if (Math.abs(point.x - x) <= EPSILON) break
    if ((target >= end || target <= start) && point.x !== x) {
      break
    }
    if (point.x > x) {
      end = target
    } else if (point.x < x) {
      start = target
    } else {
      break
    }
  }
  return Math.round(target/EPSILON)*EPSILON;
}

export { getPathLengthAtX }
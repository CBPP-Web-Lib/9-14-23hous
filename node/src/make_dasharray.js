

import { getPathLengthAtX } from "./getPathLengthAtX"

function dashes(length) {
  var r = [];
  var dash_size = 0.02;
  var gap_size = 3
  var total_size = 0;
  var padding_size = 6;
  r.push(padding_size, 0)
  total_size += padding_size;
  while (total_size < length -  (gap_size + dash_size + padding_size)) {
    r.push(dash_size, gap_size)
    total_size += (dash_size + gap_size)
  }
  r.push(length - total_size, 0)
  return r
}

var dashgen = function(args) {
  var {path, d, cx, cy} = args;
  var current_length = 0;
  var slope;
  var in_real = true;
  var dasharray = []
  var prev_length = 0, new_length;
  for (var n = 0, nn = d.line.length; n<nn; n++) {
    var point = d.line[n]
    var prev_point = point
    if (n > 0) {
      prev_point = d.line[n - 1]
    }
    var mode = point.real && prev_point.real;
    if (mode !== in_real ) {
      if (in_real) {
        dasharray.push(current_length, 0)
      } else {
        dasharray.push(...dashes(current_length))
      }
      current_length = 0
    }
    in_real = mode
    var x = cx(point.x)
    var new_length = getPathLengthAtX(path, x)
    var diff = new_length - prev_length;
    prev_length = new_length;
    current_length += diff
  }
  if (in_real) {
    dasharray.push(current_length, 0)
  } else {
    dasharray.push(...dashes(current_length))
  }
  return dasharray.join(" ")

}

export { dashgen }
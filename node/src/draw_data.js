import { 
  select as d3_select, 
  path as d3_path, 
  scaleLinear as d3_scaleLinear,
  axisBottom as d3_axisBottom,
  axisLeft as d3_axisLeft
} from "d3"

import { id, viewport, margins } from "./globals"
import { split_into_segments } from "./split_into_segments"
import { getPathLengthAtX } from "./getPathLengthAtX"

const start_year = 2001

const draw_data = (data, colors, year_cutoff)=>{
  var svg = d3_select("#" + id + " .chart-area > svg")

  var { lines, ymax, ymin } = split_into_segments(data, start_year, year_cutoff);

  ymax += (ymax - ymin)*0.05
  ymin -= (ymax - ymin)*0.05

  var cx = (x) => {
    return (x - start_year)/(year_cutoff - start_year) * (viewport[2] - margins[3] - margins[1]) + margins[3]
  }

  var cy = (y) => {
    return (y - ymax)/(ymin - ymax) * (viewport[3] - margins[2] - margins[0]) + margins[0]
  }

  var pathgen = function(d) {
    var path = d3_path()
    d.line.forEach((point, i)=>{
      var {x, y} = point
      if (i === 0) {
        path.moveTo(cx(x), cy(y))
      } else {
        path.lineTo(cx(x), cy(y))
      }
    })
    return path.toString()
  }

  function dashes(length) {
    var r = [];
    var dash_size = 0.05;
    var gap_size = 3
    var total_size = 0;
    while (total_size < length -  (gap_size + dash_size)) {
      r.push(dash_size, gap_size)
      total_size += (dash_size + gap_size)
    }
    r.push(length - total_size, 0)
    return r
  }

  var dashgen = function(d) {
    var current_length = 0;
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
      var new_length = getPathLengthAtX(this, x)
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

  var xscale = d3_scaleLinear([start_year, year_cutoff], [cx(start_year), cx(year_cutoff)]);
  //var yscale = d3_scaleLinear([ymin, ymax], [cy(ymin), cy(ymax)])
  var xaxis = svg.selectAll("g.xaxis")
    .data([1]);

  var xticks = [];
  for (var year = start_year; year <= year_cutoff; year++) {
    xticks.push(year)
  }
  if (xticks.length > 10) {
    xticks = xticks.filter(y=>y%2===0)
  }

  var xaxis_gen = d3_axisBottom(xscale)
    .tickPadding(5)
    .tickValues(xticks)
    .tickFormat(function(year) {
      if (year !== Math.round(year)) {
        return ""
      } else {
        return year
      }
    })
    .tickSize(5)

  xaxis
    .enter()
    .append("g")
    .attr("class","xaxis")
    .merge(xaxis)
    .attr("transform", "translate(0, " + cy(ymin) + ")")
    .call(xaxis_gen)

  var yscale = d3_scaleLinear([ymin, ymax], [cy(ymin), cy(ymax)])
  var yaxis = svg.selectAll("g.yaxis")
    .data([1]);

  var yticks = [-15, -10, -5, 0, 5, 10, 15, 20, 25];
  
  var yaxis_gen = d3_axisLeft(yscale)
    .tickPadding(0)
    .tickValues(yticks)
    .tickFormat(function(p) {
      if (p !== Math.round(p)) {
        return "";
      }
      return p + "%"
    });

  var ygrid = yscale.ticks().filter(d=>d!==0)
  var ygridlines = svg.selectAll("line.ygrid")
    .data(yticks);
  ygridlines.enter()
    .append("line")
    .attr("class","ygrid")
    .attr("stroke-width", 0.8)
    .attr("stroke","#ccc")
    .merge(ygridlines)
    .attr("x1", cx(start_year))
    .attr("y1", d=>cy(d))
    .attr("x2", cx(year_cutoff))
    .attr("y2", d=>cy(d));
  ygridlines
    .exit()
    .remove()
  ygridlines.lower()

  
  var compress = (cy(1)-cy(0))/(cx(1)-cx(0))
  var rent_final_point = lines[0].line[lines[0].line.length - 1];
  var rent_angle = Math.atan(lines[0].final_slope*compress)*180/Math.PI
  var income_final_point = lines[1].line[lines[1].line.length - 1];
  var income_angle = Math.atan(lines[1].final_slope*compress)*180/Math.PI

  var make_arrow = function(final_point, angle, className) {
    var arrow = svg.selectAll("path.arrow." + className)
      .data([1]);
    arrow
      .enter()
      .append("path")
      .attr("class","arrow " + className)
      .attr("d", "M0,0L10,5L0,10z")
      .attr("fill", colors[className])
      .attr("stroke-width", 0)
      .merge(arrow)
      .attr("transform-origin", "5 5")
      .attr("transform", [
        "translate(" + [
          cx(final_point.x) - 5,
          cy(final_point.y) - 5
        ].join(",") + ")",
        "rotate(" + (angle) + ")"
      ].join(" "))
  }

  var make_final_point_label = function(final_point, className) {
    var f = function(n) {
      var t = Math.round(n*10)/10;
      t = (t+"").split(".")
      if (t.length === 1) {
        t.push("0")
      }
      t = t.join(".")
      return t + "%"
    }
    var text = svg.selectAll("text.final_point_label." + className)
      .data([1])
    text
      .enter()
      .append("text")
      .attr("class","final_point_label " + className)
      .attr("text-anchor","start")
      .merge(text)
      .attr("x", cx(final_point.x)+7)
      .attr("y", cy(final_point.y)+2)
      .text(f(final_point.y))
  }
  
  make_arrow(rent_final_point, rent_angle, "Rent")
  make_arrow(income_final_point, income_angle, "Income")

  make_final_point_label(rent_final_point, "Rent");
  make_final_point_label(income_final_point, "Income");

  

  yaxis
    .enter()
    .append("g")
    .attr("class","yaxis")
    .merge(yaxis)
    .attr("transform", "translate(" + cx(start_year)+ ",0)")
    .call(yaxis_gen)

  var zero_line = svg.selectAll("line.zeroline")
    .data([1]);
  zero_line.enter()
    .append("line")
    .attr("class","zeroline")
    .attr("stroke-width", 1)
    .attr("stroke","#666")
    .merge(zero_line)
    .attr("x1", cx(start_year))
    .attr("y1", cy(0))
    .attr("x2", cx(year_cutoff))
    .attr("y2", cy(0))

  var join = svg.selectAll("path.data-seg")
    .data(lines, d=>d.name)

  join.enter()
    .append("path")
    .attr("class", "data-seg")
    .attr("stroke", d=>colors[d.name])
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .merge(join)
    .attr("d", pathgen)
    .attr("stroke-dasharray", dashgen)

  

}



export { draw_data }
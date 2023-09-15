import { 
  select as d3_select, 
  path as d3_path, 
  scaleLinear as d3_scaleLinear,
  axisBottom as d3_axisBottom,
  axisLeft as d3_axisLeft
} from "d3"

import { id, viewport, margins, start_year } from "./globals"
import { split_into_segments } from "./split_into_segments"
import { dashgen } from "./make_dasharray"

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

  var year_label = svg.selectAll("text.year-label")
    .data([1]);
  year_label
    .enter()
    .append("text")
    .attr("class","year-label")
    .attr("text-anchor","end")
    .attr("font-size",12)
    .attr("font-weight","bold")
    .attr("font-family","proxima-nova-condensed")
    .attr("x", viewport[2]-margins[1])
    .attr("y", 10)
    .attr("dominant-baseline","top")
    .merge(year_label)
    .text("Year: " + Math.floor(year_cutoff))

  var xscale = d3_scaleLinear([start_year, year_cutoff], [cx(start_year), cx(year_cutoff)]);
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
  var ym = 5;
  var yrange = ymax - ymin;
  if (yrange < 14) {
    ym = 1;
  } else {

  }
  yticks = []
  var _y = Math.ceil((ymin+0.05*yrange)/ym);
  for (_y; _y<=Math.floor((ymax)/ym);_y++) {
    yticks.push(_y*ym)
  }
  
  
  var yaxis_gen = d3_axisLeft(yscale)
    .tickPadding(0)
    .tickValues(yticks)
    .tickFormat(function(p) {
      if (p !== Math.round(p)) {
        return "";
      }
      return p + "%"
    });

  var ygridlines = svg.selectAll("line.ygrid")
    .data(yticks, (d) => {
      return d;
    });

  var positioner = function(line) {
    line.attr("x1", cx(start_year))
      .attr("y1", d=>cy(d))
      .attr("x2", cx(year_cutoff))
      .attr("y2", d=>cy(d));
  }

  ygridlines.enter()
    .append("line")
    .attr("class","ygrid")
    .attr("stroke-width", 0.8)
    .attr("stroke","#ccc")
    .attr("opacity", 1)
    .merge(ygridlines)
    .call(positioner)

  svg.selectAll("line.ygrid-exiting")
    .call(positioner)
  
  ygridlines
    .exit()
    .attr("class","ygrid-exiting")
    .transition()
    .duration(100)
    .attr("opacity",0)
    .on("end", function() {
      d3_select(this).remove()
    })

  var make_arrow = function(final_point, angle, className) {
    var arrow = svg.selectAll("g.arrow." + className)
      .data([1]);
    arrow
      .enter()
      .append("g")
      .attr("class","arrow " + className)
      .each(function() {
        d3_select(this).append("path")
          .attr("d", "M0,0L10,5L0,10z")
          .attr("fill", colors[className])
          .attr("stroke-width", 0)
          .attr("transform-origin", "5 5")
      })
      .merge(arrow)
      .each(function() {
        var path = d3_select(this).select("path");
        var current_angle = path.attr("data-angle")*1
        if (Math.abs(angle - current_angle) > 1) {
          d3_select(this).select("path")
            .attr("transform", "rotate(" + angle + ")")
            .attr("data-angle", angle)
        }
      })
      .attr("transform", "translate(" + [
        cx(final_point.x) - 5,
        cy(final_point.y) - 5
      ].join(" ") + ")")
  };

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
  
  var compress = (cy(1)-cy(0))/(cx(1)-cx(0))
  lines.forEach((line_obj) => {
    line_obj.final_point = line_obj.line[lines[0].line.length - 1]
    line_obj.final_angle = Math.atan(line_obj.final_slope*compress)*180/Math.PI
    make_arrow(line_obj.final_point, line_obj.final_angle, line_obj.name)
    make_final_point_label(line_obj.final_point, line_obj.name)
  })
  
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
    .attr("stroke-width", 1.2)
    .attr("stroke","#666")
    .merge(zero_line)
    .attr("x1", cx(start_year))
    .attr("y1", cy(0))
    .attr("x2", cx(year_cutoff))
    .attr("y2", cy(0))

  zero_line.lower()
  ygridlines.lower()

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
  

  var data_join = svg.selectAll("path.data-seg")
    .data(lines, d=>d.name)

  data_join.enter()
    .append("path")
    .attr("class", "data-seg")
    .attr("stroke", d=>colors[d.name])
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .merge(data_join)
    .attr("d", pathgen)
    .attr("stroke-dasharray", function(d) {
      return dashgen({path: this, d, cx, cy})
    })

  

}



export { draw_data }
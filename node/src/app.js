import "core-js/stable"
import "regenerator-runtime/runtime"
import "./style.scss"
import { load_typekit } from "./typekit_loader"
import { get_data } from "./data_getter"
import { setup_svg } from "./setup_svg"
import { draw_data } from "./draw_data"
import { setup_legend } from "./setup_legend"

Promise.all([
  new Promise((resolve)=>{
    load_typekit(resolve)
  }),
  new Promise((resolve)=>{
    get_data(resolve)
  })
]).then((d)=>{
  var data = d[1]
  setup_svg()
  const colors = setup_legend()

  var start_year = 2002;
  var end_year = 2022;
  var start = Date.now();
  var duration = 10000;

  var frame = function() {
    var time = Date.now() - start;
    var p = time/duration;
    var year = (end_year - start_year)*p + start_year;
    year = Math.min(end_year, year);
    draw_data(data, colors, year)
    if (year < end_year) {
      window.requestAnimationFrame(frame);
    }
  } 

  //draw_data(data, colors, 2020.5)

  frame()

})

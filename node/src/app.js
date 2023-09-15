import "core-js/stable"
import "regenerator-runtime/runtime"
import "./style.scss"
import { load_typekit } from "./typekit_loader"
import { get_data } from "./data_getter"
import { setup_svg } from "./setup_svg"
import { draw_data } from "./draw_data"
import { setup_legend } from "./setup_legend"
import { id } from "./globals"

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
  var start;
  var duration = 20000;

  var frame = function() {
    var time = Date.now() - start;
    var p = time/duration;
    var year = (end_year - start_year)*p + start_year;
    year = Math.min(end_year, year);
    draw_data(data, colors, year)
    if (year < end_year) {
      window.requestAnimationFrame(frame);
    } else {
      restart(5000)
    }
  } 

  var restart = function(wait) {
    Promise.resolve().then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, wait)
      })
    }).then(()=>{
      return new Promise((resolve) => {
        document.querySelectorAll("#" + id + " .chart-area")[0].style.opacity = 0
        setTimeout(resolve, 500)
      })
    }).then(()=>{
      return new Promise((resolve) => {
        draw_data(data, colors, 2002)
        document.querySelectorAll("#" + id + " .chart-area")[0].style.opacity = 1
        setTimeout(resolve, 500)
      })
    }).then(()=>{
      start = Date.now();
      frame();
    })
  }

  //draw_data(data, colors, 2020.5)
  draw_data(data, colors, 2022)
  document.getElementById(id).style.opacity = 1
  document.querySelectorAll("#" + id + " .chart-area")[0].style.opacity = 1
  restart(3000);

})

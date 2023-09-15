import { id, viewport } from "./globals"
import { select as d3_select } from "d3"

const setup_svg = () => {
  const wrap = document.querySelectorAll("#" + id + " .chart-area")[0]
  const svg = d3_select(wrap).append("svg")
    .attr("viewBox", viewport.join(" "))
  
  return svg

}

export { setup_svg }
import { id } from "./globals"
import { select as d3_select } from "d3"

const setup_legend = () => {
  const colors = {}
  const legend_el = document.querySelectorAll("#" + id + " div.legend")[0]
  legend_el.querySelectorAll(".legend-item").forEach((legend_item) => {
    var color = legend_item.getAttribute("data-color")
    colors[legend_item.getAttribute("data-value")] = color
    var box = d3_select(legend_item)
      .append("svg")
      .attr("viewBox", "0 0 10 10")
      .attr("class","legend-line")
    box.lower()
    box.append("line")
      .attr("x1",-1)
      .attr("y1",5)
      .attr("x2",11)
      .attr("y2",5)
      .attr("stroke", color)
      .attr("stroke-width", 2)

  })
  
  return colors
}

export { setup_legend }
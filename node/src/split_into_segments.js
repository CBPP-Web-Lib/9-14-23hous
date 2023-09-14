function split_into_segments(data, start_year, year_cutoff) {

  /*data elements to draw are line segments between data points*/
  var lines = {"Rent":[],"Income":[]}
  var ymax = 0, ymin = 0;
  var real_key = "r=real; i=interpolated"
  for (var year = start_year; year <= year_cutoff; year++) {
    var real = data[year][real_key] === "r"
    lines.Rent.push({
      x: year,
      y: data[year].Rent,
      real
    });
    lines.Income.push({
      x: year,
      y: data[year].Income,
      real
    });
    ymax = Math.max(ymax, data[year].Rent, data[year].Income);
    ymin = Math.min(ymin, data[year].Rent, data[year].Income);
  }
  /*final 'extrapolated' point for smooth animation*/
  if (Math.floor(year_cutoff) !== year_cutoff) {
    var next_year = Math.ceil(year_cutoff)
    var final_year = Math.floor(year_cutoff)
    if (data[next_year]) {
      var income_slope = data[next_year].Income - data[final_year].Income
      var rent_slope = data[next_year].Rent - data[final_year].Rent
      var x_inc = year_cutoff - Math.floor(year_cutoff)
      var real = !(data[next_year][real_key] === "i" || data[final_year][real_key] === "i")
      var final_rent = {
        x: final_year + x_inc,
        y: x_inc*rent_slope + data[final_year].Rent,
        real
      }
      var final_income = {
        x: final_year + x_inc,
        y: x_inc*income_slope + data[final_year].Income,
        real
      }
      lines.Rent.push(final_rent)
      lines.Income.push(final_income)
      ymax = Math.max(ymax, final_rent.y, final_income.y);
      ymin = Math.min(ymin, final_rent.y, final_income.y);
    }
  }
  var r = [
    {
      name: "Rent",
      line: lines.Rent,
      final_slope: get_final_slope(lines.Rent)
    },
    {
      name: "Income",
      line: lines.Income,
      final_slope: get_final_slope(lines.Income)
    }
  ]

  return { lines: r, ymin, ymax }
}

function get_final_slope(line) {
  return (line[line.length - 1].y - line[line.length - 2].y)/(line[line.length - 1].x - line[line.length - 2].x)
}

export { split_into_segments }
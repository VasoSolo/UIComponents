import React, { useEffect, createRef } from "react";
import * as d3 from "d3";
import { schemeSet3, selectAll, transition } from "d3";

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function BarD3(props) {
  console.log("props", props);
  const { data, height, width, cols, metrics, mainColor, hoverColor } = props;
  console.log("height", height);
  const rootElem = createRef();
  function createChart(element) {
    //let element;
    const metrica = metrics[0];
    const colName = cols[0];

    const dataGrouped = d3.group(
      data,
      //(d) => d.year,
      (d) => d[colName]
    );

    console.log("dataGrouped", dataGrouped);
    let Y = [];
    let dataArray = [];
    dataGrouped.forEach((value, key) => {
      Y.push(key);
      dataArray.push(value[0][metrica]);
    });
    console.log("dataArray", dataArray);
    console.log("Y", Y);

    const maximumInDateArray = d3.max(dataArray);
    //const padding = 5;
    const paddingLeft = 40;
    const paddingRight = 40;
    const paddingBottom = 40;
    const heightChart = height - paddingBottom;
    const widthChart = width - paddingLeft;
    const paddingScale = d3.scaleLinear([0, heightChart], [0, 20]);
    const padding = paddingScale(heightChart / dataArray.length);
    const heightRect = heightChart / dataArray.length - padding;
    const widthScale = d3.scaleLinear(
      [0, maximumInDateArray],
      [0, widthChart - paddingRight]
    );
    const heightScale = d3.scaleLinear([0, dataArray.length], [0, heightChart]);
    //const color = d3.scaleLinear([0, maximumInDateArray], ["blue", "red"]);

    function calcY(d, i) {
      return Math.floor(heightChart / dataArray.length) * i;
    }

    if (element.select(".MyChart")) {
      element.select(".MyChart").remove();
    }
    const xAxis = d3.axisBottom(widthScale).ticks(10);

    const canvas = element
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "MyChart");

    //.attr("transform", "translate(0," + height + ")")

    const rectGroup = canvas
      .append("g")
      .attr("class", "rectGroup")
      .attr("height", heightChart)
      .attr("width", widthChart);
    //.attr("transform", "translate(" + paddingLeft + ", 0)");

    const xAxisGroup = canvas
      .append("g")
      .attr("class", "Xaxis")
      .attr("transform", "translate(0, " + heightChart + ")");
    //.attr(
    //  "transform",
    //  "translate(" + paddingLeft + "," + heightChart /* - 5 */ + ")"
    //)

    xAxisGroup.call(xAxis);

    const yAxisGroup = canvas // группа элементов оси У
      .append("g")
      .attr("class", "Yaxis");
    //.attr("transform", "translate(" + paddingLeft + ", 0 )"); //-5

    //yAxisGroup.call(yAxis);

    yAxisGroup //подписи по оси У
      .selectAll("text")
      .data(Y)
      .enter()
      .append("text")
      .attr("x", "-" + paddingLeft)
      .attr("y", (d, i) => {
        return heightScale(i) + (heightRect + 2 * padding) / 2;
      })
      .text((d, i) => d);

    rectGroup
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", heightChart)
      .attr("stroke-width", 1)
      .attr("stroke", "black");

    const rect = rectGroup
      .selectAll("rect")
      .data(dataArray)
      .enter()
      .append("g")
      .attr("class", "rectItem")
      .append("rect")
      .attr("fill", mainColor)
      .attr("width", 0)
      .attr("height", heightRect)
      .attr("y", (d, i) => {
        return heightScale(i);
      });

    const text = rectGroup
      .selectAll(".rectItem")
      .append("text")
      .text((d) => d)
      .attr("fill", "gray")
      .attr("font-weight", "bold")
      .attr("x", (d) => widthScale(d) + 2)
      .attr("y", (d, i) => {
        return heightScale(i) + (heightRect + 2 * padding) / 2;
      });

    // animation
    rect
      .transition()
      .attr("width", (d) => widthScale(d))
      .duration(1000);
    rect.on("mouseenter", function () {
      d3.select(this).transition().duration(300).attr("fill", hoverColor);
      const parentGroup = d3.select(this).node().parentNode;
      parentGroup.querySelector("text").setAttribute("fill", "black");
    });
    rect.on("mouseleave", function () {
      d3.select(this).transition().duration(300).attr("fill", mainColor);
      const parentGroup = d3.select(this).node().parentNode;
      parentGroup.querySelector("text").setAttribute("fill", "gray");
      //stroke="black" stroke-width="0.5
    });

    //return element;
  }

  useEffect(() => {
    const root = rootElem.current;
    console.log("Plugin element", root);
    const element = d3.select(root);
    createChart(element);
  });

  //console.log("Plugin props", props);

  return <div ref={rootElem}></div>;
}

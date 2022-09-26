import React, { useEffect, createRef } from "react";
import * as d3 from "d3";
import { schemeSet3, selectAll, transition } from "d3";

export default function BarD3(props) {
  console.log("props", props);
  const {
    data,
    height,
    width,
    cols,
    metrics,
    mainColor,
    hoverColor,
    labelPosition,
  } = props;
  const rootElem = createRef();
  function createChart(element) {
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

    let arrayOfYItemLenght = [];
    Y.forEach((el) => {
      arrayOfYItemLenght.push(el.length);
    });
    const maximumLenghtInY = d3.max(arrayOfYItemLenght); // находим самую длинную подпись слева
    const lenghtLeftTextScale = d3.scaleLinear([1, 20], [45, 100]);

    const maximumInDateArray = d3.max(dataArray);
    //const paddingLeft = 40;
    const paddingLeft = lenghtLeftTextScale(maximumLenghtInY);
    console.log("paddingLeft", paddingLeft);
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

    function culcLabelPositin(d) {
      if (labelPosition == "end") {
        return widthScale(d) + 2;
      } else if (labelPosition == "middle") {
        return widthScale(d) / 2;
      } else if (labelPosition == "start") {
        return 2;
      }
    }

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
      .attr("width", widthChart)
      .attr("transform", "translate(" + paddingLeft + ", 0)");

    const xAxisGroup = canvas
      .append("g")
      .attr("class", "Xaxis")
      .attr("transform", "translate(" + paddingLeft + ", " + heightChart + ")");

    xAxisGroup.call(xAxis);

    const yAxisGroup = canvas // группа элементов оси У
      .append("g")
      .attr("class", "Yaxis")
      .attr("margin-left", "auto")
      .attr("margin-right", 0);

    const widthYAxis = document.querySelector(".Yaxis").getAttribute("width");
    console.log("widthYAxis", widthYAxis);

    yAxisGroup //подписи по оси У
      .selectAll("text")
      .data(Y)
      .enter()
      .append("text")
      .attr("y", (d, i) => {
        return heightScale(i);
      })
      .text((d, i) => d)
      .attr("x", paddingLeft - 5)
      .attr("text-anchor", "end")
      .attr("dy", (heightRect * 3) / 4);

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
      .attr("x", (d) => culcLabelPositin(d)) //labelPosition
      .attr("y", (d, i) => {
        return heightScale(i);
      })
      .attr("dy", (heightRect * 3) / 4);

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

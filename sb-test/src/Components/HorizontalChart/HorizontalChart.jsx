import React, { useEffect, createRef } from "react";
import * as d3 from "d3";
import { schemeSet3, selectAll, style, transition } from "d3";
import { func } from "prop-types";

//export default function BarD3(props: BarD3Props) {
export default function BarD3(props) {
  console.log("props", props);
  const {
    data,
    height,
    width,
    cols,
    metrics,
    labelColor = "#254558",
    limitColor = "red",
    labelPosition = "end",
    labelFontSize = 8,
    xAxisFontSize = 14,
    yAxisFontSize = 14,
    xLimitLine = 100,
    paddingRight = 40,
    paddingLeft = 40,
    paddingTop = 0,
    paddingBottom = 40,
    paddingInfoLabel = 10,
    legendX = width - 40,
    legendY = 5,
    visualMode,
    //paddingForChart = "0 0 0 0",
  } = props;
  const rootElem = createRef();
  //const rootElem = createRef<HTMLDivElement>();
  //const rootElem = createRef();
  function createChart(element) {
    let groupMode = false;

    if (cols.length > 1) {
      groupMode = true;
    }

    //обработка данных
    const metrica = metrics[0];

    let dataGrouped;
    let arrayOfYItemLenght = [];
    let arrayOfAllValue = [];
    let arrayOfDifferentType = [];

    dataGrouped = Array.from(d3.group(data, (d) => d[cols[0]]));
    // console.log("dataGrouped_0", dataGrouped);
    if (cols.length > 1) {
      dataGrouped = dataGrouped.map((el) => {
        return [el[0], Array.from(d3.group(el[1], (d) => d[cols[1]]))];
      });
    }
    //console.log("dataGrouped_1", dataGrouped);
    if (cols.length == 3) {
      dataGrouped = dataGrouped.map((el) => {
        return [
          el[0],
          el[1].map((el2) => {
            return [el2[0], Array.from(d3.group(el2[1], (d) => d[cols[2]]))];
          }),
        ];
      });
    }
    //console.log("dataGrouped_2", dataGrouped);
    data.forEach((element) => {
      /* console.log("element", element);
        console.log("element[cols[0]]", element[cols[0]]);
        console.log("element[metric]", element[metrica]); */
      const str = element[cols[0]].toString();
      arrayOfYItemLenght.push(str.length);
      arrayOfAllValue.push(element[metrica]);
      arrayOfDifferentType.push(element[cols[cols.length - 1]]);
    });
    arrayOfDifferentType = Array.from(new Set(arrayOfDifferentType));
    let arrayLenghtGroups = [];
    if (cols.length > 1) {
      dataGrouped.forEach((element) => {
        //console.log("element in datagrouped.foreach", element);

        arrayLenghtGroups.push(element[1].length);
        if (cols.length === 3) {
          let arrayLenghtGroupsLevel2 = [];
          element[1].forEach((elementLevel2, index) => {
            arrayLenghtGroupsLevel2.push(elementLevel2[1].length);
          });
          arrayLenghtGroups.push([element[1].length, arrayLenghtGroupsLevel2]);
        } else {
          arrayLenghtGroups.push(element[1].length);
        }
      });
    }

    console.log("data", data);
    //console.log("arrayLenghtGroups", arrayLenghtGroups);
    console.log("dataGrouped", dataGrouped);
    console.log("arrayOfAllValue", arrayOfAllValue);
    console.log("arrayOfDifferentType", arrayOfDifferentType);

    ////////////////////////////////////////////////////////////////////////

    //вычисляем максимальное значение в метрике

    const maximumInDateArray = d3.max(arrayOfAllValue); // максимальное значение в данных
    const paddingBetweenGroups = 10; // отступ между группами
    const heightChart = height - paddingBottom; // высота области чарта, который мы рисуем
    const widthChart = width - paddingLeft - paddingRight; // ширина области чарта
    const padding = 0; // отступ между прямоугольниками

    let heightRect;
    if (cols.length === 2) {
      heightRect =
        (heightChart -
          (arrayOfAllValue.length - 1) * padding -
          (dataGrouped.length - 1) * paddingBetweenGroups) /
        arrayOfAllValue.length;
    } else if (cols.length === 3) {
      const countLevel2Group = dataGrouped.reduce((acc, el) => {
        return (acc = el[1].length + acc);
      }, 0); //количество подгрупп 2 уровня
      heightRect =
        (heightChart -
          (arrayOfAllValue.length - 1) * padding -
          (dataGrouped.length - 1) * paddingBetweenGroups -
          (countLevel2Group - 1) * paddingBetweenGroups) /
        arrayOfAllValue.length;
    } else {
      heightRect = heightChart / arrayOfAllValue.length - padding;
    }

    let widthRect;
    if (cols.length === 2) {
      widthRect =
        (widthChart -
          (arrayOfAllValue.length - 1) * padding -
          (dataGrouped.length - 1) * paddingBetweenGroups) /
        arrayOfAllValue.length;
    } else if (cols.length === 3) {
      const countLevel2Group = dataGrouped.reduce((acc, el) => {
        return (acc = el[1].length + acc);
      }, 0); //количество подгрупп 2 уровня
      widthRect =
        (widthChart -
          (arrayOfAllValue.length - 1) * padding -
          (dataGrouped.length - 1) * paddingBetweenGroups -
          (countLevel2Group - 1) * paddingBetweenGroups) /
        arrayOfAllValue.length;
    } else {
      widthRect = widthChart / arrayOfAllValue.length - padding;
    }

    //heightRect = heightChart / arrayOfAllValue.length; // - padding; // высота прямоугольников
    //heightRect = heightRect; // - padding; // высота прямоугольников
    const colorSets = [
      [
        "#680003",
        "#BC0000",
        "#F5704A",
        "#EFB9AD",
        "#828D00",
        "#338309",
        "#C9D46C",
        "#E48716",
        "#FAAB01",
        "#DFBCB2",
        "#6c585a",
        "#525d09",
        "#94aa6b",
        "#f39015",
        "#bb3701",
        "#1D0F0F",
        "#453C41",
        "#7B7C81",
        "#D4DBE2",
        "#7B586B",
        "#033540",
        "#015366",
        "#63898C",
        "#A7D1D2",
        "#E0F4F5",
      ],
    ];

    const colorScale = d3
      .scaleOrdinal()
      .domain(arrayOfDifferentType)
      .range(colorSets[0]);
    //const colorScale = d3.scale
    console.log("WidhtScale");
    const widthScale = d3.scaleLinear(
      [0, maximumInDateArray],
      //[0, widthChart - paddingRight - paddingForLegend]
      [0, widthChart - paddingRight]
    );
    const heightScale = d3.scaleLinear(
      [0, maximumInDateArray],
      //[0, widthChart - paddingRight - paddingForLegend]
      [heightChart, 0]
    );

    function culcLabelPosition(d) {
      // позиция подписей
      if (labelPosition === "end") {
        return widthScale(d) + 2;
      } else if (labelPosition === "middle") {
        return widthScale(d) / 2;
      } else {
        return 2;
      }
    }
    function culcLabelPositionForVertical(d) {
      // позиция подписей
      if (labelPosition === "end") {
        return heightScale(d) - 2;
      } else if (labelPosition === "middle") {
        return heightScale(d) / 2;
      } else {
        return -2;
      }
    }

    if (element.select(".MyChart")) {
      element.select(".MyChart").remove();
    }
    /////////////////////горизонтальный режим////////////////////////////////////////////////////////////////////////
    if (visualMode === "horizontal") {
      const xAxis = d3.axisBottom(widthScale).ticks(10); // ось Х
      const xAxisTicks = d3 //ось Х для сетки
        .axisBottom(widthScale)
        .tickSize(-heightChart)
        .ticks(10)
        .tickArguments([]);
      ///////////////////////////////////////рисуем
      const canvas = element
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "MyChart")
        .attr("style", "padding-top: " + paddingTop + "px");
      ////////////////////////////////////////////////////////////////////легенда
      const legendXChange = legendX === 0 ? widthChart - paddingRight : legendX;

      const legendTable = canvas
        .append("g")
        .attr("class", "legendTable")
        .attr("transform", "translate(" + legendXChange + "," + legendY + ")");

      const legend = legendTable
        .selectAll(".legend")
        .data(arrayOfDifferentType)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          return "translate(0," + i * 15 + ")";
        });

      legend
        .append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("height", 10)
        .attr("width", 10)
        .attr("fill", (d) => colorScale(d))
        .attr("class", "legend__rect-item");

      legend
        .append("text")
        .attr("x", 12)
        .attr("y", 10)
        .attr("height", 10)
        .attr("width", 10)
        .text((d) => d)
        .attr("class", "legend__text-item");

      ///////////////////////////////////////////////////////////////////////////////////////////////////
      const xAxisTicksGroup = canvas // группа для сетки
        .append("g")
        .attr("class", "Xaxis")
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + heightChart + ")"
        );
      xAxisTicksGroup.call(xAxisTicks).style("opacity", "0.1");

      const xAxisGroup = canvas //группа  для оси х
        .append("g")
        .attr("class", "Xaxis")
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + heightChart + ")"
        );
      xAxisGroup.call(xAxis).style("font-size", xAxisFontSize);
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //группа с прямоугольниками
      const rects = canvas
        .append("g")
        .attr("class", "rectCanvas")
        .attr("height", heightChart)
        .attr("width", widthChart)
        .attr("transform", "translate(" + paddingLeft + ", 0)");

      rects // ось У
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", heightChart)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

      //////////////////////////////////////////рисуем данные для группировок///////////////////////////
      let positionPrevBlock = 0;
      if (groupMode) {
        const groupOfRect = rects
          .selectAll(".groupOfRect")
          .data(dataGrouped)
          .enter()
          .append("g")
          .attr("class", "groupOfRect");

        groupOfRect.attr("transform", (d, i) => {
          //console.log("positionPrevBlock in groupOfRect", d[1]);
          let sum = 0;
          if (cols.length === 3) {
            d[1].forEach((el) => {
              sum += el[1].length;
            });
          }
          let height =
            sum > 0
              ? sum * (heightRect + padding) +
                paddingBetweenGroups +
                paddingBetweenGroups * d[1].length
              : d[1].length * (heightRect + padding) + paddingBetweenGroups;

          const res = positionPrevBlock;
          positionPrevBlock = positionPrevBlock + height;
          return "translate(0," + res + ")";
        });
        // подписи слева
        d3.selectAll(".groupOfRect")
          .append("text")
          .text((d) => {
            //console.log("d in text in groupOfRect", d);
            return d[0];
          })
          .attr("dy", (d) => (d[1].length * heightRect) / 2)
          .attr("dx", -40)
          .attr("class", "yAxisLabel");

        if (cols.length > 2) {
          //////////////////////////////////////////////////////////////////////in level 2
          const groupOfRectNodes = groupOfRect.nodes();
          dataGrouped.forEach((element, i) => {
            //console.log(element[1]);
            createGroupLevel2(element[1], groupOfRectNodes[i]);
          });
          //////////////////////////////////////////////////////////////////////rect in level 2
          const groupOfRectLevelTwoNodes = d3.selectAll(".groupOfRectLevelTwo");

          let j = 0;
          dataGrouped.forEach((element) => {
            //console.log("element in dataGrouped.forEach for level 2", element);
            element[1].forEach((element2) => {
              createRect(
                element2[1],
                groupOfRectLevelTwoNodes.nodes()[j],
                false,
                false
              );
              j++;
            });
          });
        } else {
          //////////////////////////////////////////////////////////////////////rect in level 1
          const groupOfRectNodes = d3.selectAll(".groupOfRect");
          dataGrouped.forEach((element, i) => {
            createRect(element[1], groupOfRectNodes.nodes()[i], false, true);
          });
        }
      } else {
        createRect(dataGrouped, d3.select(".rectCanvas").node());
      }
      ////////////////////////////////////////////////////////////////////////////////////создание подгрупп второго уровня вложенности
      function createGroupLevel2(data, node) {
        //
        //console.log("inpute data in createGroupLevel2", data);
        //console.log("inpute node in createGroupLevel2", node);
        let positionPrevBlockIncreateGroupLevel2 = 0;
        d3.select(node)
          .selectAll(".groupOfRectLevelTwo")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "groupOfRectLevelTwo")
          .attr("height", (d) => {
            //console.log("d in level 2 in height", d[1]);
            return d[1].length * heightRect;
            //return 20;
          })
          .attr("transform", (d, i) => {
            /* console.log(
            "positionPrevBlock in transform in level 2",
            positionPrevBlock
          ); */
            const res = positionPrevBlockIncreateGroupLevel2;
            positionPrevBlockIncreateGroupLevel2 =
              positionPrevBlockIncreateGroupLevel2 +
              d[1].length * heightRect +
              paddingBetweenGroups;
            //console.log("res in transform", res);
            return "translate(0," + res + ")";
            //return "translate(0," + 50 * i + ")";
          });
      }
      ////////////////////////////////////////////////////////////////////////////////////функция создания прямоугольников

      function createRect(
        data,
        node,
        infoLabelIsVisible = true,
        valueLabelIsVisible = true
      ) {
        //функция создания прямоугольников
        //console.log("data inpute in createRect", data);
        //console.log("node inpute in createRect", node);
        const canvasInFuction = d3.select(node);
        const rectAndLabel = canvasInFuction //rects
          .selectAll("rectAndLabel")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "rectAndLabel");

        rectAndLabel
          .append("rect")
          //.attr("fill", mainColor)
          .attr("fill", (d) => {
            return colorScale(d[0]) + "";
          })
          .attr("opacity", "0.6")
          .attr("width", 0)
          .attr("height", heightRect)
          .attr("y", (d, i) => {
            return heightRect * i;
            //console.log("d in create rect level 0", d);
          })
          .attr("class", "rectItem");

        console.log("paddingInfoLabel", paddingInfoLabel);
        if (infoLabelIsVisible) {
          rectAndLabel // infoLabel
            .append("text")
            .text((d) => {
              //console.log("d[0]", d[0]);
              return d[0];
            })
            .attr("y", (d, i) => {
              return heightRect * i;
            })
            .attr("font-size", yAxisFontSize)
            .attr("x", -paddingInfoLabel)
            .attr("text-anchor", "end")
            .attr("dy", (heightRect * 2) / 3)
            .attr("class", "infoLabel");
        }
        if (valueLabelIsVisible) {
          rectAndLabel // valueLabel
            .append("text")
            .text((d) => {
              //console.log("d", d[1][0][metrica]);
              return d[1][0][metrica];
            })
            .attr("y", (d, i) => {
              return heightRect * i;
            })
            .attr("font-size", labelFontSize)
            .attr("fill", labelColor)
            //.attr("x", (d) => widthScale(d[1][0][metrica]))
            .attr("x", (d) => culcLabelPosition(d[1][0][metrica]))
            .attr("text-anchor", "start")
            .attr("dy", (heightRect * 2) / 3)
            .attr("class", "valueLabel");
        }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      rects //пороговое значение
        .append("line")
        .attr("x1", widthScale(xLimitLine))
        .attr("y1", 0)
        .attr("x2", widthScale(xLimitLine))
        .attr("y2", heightChart)
        .attr("stroke-width", 4)
        .attr("stroke", limitColor)
        .attr("opacity", "0.15")
        .attr("class", "lineLimit");

      ////////////////////////////////////////////////////////////////////////create label
      if (labelPosition === "none") {
        d3.selectAll(".valueLabel").attr("opacity", "0");
      } else {
        d3.selectAll(".valueLabel")
          .transition()
          .attr("opacity", "1")
          .duration(1200);
      }
      ////////////////////////////////////////////////// animation
      d3.selectAll(".yAxisLabel").on("mouseenter", (el) => {
        d3.select(el.path[1])
          .selectAll(".rectItem")
          .transition()
          .duration(300)
          //.attr("fill", "red")
          .attr("opacity", "1");
        //console.log(el.path[1]);
      });
      d3.selectAll(".yAxisLabel").on("mouseleave", (el) => {
        d3.select(el.path[1])
          .selectAll(".rectItem")
          .transition()
          .duration(300)
          .attr("opacity", "0.6");
      });
      rects
        .selectAll(".rectItem")
        .transition()
        .attr("width", (d) => {
          return Number(widthScale(d[1][0][metrica]));
        })
        .duration(1000);
      rects.selectAll(".rectItem").on("mouseenter", function () {
        d3.select(this).transition().duration(300).attr("opacity", "1");
        //const parentGroup = d3.select(this).node().parentNode;
      });
      rects.selectAll(".rectItem").on("mouseleave", function () {
        d3.select(this).transition().duration(300).attr("opacity", "0.6");
        // const parentGroup = d3.select(this).node().parentNode;
      });
    } else {
      ///////////********///////////////////////////////////////////////////////////////////////////////
      //////////////////////вертикальный режим///////////////////////////////////////////////////////////////////вертикальный
      ///////////////////////////////////////////////////////////////////////////////////////////////
      console.log("verticalMode");
      const yAxis = d3.axisLeft(heightScale).ticks(10); // ось Y
      const yAxisTicks = d3 //ось Y для сетки
        .axisLeft(heightScale)
        .tickSize(-widthChart)
        .ticks(10)
        .tickArguments([]);
      ///////////////////////////////////////рисуем
      const canvas = element
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "MyChart")
        .attr("style", "padding-top: " + paddingTop + "px");
      ////////////////////////////////////////////////////////////////////легенда
      const legendXChange =
        legendX === undefined ? widthChart - paddingRight : legendX;

      const legendTable = canvas
        .append("g")
        .attr("class", "legendTable")
        .attr("transform", "translate(" + legendXChange + "," + legendY + ")");

      const legend = legendTable
        .selectAll(".legend")
        .data(arrayOfDifferentType)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          return "translate(0," + i * 15 + ")";
        });

      legend
        .append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("height", 10)
        .attr("width", 10)
        .attr("fill", (d) => colorScale(d))
        .attr("class", "legend__rect-item");

      legend
        .append("text")
        .attr("x", 12)
        .attr("y", 10)
        .attr("height", 10)
        .attr("width", 10)
        .text((d) => d)
        .attr("class", "legend__text-item");
      ////////////////////////////////////////////////
      const yAxisTicksGroup = canvas // группа для сетки
        .append("g")
        .attr("class", "Yaxis")
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + paddingTop + ")"
        );
      yAxisTicksGroup.call(yAxisTicks).style("opacity", "0.1");

      const yAxisGroup = canvas //группа  для оси х
        .append("g")
        .attr("class", "yaxis")
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + paddingTop + ")"
        );
      yAxisGroup.call(yAxis).style("font-size", yAxisFontSize);
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //группа с прямоугольниками
      const rects = canvas
        .append("g")
        .attr("class", "rectCanvas")
        .attr("height", heightChart)
        .attr("width", widthChart)
        .attr("transform", "translate(" + paddingLeft + ", " + paddingTop + ")")
        //.attr("style", "padding-right: " + paddingRight + "px");
        .attr("style", "padding-right: 150px");

      rects // ось x
        .append("line")
        .attr("x1", 0)
        .attr("y1", heightChart)
        .attr("x2", widthChart)
        .attr("y2", heightChart)
        .attr("stroke-width", 1)
        .attr("stroke", "black");
      //////////////////////////////////////////рисуем данные для группировок///////////////////////////
      let positionPrevBlock = 0;
      if (groupMode) {
        const groupOfRect = rects
          .selectAll(".groupOfRect")
          .data(dataGrouped)
          .enter()
          .append("g")
          .attr("class", "groupOfRect");

        groupOfRect.attr("transform", (d, i) => {
          //console.log("positionPrevBlock in groupOfRect", d[1]);
          let sum = 0;
          if (cols.length === 3) {
            d[1].forEach((el) => {
              sum += el[1].length;
            });
          }
          let height =
            sum > 0
              ? sum * (heightRect + padding) +
                paddingBetweenGroups +
                paddingBetweenGroups * d[1].length
              : d[1].length * (heightRect + padding) + paddingBetweenGroups;

          const res = positionPrevBlock;
          positionPrevBlock = positionPrevBlock + height;
          return "translate(" + res + ",0)";
        });
        // подписи слева
        d3.selectAll(".groupOfRect")
          .append("text")
          .text((d) => {
            //console.log("d in text in groupOfRect", d);
            return d[0];
          })
          .attr("dy", (d) => (d[1].length * heightRect) / 2)
          .attr("dx", -40)
          .attr("class", "yAxisLabel");

        if (cols.length > 2) {
          //////////////////////////////////////////////////////////////////////in level 2
          const groupOfRectNodes = groupOfRect.nodes();
          dataGrouped.forEach((element, i) => {
            //console.log(element[1]);
            createGroupLevel2(element[1], groupOfRectNodes[i]);
          });
          //////////////////////////////////////////////////////////////////////rect in level 2
          const groupOfRectLevelTwoNodes = d3.selectAll(".groupOfRectLevelTwo");

          let j = 0;
          dataGrouped.forEach((element) => {
            //console.log("element in dataGrouped.forEach for level 2", element);
            element[1].forEach((element2) => {
              createRect(
                element2[1],
                groupOfRectLevelTwoNodes.nodes()[j],
                false,
                false
              );
              j++;
            });
          });
        } else {
          //////////////////////////////////////////////////////////////////////rect in level 1
          const groupOfRectNodes = d3.selectAll(".groupOfRect");
          dataGrouped.forEach((element, i) => {
            createRect(element[1], groupOfRectNodes.nodes()[i], false, true);
          });
        }
      } else {
        createRect(dataGrouped, d3.select(".rectCanvas").node());
      }
      ////////////////////////////////////////////////////////////////////////////////////создание подгрупп второго уровня вложенности
      function createGroupLevel2(data, node) {
        //
        //console.log("inpute data in createGroupLevel2", data);
        //console.log("inpute node in createGroupLevel2", node);
        let positionPrevBlockIncreateGroupLevel2 = 0;
        d3.select(node)
          .selectAll(".groupOfRectLevelTwo")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "groupOfRectLevelTwo")
          .attr("height", (d) => {
            //console.log("d in level 2 in height", d[1]);
            return d[1].length * heightRect;
            //return 20;
          })
          .attr("transform", (d, i) => {
            /* console.log(
            "positionPrevBlock in transform in level 2",
            positionPrevBlock
          ); */
            const res = positionPrevBlockIncreateGroupLevel2;
            positionPrevBlockIncreateGroupLevel2 =
              positionPrevBlockIncreateGroupLevel2 +
              d[1].length * heightRect +
              paddingBetweenGroups;
            //console.log("res in transform", res);
            return "translate(0," + res + ")";
            //return "translate(0," + 50 * i + ")";
          });
      }
      ////////////////////////////////////////////////////////////////////////////////////функция создания прямоугольников

      function createRect(
        data,
        node,
        infoLabelIsVisible = true,
        valueLabelIsVisible = true
      ) {
        //функция создания прямоугольников
        //console.log("data inpute in createRect", data);
        //console.log("node inpute in createRect", node);
        const canvasInFuction = d3.select(node);
        const rectAndLabel = canvasInFuction //rects
          .selectAll("rectAndLabel")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "rectAndLabel");

        rectAndLabel
          .append("rect")
          //.attr("fill", mainColor)
          .attr("fill", (d) => {
            return colorScale(d[0]) + "";
          })
          .attr("opacity", "0.6")
          .attr("width", widthRect)
          .attr("height", 0)
          .attr("x", (d, i) => {
            return widthRect * i;
            //console.log("d in create rect level 0", d);
          })
          .attr("y", (d) => heightScale(d[1][0][metrica]))
          .attr("class", "rectItem");

        if (infoLabelIsVisible) {
          rectAndLabel // infoLabel
            .append("text")
            .text((d) => {
              //console.log("d[0]", d[0]);
              return d[0];
            })
            .attr("x", (d, i) => {
              return widthRect * i;
            })
            .attr("font-size", xAxisFontSize)
            .attr("y", heightChart + paddingInfoLabel)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "text-before-edge")
            .attr("dx", widthRect / 2)
            .attr("class", "infoLabel");
        }
        if (valueLabelIsVisible) {
          rectAndLabel // valueLabel
            .append("text")
            .text((d) => {
              //console.log("d", d[1][0][metrica]);
              return d[1][0][metrica];
            })
            .attr("x", (d, i) => {
              return widthRect * i;
            })
            .attr("font-size", labelFontSize)
            .attr("fill", labelColor)
            //.attr("x", (d) => widthScale(d[1][0][metrica]))
            .attr("y", (d) => culcLabelPositionForVertical(d[1][0][metrica]))
            .attr("text-anchor", "middle")
            //.attr("dx", (widthRect * 2) / 3)
            .attr("dx", widthRect / 2)
            .attr("class", "valueLabel");

          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          rects //пороговое значение
            .append("line")
            .attr("x1", 0)
            .attr("y1", heightScale(xLimitLine))
            .attr("x2", widthChart)
            .attr("y2", heightScale(xLimitLine))
            .attr("stroke-width", 4)
            .attr("stroke", limitColor)
            .attr("opacity", "0.15")
            .attr("class", "lineLimit");
          ////////////////////////////////////////////////////////////////////////create label
          if (labelPosition === "none") {
            d3.selectAll(".valueLabel").attr("opacity", "0");
          } else {
            d3.selectAll(".valueLabel")
              .transition()
              .attr("opacity", "1")
              .duration(1200);
            ////////////////////////////////////////////////// animation
            d3.selectAll(".yAxisLabel").on("mouseenter", (el) => {
              d3.select(el.path[1])
                .selectAll(".rectItem")
                .transition()
                .duration(300)
                //.attr("fill", "red")
                .attr("opacity", "1");
              //console.log(el.path[1]);
            });
            d3.selectAll(".yAxisLabel").on("mouseleave", (el) => {
              d3.select(el.path[1])
                .selectAll(".rectItem")
                .transition()
                .duration(300)
                .attr("opacity", "0.6");
            });
            rects
              .selectAll(".rectItem")
              .transition()
              .attr("height", (d) => {
                return Number(heightChart - heightScale(d[1][0][metrica]));
              })
              .duration(1000);
            rects.selectAll(".rectItem").on("mouseenter", function () {
              d3.select(this).transition().duration(300).attr("opacity", "1");
              //const parentGroup = d3.select(this).node().parentNode;
            });
            rects.selectAll(".rectItem").on("mouseleave", function () {
              d3.select(this).transition().duration(300).attr("opacity", "0.6");
              // const parentGroup = d3.select(this).node().parentNode;
            });
          }
        }
      }
    }
  }

  useEffect(() => {
    const root = rootElem.current;
    //const root = rootElem.current as HTMLElement;
    //console.log("Plugin element", root);
    const element = d3.select(root);
    createChart(element);
  }, [props]);

  //console.log("Plugin props", props);

  return <div ref={rootElem}></div>;

  /* return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    ></Styles>
  ); */
}

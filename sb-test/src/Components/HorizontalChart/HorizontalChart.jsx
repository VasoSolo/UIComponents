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
    labelForStackedPosition = "end",
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
    orientation,
    visualGroupMode,
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

    let arrayOfSumOfValueInGroupLevelOne = [];
    if (cols.length == 2) {
      dataGrouped.forEach((el_1) => {
        const res = el_1[1].reduce((acc, el_2) => {
          return el_2[1][0][metrica] + acc;
        }, 0);
        arrayOfSumOfValueInGroupLevelOne.push(res);
      });
    }
    let CountGroupLevelTwo = 0; // количество групп второго уровня (для рассчёта ширины групп первого уровня в режиме stacked)
    let arrayOfSumOfValueInGroupLevelTwo = []; // массив из сумм в группах второго порядка (для рассчёта масштабирования в режиме stacked)
    if (cols.length == 3) {
      dataGrouped.forEach((el_1) => {
        CountGroupLevelTwo += el_1[1].length;
        let res2 = 0;
        el_1[1].forEach((el_2) => {
          res2 += el_2[1].reduce((acc, el_3) => {
            return el_3[1][0][metrica] + acc;
          }, 0);
        });
        arrayOfSumOfValueInGroupLevelTwo.push(res2);
      });
    }
    console.log("CountGroupLevelTwo", CountGroupLevelTwo);
    console.log(
      "arrayOfSumOfValueInGroupLevelTwo",
      arrayOfSumOfValueInGroupLevelTwo
    );

    console.log("data", data);
    //console.log("arrayLenghtGroups", arrayLenghtGroups);
    console.log("dataGrouped", dataGrouped);
    //console.log("arrayOfAllValue", arrayOfAllValue);
    //console.log("arrayOfDifferentType", arrayOfDifferentType);
    console.log(
      "arrayOfSumOfValueInGroupLevelOne",
      arrayOfSumOfValueInGroupLevelOne
    );

    ////////////////////////////////////////////////////////////////////////
    //вычисляем максимальное значение в метрике
    const maximumInDateArray = d3.max(arrayOfAllValue); // максимальное значение в данных
    const maximumInSumOfValueInGroup =
      cols.length === 2
        ? d3.max(arrayOfSumOfValueInGroupLevelOne)
        : d3.max(arrayOfSumOfValueInGroupLevelTwo); // максимальное значение среди сумм по группам первого уровня
    const paddingBetweenGroups = 10; // отступ между группами
    const heightChart = height - paddingBottom - paddingTop; // высота области чарта, который мы рисуем
    const widthChart = width - paddingLeft - paddingRight; // ширина области чарта
    const padding = 0; // отступ между прямоугольниками

    let heightRect; // высота прямоугольника в горизонтальном режиме
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
    const heightStackedGroup = heightChart / dataGrouped.length;
    const heightStackedGroupLevelTwo = heightChart / CountGroupLevelTwo;
    //console.log("heightStackedGroupLevelTwo", heightStackedGroupLevelTwo);

    let widthRect; // ширина прямоугольника в вертикальном режиме режиме
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
    const widthStackedGroup = widthChart / dataGrouped.length;
    const widthStackedGroupLevelTwo = widthChart / CountGroupLevelTwo;

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
    const widthScale = d3.scaleLinear(
      [0, maximumInDateArray],
      [0, widthChart - paddingRight]
    );
    const widthStackedScale = d3.scaleLinear(
      [0, maximumInSumOfValueInGroup],
      [0, widthChart - paddingRight]
    );
    const heightScale = d3.scaleLinear(
      [0, maximumInDateArray],
      [heightChart, 0]
    );
    //console.log("maximumInSumOfValueInGroup", maximumInSumOfValueInGroup);
    const heightStackedScale = d3.scaleLinear(
      [0, maximumInSumOfValueInGroup],
      //[heightChart, 0]
      [0, heightChart]
    );
    const heightStackedScaleForAxis = d3.scaleLinear(
      [0, maximumInSumOfValueInGroup],
      //[heightChart, 0]
      [heightChart, 0]
    );

    function culcLabelPosition(d, mode = "group") {
      // позиция подписей
      if (mode === "stacked") {
        if (labelPosition === "end") {
          return widthStackedScale(d);
        } else if (labelPosition === "middle") {
          return widthStackedScale(d) / 2;
        } else {
          return 0;
        }
      } else {
        if (labelPosition === "end") {
          return widthScale(d) + 2;
        } else if (labelPosition === "middle") {
          return widthScale(d) / 2;
        } else {
          return 2;
        }
      }
    }
    function culcLabelPositionForVertical(d, mode = "group") {
      // позиция подписей для вертикального отобоажения
      if (mode === "stacked") {
        if (labelPosition === "end") {
          return heightStackedScale(d);
        } else if (labelPosition === "middle") {
          return heightStackedScale(d) / 2;
        } else {
          return 0;
        }
      } else {
        if (labelPosition === "end") {
          return heightScale(d) - 2;
        } else if (labelPosition === "middle") {
          return heightChart - (heightChart - heightScale(d)) / 2;
        } else {
          return heightChart - 3;
        }
      }
    }

    if (element.select(".MyChart")) {
      element.select(".MyChart").remove();
    }
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

    ///********************************************************************************** */
    /////////////////////горизонтальный режим////////////////////////////////////////////////////////////////////////
    if (orientation === "horizontal") {
      let xAxis;
      let xAxisTicks;
      if (visualGroupMode === "stacked") {
        /////////////////////////////////staked
        xAxis = d3.axisBottom(widthStackedScale).ticks(10); // ось Х
        xAxisTicks = d3 //ось Х для сетки
          .axisBottom(widthStackedScale)
          .tickSize(-heightChart)
          .ticks(10)
          .tickArguments([]);
      } else {
        xAxis = d3.axisBottom(widthScale).ticks(10); // ось Х
        xAxisTicks = d3 //ось Х для сетки
          .axisBottom(widthScale)
          .tickSize(-heightChart)
          .ticks(10)
          .tickArguments([]);
      }
      ///////////////////////////////////////////////////////////////////////////////////////////////////
      const xAxisTicksGroup = canvas // группа для сетки
        .append("g")
        .attr("class", "XaxisTicks")
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + heightChart + ")"
        );
      xAxisTicksGroup.call(xAxisTicks).style("opacity", "0.1");

      const xAxisGroup = canvas //группа для оси х
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
          let res;
          if (visualGroupMode === "stacked") {
            /////////////////////////////////staked
            if (cols.length === 3) {
              res = positionPrevBlock;
              positionPrevBlock =
                positionPrevBlock + heightStackedGroupLevelTwo * d[1].length;
            } else {
              res = heightStackedGroup * i;
            }
          } else {
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

            res = positionPrevBlock;
            positionPrevBlock = positionPrevBlock + height;
          }
          return "translate(0," + res + ")";
        });
        // подписи слева
        const labelForGroup = d3
          .selectAll(".groupOfRect")
          .append("text")
          .text((d) => {
            return d[0];
          })
          .attr("dy", (d) => (d[1].length * heightRect) / 2)
          .attr("dx", -paddingInfoLabel)
          .attr("text-anchor", "end")
          .attr("class", "yAxisLabel");

        if (visualGroupMode === "stacked") {
          /////////////////////////////////staked
          if (cols.length === 2) {
            labelForGroup.attr("dy", heightStackedGroup / 2);
          } else {
            labelForGroup.attr(
              "dy",
              (d, i) => (heightStackedGroupLevelTwo * d[1].length) / 2
            );
          }
        }

        if (cols.length > 2) {
          //////////////////////////////////////////////////////////////////////in level 2
          const groupOfRectNodes = groupOfRect.nodes();
          dataGrouped.forEach((element, i) => {
            createGroupLevel2(element[1], groupOfRectNodes[i]);
          });
          //////////////////////////////////////////////////////////////////////rect in level 2
          const groupOfRectLevelTwoNodes = d3.selectAll(".groupOfRectLevelTwo");

          let j = 0;
          dataGrouped.forEach((element) => {
            element[1].forEach((element2) => {
              if (visualGroupMode === "stacked") {
                /////////////////////////////////staked
                createStackedRect(
                  element2[1],
                  groupOfRectLevelTwoNodes.nodes()[j],
                  false,
                  false
                );
                j++;
              } else {
                createRect(
                  element2[1],
                  groupOfRectLevelTwoNodes.nodes()[j],
                  false,
                  true
                );
                j++;
              }
            });
          });
        } else {
          //////////////////////////////////////////////////////////////////////rect in level 1
          const groupOfRectNodes = d3.selectAll(".groupOfRect");
          dataGrouped.forEach((element, i) => {
            if (visualGroupMode === "stacked") {
              /////////////////////////////////staked
              createStackedRect(
                element[1],
                groupOfRectNodes.nodes()[i],
                false,
                true
              );
            } else {
              createRect(element[1], groupOfRectNodes.nodes()[i], false, true);
            }
          });
        }
      } else {
        // rect in level 0
        if (visualGroupMode === "stacked") {
          /////////////////////////////////staked
        } else {
          createRect(dataGrouped, d3.select(".rectCanvas").node());
        }
      }
      ////////////////////////////////////////////////////////////////////////////////////создание подгрупп второго уровня вложенности
      function createGroupLevel2(data, node) {
        //
        //console.log("inpute data in createGroupLevel2", data);
        //console.log("inpute node in createGroupLevel2", node);
        let positionPrevBlockIncreateGroupLevel2 = 0;
        const groupOfRectLevelTwo = d3
          .select(node)
          .selectAll(".groupOfRectLevelTwo")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "groupOfRectLevelTwo");

        if (visualGroupMode === "stacked") {
          /////////////////////////////////staked
          groupOfRectLevelTwo.attr("transform", (d, i) => {
            const res2 = positionPrevBlockIncreateGroupLevel2;
            positionPrevBlockIncreateGroupLevel2 += heightStackedGroupLevelTwo;
            return "translate(0," + res2 + ")";
          });
        } else {
          groupOfRectLevelTwo.attr("transform", (d, i) => {
            const res = positionPrevBlockIncreateGroupLevel2;
            positionPrevBlockIncreateGroupLevel2 =
              positionPrevBlockIncreateGroupLevel2 +
              d[1].length * heightRect +
              paddingBetweenGroups;
            return "translate(0," + res + ")";
          });
        }
      }
      ////////////////////////////////////////////////////////////////////////////////////функция создания прямоугольников
      //функция создания прямоугольников
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
          .attr("fill", (d) => {
            return colorScale(d[0]) + "";
          })
          .attr("opacity", "0.6")
          .attr("width", 0)
          .attr("height", heightRect)
          .attr("y", (d, i) => {
            return heightRect * i;
          })
          .attr("class", "rectItem");

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
      //////////////////////////////////////////////////////////////////////////создание rect для stacked
      //создание rect для stacked
      function createStackedRect(
        data,
        node,
        infoLabelIsVisible = true,
        valueLabelIsVisible = true
      ) {
        //console.log("data inpute in createRect", data);
        let positionInStack = 0;
        const dataModification = data.map((item) => {
          const res = [item[0], item[1][0][metrica], positionInStack];
          positionInStack += widthStackedScale(item[1][0][metrica]);
          return res;
        });
        //console.log("dataModification", dataModification);
        //console.log("node inpute in createRect", node);
        //console.log("index inpute in createRect", index);
        const canvasInFunction = d3.select(node);
        const rectAndLabel = canvasInFunction //rects
          .selectAll("rectAndLabel")
          .data(dataModification)
          .enter()
          .append("g")
          .attr("class", "rectAndLabel");

        const rectInFunc = rectAndLabel
          .append("rect")
          //.attr("fill", mainColor)
          .attr("fill", (d) => {
            return colorScale(d[0]) + "";
          })
          .attr("opacity", "0.6")
          .attr("width", (d) => widthStackedScale(d[1]))
          //.attr("y", 0)
          .attr("x", (d) => d[2])
          .attr("class", "rectItem");

        if (cols.length === 3) {
          //rectInFunc.attr("height", heightStackedGroupLevelTwo);
          rectInFunc.attr("height", heightStackedGroupLevelTwo);
        } else {
          rectInFunc.attr("height", heightStackedGroup);
        }

        if (infoLabelIsVisible) {
          rectAndLabel // infoLabel
            .append("text")
            .text((d) => {
              return d[0];
            })
            .attr("font-size", yAxisFontSize)
            .attr("dx", (d) => d[2] + culcLabelPosition(d[1], "stacked"))
            //.attr("text-anchor", "middle")
            .attr("dy", heightStackedGroup / 2)
            .attr("class", "infoLabel");
        }
        if (valueLabelIsVisible) {
          rectAndLabel // valueLabel
            .append("text")
            .text((d) => {
              return d[1];
            })
            .attr("font-size", labelFontSize)
            .attr("fill", labelColor)
            .attr("x", (d) => d[2] + culcLabelPosition(d[1], "stacked"))
            .attr("text-anchor", "start")
            .attr("dy", heightStackedGroup / 2)
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
      /////////////////////////////////staked
      if (visualGroupMode === "stacked") {
      } else {
        rects
          .selectAll(".rectItem")
          .transition()
          .attr("width", (d) => {
            return Number(widthScale(d[1][0][metrica]));
          })
          .duration(1000);
      }
      /* rects.selectAll(".rectItem").on("mouseenter", function () {
        d3.select(this).transition().duration(300).attr("opacity", "1");
        //const parentGroup = d3.select(this).node().parentNode;
      });
      rects.selectAll(".rectItem").on("mouseleave", function () {
        d3.select(this).transition().duration(300).attr("opacity", "0.6");
        // const parentGroup = d3.select(this).node().parentNode;
      }); */
    } else {
      ///////////********///////////////////////////////////////////////////////////////////////////////
      //////////////////////вертикальный режим///////////////////////////////////////////////////////////////////вертикальный
      ///////////////////////////////////////////////////////////////////////////////////////////////
      let yAxis;
      let yAxisTicks;
      if (visualGroupMode === "stacked") {
        yAxis = d3.axisLeft(heightStackedScaleForAxis).ticks(10); // ось Y
        yAxisTicks = d3 //ось Y для сетки
          .axisLeft(heightStackedScaleForAxis)
          .tickSize(-widthChart)
          .ticks(10)
          .tickArguments([]);
      } else {
        yAxis = d3.axisLeft(heightScale).ticks(10); // ось Y
        yAxisTicks = d3 //ось Y для сетки
          .axisLeft(heightScale)
          .tickSize(-widthChart)
          .ticks(10)
          .tickArguments([]);
      }
      ////////////////////////////////////////////////
      const yAxisTicksGroup = canvas // группа для сетки
        .append("g")
        .attr("class", "YaxisTicks")
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + paddingTop + ")"
        );
      yAxisTicksGroup.call(yAxisTicks).style("opacity", "0.1");

      const yAxisGroup = canvas //группа  для оси y
        .append("g")
        .attr("class", "Yaxis")
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
        .attr(
          "transform",
          "translate(" + paddingLeft + ", " + paddingTop + ")"
        );

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
          let res;
          if (visualGroupMode === "stacked") {
            /////////////////////////////////staked
            if (cols.length === 3) {
              res = positionPrevBlock;
              positionPrevBlock =
                positionPrevBlock + widthStackedGroupLevelTwo * d[1].length;
            } else {
              res = widthStackedGroup * i;
            }
          } else {
            let sum = 0;
            if (cols.length === 3) {
              d[1].forEach((el) => {
                sum += el[1].length;
              });
            }
            let width =
              sum > 0
                ? sum * (widthRect + padding) +
                  paddingBetweenGroups +
                  paddingBetweenGroups * d[1].length
                : d[1].length * (widthRect + padding) + paddingBetweenGroups;

            res = positionPrevBlock;
            positionPrevBlock = positionPrevBlock + width;
          }
          return "translate(" + res + ",0)";
        });
        // подписи групп снизу
        const labelForGroup = d3
          .selectAll(".groupOfRect")
          .append("text")
          .text((d) => {
            return d[0];
          })
          .attr("dy", heightChart + paddingInfoLabel)
          .attr("dominant-baseline", "text-before-edge")
          .attr("class", "yAxisLabel")
          .attr("font-size", xAxisFontSize);
        if (visualGroupMode === "stacked") {
          /////////////////////////////////staked
          if (cols.length === 2) {
            labelForGroup.attr("dx", widthStackedGroup / 2);
          } else {
            labelForGroup.attr(
              "dx",
              (d, i) => (widthStackedGroupLevelTwo * d[1].length) / 2
            );
          }
        }

        if (cols.length > 2) {
          //////////////////////////////////////////////////////////////////////in level 2
          const groupOfRectNodes = groupOfRect.nodes();
          dataGrouped.forEach((element, i) => {
            createGroupLevel2(element[1], groupOfRectNodes[i]);
          });
          //////////////////////////////////////////////////////////////////////rect in level 2
          const groupOfRectLevelTwoNodes = d3.selectAll(".groupOfRectLevelTwo");

          let j = 0;
          dataGrouped.forEach((element) => {
            element[1].forEach((element2) => {
              if (visualGroupMode === "stacked") {
                /////////////////////////////////staked
                createStackedRect(
                  element2[1],
                  groupOfRectLevelTwoNodes.nodes()[j],
                  false,
                  false
                );
                j++;
              } else {
                createRect(
                  element2[1],
                  groupOfRectLevelTwoNodes.nodes()[j],
                  false,
                  true
                );
                j++;
              }
            });
          });
        } else {
          //////////////////////////////////////////////////////////////////////rect in level 1
          const groupOfRectNodes = d3.selectAll(".groupOfRect");
          dataGrouped.forEach((element, i) => {
            if (visualGroupMode === "stacked") {
              /////////////////////////////////staked
              createStackedRect(
                element[1],
                groupOfRectNodes.nodes()[i],
                false,
                true
              );
            } else {
              createRect(element[1], groupOfRectNodes.nodes()[i], false, true);
            }
          });
        }
      } else {
        // rect in level 0
        if (visualGroupMode === "stacked") {
          /////////////////////////////////staked
        } else {
          createRect(dataGrouped, d3.select(".rectCanvas").node());
        }
      }
      ////////////////////////////////////////////////////////////////////////////////////создание подгрупп второго уровня вложенности
      //создание подгрупп второго уровня вложенности
      function createGroupLevel2(data, node) {
        //
        //console.log("inpute data in createGroupLevel2", data);
        //console.log("inpute node in createGroupLevel2", node);
        let positionPrevBlockIncreateGroupLevel2 = 0;
        const groupOfRectLevelTwo = d3
          .select(node)
          .selectAll(".groupOfRectLevelTwo")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "groupOfRectLevelTwo");

        if (visualGroupMode === "stacked") {
          /////////////////////////////////staked
          groupOfRectLevelTwo.attr("transform", (d, i) => {
            const res2 = positionPrevBlockIncreateGroupLevel2;
            positionPrevBlockIncreateGroupLevel2 += widthStackedGroupLevelTwo;
            return "translate(" + res2 + ",0)";
          });
        } else {
          groupOfRectLevelTwo.attr("transform", (d, i) => {
            const res = positionPrevBlockIncreateGroupLevel2;
            positionPrevBlockIncreateGroupLevel2 =
              positionPrevBlockIncreateGroupLevel2 +
              d[1].length * widthRect +
              paddingBetweenGroups;
            return "translate(" + res + ",0)";
          });
        }
      }
      ////////////////////////////////////////////////////////////////////////////////////функция создания прямоугольников
      //функция создания прямоугольников
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
          .attr("fill", (d) => {
            return colorScale(d[0]) + "";
          })
          .attr("opacity", "0.6")
          .attr("width", widthRect)
          .attr("height", 0)
          .attr("x", (d, i) => {
            return widthRect * i;
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
        }
      }
      //////////////////////////////////////////////////////////////////////////создание rect для stacked
      //создание rect для stacked
      function createStackedRect(
        data,
        node,
        infoLabelIsVisible = true,
        valueLabelIsVisible = true
      ) {
        //console.log("data inpute in createRect", data);
        let positionInStack = 0;
        const dataModification = data.map((item) => {
          const res = [item[0], item[1][0][metrica], positionInStack];
          positionInStack += heightStackedScale(item[1][0][metrica]);
          return res;
        });
        console.log("dataModification", dataModification);
        //console.log("node inpute in createRect", node);
        //console.log("index inpute in createRect", index);
        const canvasInFunction = d3.select(node);
        const rectAndLabel = canvasInFunction //rects
          .selectAll("rectAndLabel")
          .data(dataModification)
          .enter()
          .append("g")
          .attr("class", "rectAndLabel");

        const rectInFunc = rectAndLabel
          .append("rect")
          //.attr("fill", mainColor)
          .attr("fill", (d) => {
            return colorScale(d[0]) + "";
          })
          .attr("opacity", "0.6")
          .attr("height", (d) => heightStackedScale(d[1]))
          //.attr("y", 0)
          .attr("y", (d) => heightChart - heightStackedScale(d[1]) - d[2])
          .attr("class", "rectItem");

        if (cols.length === 3) {
          //rectInFunc.attr("height", heightStackedGroupLevelTwo);
          rectInFunc.attr("width", widthStackedGroupLevelTwo);
        } else {
          rectInFunc.attr("width", widthStackedGroup);
        }

        if (infoLabelIsVisible) {
          rectAndLabel // infoLabel
            .append("text")
            .text((d) => {
              return d[0];
            })
            .attr("font-size", yAxisFontSize)
            .attr("dy", (d) => {
              //console.log
              return (
                heightChart -
                heightStackedScale(d[1]) -
                d[2] +
                culcLabelPosition(d[1], "stacked")
              );
            })
            //.attr("text-anchor", "middle")
            .attr("dx", widthStackedGroup / 2)
            .attr("class", "infoLabel");
        }
        if (valueLabelIsVisible) {
          rectAndLabel // valueLabel
            .append("text")
            .text((d) => {
              return d[1];
            })
            .attr("font-size", labelFontSize)
            .attr("fill", labelColor)
            .attr(
              "y",
              (d) =>
                heightChart -
                d[2] -
                culcLabelPositionForVertical(d[1], "stacked")
            )
            //.attr("text-anchor", "start")
            .attr("dominant-baseline", "auto")
            .attr("dx", widthStackedGroup / 2)
            .attr("class", "valueLabel");
        }
      }
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
      }
      ////////////////////////////////////////////////// animation
      /////////////////////////////////staked
      if (visualGroupMode === "stacked") {
      } else {
        d3.selectAll(".rectItem")
          .transition()
          .attr("height", (d) => {
            return Number(heightChart - heightScale(d[1][0][metrica]));
          })
          .duration(1000);
      }
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

    canvas
      .append("text")
      .attr("class", "tooltip")
      .attr("style", "position: absolute; opacity: 0;");
    d3.selectAll(".rectItem").on("mouseenter", function (el) {
      d3.select(this).transition().duration(300).attr("opacity", "1");
    });
    d3.selectAll(".rectItem").on("mouseleave", function () {
      d3.select(this).transition().duration(300).attr("opacity", "0.6");
      // const parentGroup = d3.select(this).node().parentNode;
    });
    d3.selectAll(".rectItem")
      .on("mouseover", (d) => {
        d3.select(".tooltip").style("opacity", 1);
      })
      .on("mouseout", function (d) {
        d3.select(".tooltip").style("opacity", 0);
      })
      .on("mousemove", function (d) {
        let res = d.path[0].__data__[0];
        if (d.path[2]?.__data__) {
          res = res + "   " + d.path[2].__data__[0];
        }
        if (d.path[3]?.__data__) {
          res = res + "   " + d.path[3].__data__[0];
        }
        d3.select(".tooltip")
          .attr("transform", "translate(" + d.pageX + "," + d.pageY + ")")
          .text(res);
      });
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

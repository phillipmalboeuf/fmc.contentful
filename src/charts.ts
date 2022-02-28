import { Bullet, Button, Circle, Color, color, DataProcessor, Label, Legend, LinearGradient, p100, p50, percent, Root, Theme, Tooltip } from '@amcharts/amcharts5'
import { XYChart, ValueAxis, CategoryAxis, AxisRendererX, ColumnSeries, AxisRendererY, LineSeries, AxisLabel, XYCursor } from '@amcharts/amcharts5/xy'
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
// import am5themes_Dark from "@amcharts/amcharts5/themes/Dark"
import am5locales_fr from "@amcharts/amcharts5/locales/fr_FR"
import am5locales_en from "@amcharts/amcharts5/locales/en_CA"
import { FunnelSeries, PieChart, PieSeries, PyramidSeries, SlicedChart } from '@amcharts/amcharts5/percent'


export function init(element: HTMLElement, locale: string) {
  let root = Root.new(element)
  root._logo.dispose()

  const myTheme = Theme.new(root)

  myTheme.rule("Label").setAll({
    fill: color("#0E0E0E"),
    fontSize: "0.88em",
    fontFamily: "sans-serif"
  })

  myTheme.rule("Grid").setAll({
    stroke: color("#0E0E0E"),
    strokeOpacity: 0.5
  })

  root.locale = locale === 'fr' ? am5locales_fr : am5locales_en

  root.setThemes([
    am5themes_Animated.new(root),
    // am5themes_Dark.new(root),
    myTheme
  ]);

  return root
}



export function createColumns(element: HTMLElement, seriesData: any[], vertical: boolean, stacked: boolean, min: number, max: number, title: string, firstColor: string, secondColor: string, locale: string) {
  const keys = Object.keys(seriesData[0]).filter(key => !['Category'].includes(key))

  let root = init(element, locale)
  let chart = root.container.children.push(
    XYChart.new(root, {
      panY: false,
      panX: vertical,
      layout: root.verticalLayout,
      paddingLeft: 0,
      paddingRight: 0
    })
  )

  chart.getNumberFormatter().set("numberFormat", "#.#s")

  let valueAxis = (vertical ? chart.yAxes : chart.xAxes).push(
    ValueAxis.new(root, {
      min,
      max,
      renderer: (vertical ? AxisRendererY : AxisRendererX).new(root, {
        minGridDistance: 30,
      })
    })
  )

  if (min > 0) {
    valueAxis.labelsContainer.children.push(Label.new(root, {
      text: 'truncated',
      y: percent(100),
      x: -50,
      fontSize: '0.66em'
    }))
  }
  
  title && (vertical ? chart.leftAxesContainer.children.unshift(Label.new(root, {
    text: title,
    rotation: -90,
    y: percent(50),
    centerX: percent(50),
    fontSize: '1em'
  })) : chart.bottomAxesContainer.children.push(Label.new(root, {
    text: title,
    rotation: 0,
    x: percent(50),
    centerX: percent(50),
    fontSize: '1em'
  })))

  let renderer = (vertical ? AxisRendererX : AxisRendererY).new(root, {
    minGridDistance: 40,
    ...seriesData.length > 4 ? {} : {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9
    },
    inversed: !vertical
  })
  renderer.grid.template.setAll({
    strokeOpacity: 0
  })
  
  renderer.labels.template.setAll({
    rotation: 0,
    ...seriesData.length > 6 ? {
      // textAlign: 'right',
      rotation: -80,
    } : {}
  })
  
  let categoryAxis = (vertical ? chart.xAxes : chart.yAxes).push(
    CategoryAxis.new(root, {
      renderer,
      categoryField: "Category",
    })
  )
  categoryAxis.data.setAll(seriesData)

  keys.forEach((name, i) => {
    // const hsl = color(couleur).toHSL()
    // hsl.h += i * 0.02

    const fill = keys.length > 1
      ? Color.interpolate((keys.length - 1 - i) / (keys.length-1), color(firstColor), color(secondColor))
      : color(secondColor)

    // let gradient = LinearGradient.new(root, {
    //   stops: [{
    //     color: Color.fromHSL(hsl.h, hsl.s, hsl.l)
    //   }, {
    //     color: Color.fromHSL(hsl.h, hsl.s, hsl.l),
    //     opacity: 0
    //   }]
    // });

    let series = chart.series.push(ColumnSeries.new(root, {
      name,
      // sequencedInterpolation: true,
      stacked,
      ...vertical ? 
      {
        xAxis: categoryAxis,
        yAxis: valueAxis,
        valueYField: name,
        categoryXField: "Category",
      }
      : {
        xAxis: valueAxis,
        yAxis: categoryAxis,
        valueXField: name,
        categoryYField: "Category",
      },
      tooltip: Tooltip.new(root, {}),
    }))

    series.columns.template.setAll({
      fill,
      strokeOpacity: 0,
      ...seriesData.length > 4
        ? {
          width: percent(88),
        }
        : {
          width: percent(120),
        },
      ...vertical ? {
        cornerRadiusTL: 12,
        cornerRadiusTR: 12,
      } : {
        cornerRadiusTR: 12,
        cornerRadiusBR: 12,
      },
      showTooltipOn: 'hover',
      tooltipText: `${keys.length > 1 ? '{name}, ' : ''}${vertical ? `{categoryX}: {valueY}` : `{categoryY}: {valueX}`}`
    })

    series.bullets.push(function() {
      return Bullet.new(root, {
        locationX: vertical ? 0.5 : 1,
        locationY: vertical ? 1 : 0.5,
        sprite: Label.new(root, {
          centerX: vertical ? percent(50) : percent(10),
          centerY: vertical ? percent(88) : percent(50),
          text: vertical ? "{valueY}" : "{valueX}",
          populateText: true,
        })
      });
    });

    series.data.processor = DataProcessor.new(root, {
      numericFields: [name]
    })
    
    series.data.setAll(seriesData)
  })

  if (keys.length > 1) {
    let legend = chart.children.push(Legend.new(root, {
      paddingTop: 20
    }));
    legend.data.setAll(chart.series.values)
  }

  return root
}

export function createCurve(element: HTMLElement, seriesData: any[], vertical: boolean, stacked: boolean, min: number, max: number, title: string, firstColor: string, secondColor: string, locale: string) {
  let root = init(element, locale)
  let chart = root.container.children.push(
    XYChart.new(root, {
      panY: false,
      layout: vertical ? root.verticalLayout : root.horizontalLayout,
      cursor: XYCursor.new(root, {}),
      paddingLeft: 0,
      paddingRight: 0,
    })
  )

  let valueAxis = chart.yAxes.push(
    ValueAxis.new(root, {
      min,
      max,
      renderer: AxisRendererY.new(root, {})
    })
  )

  if (min > 0) {
    valueAxis.labelsContainer.children.push(Label.new(root, {
      text: 'tronqué',
      y: percent(100),
      x: -50,
      fontSize: '0.66em'
    }))
  }
  
  title && chart.leftAxesContainer.children.unshift(Label.new(root, {
    text: title,
    rotation: -90,
    y: percent(50),
    centerX: percent(50),
    fontSize: '0.75em'
  }))

  let renderer = AxisRendererX.new(root, {
    minGridDistance: 30,
    // inversed: !vertical
  })
  renderer.grid.template.setAll({
    strokeOpacity: 0
  })

  let categoryAxis = chart.xAxes.push(
    CategoryAxis.new(root, {
      renderer,
      categoryField: "Category",
    })
  )
  categoryAxis.data.setAll(seriesData)


  const keys = Object.keys(seriesData[0]).filter(key => !['Category', 'Date'].includes(key))
  

  keys.forEach((name, i) => {

    const fill = Color.interpolate((keys.length - 1 - i) / (keys.length-1), color(firstColor), color(secondColor))
    
    let series = chart.series.push(LineSeries.new(root, {
      name,
      xAxis: categoryAxis,
      yAxis: valueAxis,
      valueYField: name,
      categoryXField: "Category",
      fill,
      stroke: fill,
      tooltip: Tooltip.new(root, {
        labelText: `${keys.length > 1 ? '{name}, ' : ''}{categoryX}: {valueY}`
      }),
      // tooltipText: 
    }))

    series.strokes.template.setAll({
      // stroke: color(couleur),
      
      strokeWidth: 3,
      
    })

    series.bullets.push(function() {
      return Bullet.new(root, {
        sprite: Circle.new(root, {
          radius: 4,
          fill: series.get("fill")
        })
      })
    })

    series.data.processor = DataProcessor.new(root, {
      numericFields: [name]
    })
    
    series.data.setAll(seriesData)
  })

  if (keys.length > 1) {
    let legend = chart.children.push(Legend.new(root, {
      paddingTop: 20
    }));
    legend.data.setAll(chart.series.values)
  }

  return root
}

export function createPyramide(element: HTMLElement, seriesData: any[], vertical: boolean, stacked: boolean, min: number, max: number, title: string, firstColor: string, secondColor: string, locale: string) {
  const keys = Object.keys(seriesData[0]).filter(key => !['Category'].includes(key))

  let root = init(element, locale)
  let chart = root.container.children.push(
    SlicedChart.new(root, {
      layout: root.verticalLayout,
      paddingLeft: 0,
      paddingRight: 0,
    })
  )
  
  // title && chart.seriesContainer.children.push(Label.new(root, {
  //   text: title,
  //   rotation: -90,
  //   y: percent(50),
  //   centerX: percent(50),
  //   fontSize: '0.75em'
  // }))

  keys.forEach((name, i) => {
    let series = chart.series.push(FunnelSeries.new(root, {
      name,
      categoryField: "Category",
      valueField: name,
      orientation: vertical ? "vertical" : "horizontal",
      alignLabels: false,
    }))

    series.data.processor = DataProcessor.new(root, {
      numericFields: [name]
    })

    series.slices.template.setAll({
      // fill: color(firstColor),
      // stroke: color(firstColor),
      // strokeWidth: 3,
      fillOpacity: 0,
      strokeOpacity: 0
    })

    series.links.template.setAll({
      // fill: color(firstColor),
      fillOpacity: 0
    })

    series.labels.template.setAll({
      text: "[fontSize: 1em #0E0E0E]{category}:[/][bold] {value}" + (title ? title : '') + '[/]',
      rotation: 0,
      templateField: "labelSettings",
    });

    series.data.setAll(seriesData.map(data => ({
      ...data,
      labelSettings: {
        fontSize: `${data[name]/6.66}em`,
        fill: Color.interpolate(((data[name] - (min || 0)) * 100) / ((max || 100) - (min || 0)) / 100, color(firstColor), color(secondColor))
      }
    })))
  })

  return root
}

export function createTarte(element: HTMLElement, seriesData: any[], vertical: boolean, stacked: boolean, min: number, max: number, title: string, firstColor: string, secondColor: string, locale: string) {
  let root = init(element, locale)
  

  const keys = Object.keys(seriesData[0]).filter(key => !['Category'].includes(key))

  let legend = root.container.children.push(Legend.new(root, {
    layout: root.verticalLayout,
    y: percent(100),
    centerY: percent(100)
  }))

  keys.forEach((name, i) => {
    let chart = root.container.children.push(
      PieChart.new(root, {
        layout: root.verticalLayout,
        // innerRadius: percent(10),
        // paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        ...{
          paddingBottom: seriesData.length * 23,
          width: percent(100/keys.length),
          x: percent((100/keys.length)*i)
        }
      })
    )

    chart.children.unshift(Label.new(root, {
      text: name,
      y: 0,
      textAlign: 'center',
      x: percent(50),
      fontSize: '1em'
    }))

    title && chart.children.unshift(Label.new(root, {
      text: title,
      rotation: -90,
      y: percent(50),
      centerX: percent(50),
      fontSize: '0.75em'
    }))


    let series = chart.series.push(PieSeries.new(root, {
      name,
      categoryField: "Category",
      valueField: name,
      // alignLabels: false,
      legendLabelText: "{category}",
      legendValueText: ""
    }))

    series.data.processor = DataProcessor.new(root, {
      numericFields: [name]
    })

    series.slices.template.setAll({
      fill: color(firstColor),
      stroke: color('#0E0E0E'),
      strokeWidth: 1,
      strokeOpacity: 0,
      templateField: 'sliceSettings',
      tooltipText: "{category}: {value}"
    })

    series.labels.template.setAll({
      text: "{value}",
      textType: "adjusted",
      inside: false,
      radius: 10,
    })

    series.data.setAll(seriesData.map((data, index) => ({
      ...data,
      sliceSettings: {
        fill: Color.interpolate(index / seriesData.length, color(firstColor), color(secondColor))
      }
    })))

    i === 0 && legend.data.pushAll(series.dataItems)
  })

  

  return root
}
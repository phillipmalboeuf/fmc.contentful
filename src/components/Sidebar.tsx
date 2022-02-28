import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { PlainClientAPI } from 'contentful-management';
import { Paragraph } from '@contentful/f36-components';
import { SidebarExtensionSDK } from '@contentful/app-sdk';

import { createCurve, createColumns, createPyramide, createTarte } from '../charts'
import { Exporting } from '@amcharts/amcharts5/plugins/exporting'
import type { Root } from '@amcharts/amcharts5'

interface SidebarProps {
  sdk: SidebarExtensionSDK;
  cma: PlainClientAPI;
}

export function csvToChartData(data: string) {
  const delimiter = data.includes('\t') ? '\t' : ','
  const headers = data.slice(0, data.indexOf("\n")).split(delimiter)

  const rows = data.slice(data.indexOf("\n") + 1).split("\n")

  const arr = rows.map(function (row) {
    if (delimiter === '\t') { row = row.replace(/,/g, '.') }
    const values = row.split(delimiter)
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index]
      return object
    }, {})
    return el
  })

  return arr
}

export function csvToMatrix(data: string) {
  const delimiter = data.includes('\t') ? '\t' : ','
  var resultArray = [];
  data.split("\n").forEach(function(row) {
      var rowArray = [];
      row.split(delimiter).forEach(function(cell) {
          rowArray.push(cell);
      });
      resultArray.push(rowArray);
  });
  return resultArray;
}

export function matrixToCSV(data: [][]) {
  return data.map(d => d.join('\t')).join('\n');
}

const Sidebar: FunctionComponent<SidebarProps> = ({ sdk }) => {
  const element = useRef<HTMLElement>()
  const [exporting, setExporting] = useState<Exporting>()

  useEffect(() => {
    const { type, alignment, data, min, max, axeTitle, stacked } = sdk.entry.fields
    let root: Root

    if (element.current) {
    const dataSource = csvToChartData(data.getValue())

    switch (type.getValue()) {
      case 'Columns':
        root = createColumns(element.current, dataSource, alignment.getValue() !== 'Horizontal', stacked.getValue(), min.getValue(), max.getValue(), axeTitle.getValue(), '#2BFFF5', '#044554', undefined)
        // chart.appear(1000, 100)
        break

      case 'Curve':
        root = createCurve(element.current, dataSource, alignment.getValue() !== 'Horizontal', stacked.getValue(), min.getValue(), max.getValue(), axeTitle.getValue(), '#2BFFF5', '#044554', undefined)
        // chart.appear(1000, 100)
        break

      // case 'Big numbers':
      //   chart = createPyramide(element, dataSource, alignment !== 'Horizontal', stacked, min, max, axeTitle, '#2BFFF5', '#044554', $page.params.locale)
      //   chart.appear(1000, 100)
      //   break

      case 'Pie':
        root = createTarte(element.current, dataSource, alignment.getValue() !== 'Horizontal', stacked.getValue(), min.getValue(), max.getValue(), axeTitle.getValue(), '#2BFFF5', '#044554', undefined)
        // chart.appear(1000, 100)
        break
    
      default:
        break
    }

    if (root) {
      setExporting(Exporting.new(root, {
        filePrefix: sdk.entry.fields.id.getValue(),
        dataSource
      }))
    }
    }
  }, [sdk.entry.fields, element])

  return <>
    <figure ref={element} style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      paddingBottom: '42%',
      margin: 0
    }} />

  </>
}

export default Sidebar;

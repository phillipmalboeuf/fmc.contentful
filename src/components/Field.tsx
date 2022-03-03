import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { PlainClientAPI } from 'contentful-management';
import { Paragraph, Button } from '@contentful/f36-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';

// import jspreadsheet from "jspreadsheet"
// import "/node_modules/jspreadsheet/dist/jspreadsheet.css";
// import "/node_modules/jsuites/dist/jsuites.css";
import 'handsontable/dist/handsontable.full.css'
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';

import { createCurve, createColumns, createPyramide, createTarte } from '../charts'
import { Exporting } from '@amcharts/amcharts5/plugins/exporting'
import type { Root } from '@amcharts/amcharts5'
import { csvToChartData, csvToMatrix, matrixToCSV } from './Sidebar'

registerAllModules()

interface FieldProps {
  sdk: FieldExtensionSDK;
  cma: PlainClientAPI;
}

const Field = ({ sdk }: FieldProps) => {
  const table = useRef<HotTable>()
  const element = useRef<HTMLElement>()
  const [exporting, setExporting] = useState<Exporting>()
  const [t, setType] = useState<string>()
  let root: Root

  const { type, alignment, min, max, axeTitle, stacked } = sdk.entry.fields

  function createChart() {
    if (root) {
      root.dispose()
    }

    if (element.current) {
    const dataSource = csvToChartData(sdk.field.getValue())

    switch (type.getValue()) {
      case 'Columns':
        root = createColumns(element.current, dataSource, alignment.getValue() !== 'Horizontal', stacked.getValue(), min.getValue(), max.getValue(), axeTitle.getValue(), '#2BFFF5', '#044554', undefined)
        // chart.appear(1000, 100)
        break

      case 'Curve':
        root = createCurve(element.current, dataSource, alignment.getValue() !== 'Horizontal', stacked.getValue(), min.getValue(), max.getValue(), axeTitle.getValue(), '#2BFFF5', '#044554', undefined)
        // chart.appear(1000, 100)
        break

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

    sdk.window.updateHeight(element.current.offsetHeight + table.current.hotElementRef.offsetHeight + 100)
    }
  }

  useEffect(() => {
    createChart()

    Object.values(sdk.entry.fields).forEach(field => {
      field.onValueChanged(createChart)
    })

    setType(sdk.entry.fields.type.getValue())
    sdk.entry.fields.type.onValueChanged(setType)

    sdk.field.onValueChanged(createChart)
  }, [sdk.entry.fields, element])

  return <>
    <HotTable
      ref={table}
      data={sdk.field.getValue() ? csvToMatrix(sdk.field.getValue()) : [[]]}
      contextMenu={true}
      // dropdownMenu={true}
      // colHeaders={true}
      // rowHeaders={true}
      allowInsertRow={true}
      allowInsertColumn={true}
      width="auto"
      height="auto"
      licenseKey='non-commercial-and-evaluation'
      afterChange={async () => {
        if (table.current) {
          const value = matrixToCSV(table.current.hotInstance.getData())
          sdk.field.setValue(value)
          await sdk.entry.save()
        }
      }}
    />

    {['Columns', 'Curve', 'Pie'].includes(t) && <>
      <div style={{
        position: 'relative',
        marginTop: 20,
        width: '100%',
        paddingBottom: '42%',
        marginBottom: '-10%',
      }}>
        <figure ref={element} style={{
          position: 'absolute',
          inset: 0,
          width: '125%',
          paddingBottom: '42%',
          transformOrigin: 'top left',
          transform: 'scale(0.75)',
          margin: 0
        }} />
      </div>
      {exporting && <Button onClick={() => exporting.download('png')}>Export</Button>}
    </>}

    
  </>
};

export default Field;

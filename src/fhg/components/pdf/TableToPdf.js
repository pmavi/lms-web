import {indexOf} from 'lodash';
import React, {Fragment} from 'react';
import {View, StyleSheet, Font} from '@react-pdf/renderer';
import Table from './Table';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableDataCell from './TableDataCell';
import TableFooter from './TableFooter';
import TableFooterCell from './TableFooterCell';
import TableHeader from './TableHeader';

if (indexOf(Font.getRegisteredFontFamilies(), 'montserrat') < 0) {
   try {
      Font.register({
         family: 'montserrat',
         fonts: [
            {src: '/fonts/montserrat-regular-webfont.ttf'}, // font-style: normal, font-weight: normal
            {src: '/fonts/montserrat-bold-webfont.ttf', fontWeight: 700},
         ],
      });
   } catch (e) {
      console.log(e);
   }
}

const styles = StyleSheet.create({
   root: {
      fontFamily: 'montserrat',
      fontSize: 11,
      flexDirection: 'row',
      display: 'flex',
   },
   headerCellStyle: {
      color: '#707070',
      opacity: 1,
      fontFamily: 'montserrat',
      fontSize: 12,
      padding: '2 2',
      borderColor: '#e0e0e0',
   },
   footerCellStyle: {
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: '#6b9241',
   },
   tableRowStyle: {
      '&:nth-of-type(odd)': {
         backgroundColor: '#f0f0f0',
      },
      borderLeftColor: '#e0e0e0',
      borderRightColor: '#e0e0e0',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
   },
   tableHeaderStyle: {
      minHeight: 20,
      color: '#707070',
   },
   tableFooterStyle: {
      tableRowStyle: {
         '&:nth-of-type(odd)': {
            backgroundColor: '#f0f0f0',
         },
         borderLeftWidth: 1,
         borderLeftColor: '#e0e0e0',
         borderRightWidth: 1,
         borderRightColor: '#e0e0e0',
         borderBottomWidth: 1,
         borderBottomColor: '#e0e0e0',
      },
      // paddingLeft: 4,
      // minHeight: 20,
      // color: '#707070',
   },
   cellStyle2: {
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: '#707070',
   },
});

export default function TableToPdf({
   columns = [],
   data = [{}],
   hasFooter = false,
   tableStyle,
   headerBottomBorder = true,
   headerRightBorder = false,
   headerLeftBorder = false,
   headerTopBorder = false,
   hasFooter2 = false,
   hasFooter3 = false,
}) {
   return (
      <View style={[styles.root, tableStyle?.root]}>
         <Table>
            <TableHeader
               style={tableStyle?.tableHeaderStyle || styles.tableHeaderStyle}
               textAlign={'center'}
               hasLeftBorder={headerLeftBorder}
               hasBottomBorder={headerBottomBorder}
               hasRightBorder={headerRightBorder}
               hasTopBorder={headerTopBorder}
               fixed
               border={'1pt solid #e0e0e0'}
            >
               {columns.map((column, index) => (
                  <TableCell
                     key={'tableCell' + index}
                     weighting={column.weighting}
                     width={column.width}
                     textAlignment={'center'}
                     style={tableStyle?.headerCellStyle || column.headerStyle || styles.headerCellStyle}
                  >
                     {column.Header}
                  </TableCell>
               ))}
            </TableHeader>
            <TableBody
               style={tableStyle?.tableRowStyle || styles.tableRowStyle}
               data={data}
               striped
               hasLeftBorder={true}
               hasBottomBorder={false}
               hasRightBorder={true}
               hasTopBorder={false}
               border={'1px solid #e0e0e0'}
            >
               {columns.map((column, index) => (
                  <TableDataCell
                     key={'dataCell' + index}
                     style={column.style || tableStyle?.cellStyle2 || styles.cellStyle2}
                     column={column}
                  />
               ))}
            </TableBody>
            {hasFooter && (
               <Fragment>
                  <TableFooter
                     style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                     hasLeftBorder={true}
                     hasBottomBorder={true}
                     hasRightBorder={true}
                     hasTopBorder={false}
                     border={'1pt solid #e0e0e0'}
                  >
                     {columns.map((column, index) => (
                        <TableFooterCell
                           key={'tableCellFooter' + index}
                           dataProp={data}
                           style={column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle}
                           column={column}
                        />
                     ))}
                  </TableFooter>
                  {hasFooter2 && (
                     <Fragment>
                        <TableFooter
                           style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                           hasLeftBorder={true}
                           hasBottomBorder={true}
                           hasRightBorder={true}
                           hasTopBorder={false}
                           border={'1pt solid #e0e0e0'}
                        >
                           {columns.map((column, index) => (
                              <TableFooterCell
                                 key={'tableCellFooter' + index}
                                 data={data}
                                 field={'Footer2'}
                                 style={column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle}
                                 column={column}
                              />
                           ))}
                        </TableFooter>
                        {hasFooter3 && (
                           <TableFooter
                              style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                              hasLeftBorder={true}
                              hasBottomBorder={true}
                              hasRightBorder={true}
                              hasTopBorder={false}
                              border={'1pt solid #e0e0e0'}
                           >
                              {columns.map((column, index) => (
                                 <TableFooterCell
                                    key={'tableCellFooter' + index}
                                    field={'Footer3'}
                                    style={column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle}
                                    column={column}
                                 />
                              ))}
                           </TableFooter>
                        )}
                     </Fragment>
                  )}
               </Fragment>
            )}
         </Table>
      </View>
   );
}

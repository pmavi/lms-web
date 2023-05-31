import React from 'react';
import PropTypes from 'prop-types';
import {Page, View, Text, StyleSheet, Font} from '@react-pdf/renderer';
import {PRIMARY_COLOR} from '../../Constants';
import {formatMessage} from '../../fhg/utils/Utils';

Font.register({
   family: 'merriweather',
   fonts: [
      {
         src: '/fonts/merriweather-v21-latin-regular.ttf',
      },
      {
         src: '/fonts/merriweather-v21-latin-700.ttf',
         fontWeight: 'bold',
      },
      {
         src: '/fonts/merriweather-v21-latin-italic.ttf',
         fontWeight: 'normal',
         fontStyle: 'italic',
      },
      {
         src: '/fonts/merriweather-v21-latin-700italic.ttf',
         fontWeight: 'bold',
         fontStyle: 'italic',
      },
   ],
});

const styles = StyleSheet.create({
   page: {
      fontFamily: 'merriweather',
      fontSize: 12,
      textAlign: 'left',
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
   },
   contentItemStyle: {
      marginLeft: 10,
      marginBottom: 10,
   },
   titleStyle: {
      fontSize: 20,
      color: PRIMARY_COLOR,
      marginTop: 32,
      textAlign: 'center',
      '@media orientation portrait': {
         marginBottom: 23,
      },
      '@media orientation: landscape': {
         marginBottom: 10,
      },
   },
});

/**
 * Table of Contents context for the elements in the Table of Contents.
 * @type {React.Context<{add: add, tableofcontents: *[]}>}
 */
const TableOfContentsContext = React.createContext({
   tableofcontents: [],
   add: () => {},
});

/**
 * Table of Contents provider to add and maintain elements to the Table of Contents.
 */
export class TableOfContentsProvider extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         tableofcontents: [],
         add: (title) => {
            if (!this.state.tableofcontents.includes(title))
               this.setState((state) => ({
                  tableofcontents: [...state.tableofcontents, title],
               }));
         },
      };
   }

   render() {
      return <TableOfContentsContext.Provider value={this.state} {...this.props} />;
   }
}

/**
 * Table of Contents component to display the table of contents.
 *
 * @param intl The intl object for localization.
 * @param orientation The orientation of the table of contents.
 * @return {JSX.Element}
 * @constructor
 */
export const TableOfContents = ({intl, orientation}) => {
   return (
      <Page size='LETTER' orientation={orientation} style={styles.page}>
         <View
            style={{
               marginLeft: 20,
               flex: '0 0 auto',
               width: 30,
               borderRight: '20px solid rgb(107,146,65)',
               height: '100%',
            }}
         ></View>
         <View style={{flex: '1 1 100%'}}>
            <Text style={styles.titleStyle} bookmark={{title: 'Table of Contents', fit: true}}>
               {formatMessage(intl, 'tableOfContents.title')}
            </Text>
            <TableOfContentsContext.Consumer>
               {({tableofcontents}) => {
                  return tableofcontents.map((item, index) => (
                     <View key={`toc${index}`}>
                        <Text style={styles.contentItemStyle}>{item}</Text>
                     </View>
                  ));
               }}
            </TableOfContentsContext.Consumer>
         </View>
         <View
            style={{
               marginRight: 20,
               borderLeft: '40px solid #F1F4ED',
               flex: '0 0 auto',
               width: 25,
               height: '100%',
            }}
         ></View>
      </Page>
   );
};

/**
 * The title component to display the title and add it to the provider.
 */
class InnerTitle extends React.Component {
   static propTypes = {
      children: PropTypes.string,
      style: PropTypes.object,
      add: PropTypes.func,
   };

   componentDidMount() {
      this.props.add(this.props.children);
   }

   render() {
      return (
         <Text style={this.props.style} bookmark={{title: this.props.children, fit: true}}>
            {this.props.children}
         </Text>
      );
   }
}

/**
 * The title to be added to the table of contents.
 *
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export const Title = ({...props}) => {
   return (
      <TableOfContentsContext.Consumer>
         {({add}) => <InnerTitle {...props} add={add} />}
      </TableOfContentsContext.Consumer>
   );
};

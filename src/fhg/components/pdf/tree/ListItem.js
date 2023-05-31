import {Text, View, StyleSheet} from '@react-pdf/renderer';
import {SPACING_DEFAULT_PDF} from '../../../../Constants';

const styles = StyleSheet.create({
   row: {
      display: 'flex',
      flexDirection: 'row',
      marginLeft: SPACING_DEFAULT_PDF * 4,
      paddingRight: SPACING_DEFAULT_PDF,
   },
   bullet: {
      fontSize: 18,
      marginTop: -6,
      height: 24,
      overflow: 'hidden',
   },
});

/**
 * Component to show list items in a PDF file.
 *
 * Reviewed: 8/22/2022
 *
 * @param children
 * @return {JSX.Element}
 * @constructor
 */
export default function ListItem({children}) {
   return (
      <View style={[styles.row]}>
         <Text style={styles.bullet}>{'\u2022\u00A0'}</Text>
         <Text>{children}</Text>
      </View>
   );
}

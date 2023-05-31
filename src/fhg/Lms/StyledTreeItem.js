import makeStyles from '@material-ui/core/styles/makeStyles';
import TreeItem from '@material-ui/lab/TreeItem';
import * as PropTypes from 'prop-types';
import Grid from '../../fhg/components/Grid';
import TypographyFHG from '../../fhg/components/Typography';

const useTreeItemStyles = makeStyles((theme) => ({
   root: {
      color: theme.palette.text.secondary,
      // '&:hover $actionStyle': {
      //    pointerEvents: 'none'
      // },
      '&:hover > $content': {
         // backgroundColor: theme.palette.action.hover,
      },
      '&:focus > $content, &$selected > $content': {
         // backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
         // color: 'var(--tree-view-color)',
      },
      '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
         // backgroundColor: 'transparent',
      },
      // '&:focus $actionStyle, &:hover $actionStyle, &$selected $actionStyle': {
      //    backgroundColor: 'transparent',
      // },
   },
   content: {
      // color: theme.palette.text.secondary,
      // borderTopRightRadius: theme.spacing(2),
      // borderBottomRightRadius: theme.spacing(2),
      // paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
         fontWeight: theme.typography.fontWeightRegular,
      },
      '& .labelRoot': {
         fontWeight: theme.typography.fontWeightRegular,
      },
   },
   group: {
      marginLeft: 0,
      '& $labelText': {
         fontWeight: theme.typography.fontWeightRegular,
         color: theme.palette.text.primary,
         ...theme.typography.body1,
      }
   },
   expanded: {},
   selected: {},
   label: {
      fontWeight: 'inherit',
      color: 'inherit',
      '&:hover': {
         backgroundColor: 'inherit',
      },
   },
   labelRoot: {
      padding: theme.spacing(0.5, 0),
      ...theme.typography.h6,
   },
   labelIcon: {
      marginRight: theme.spacing(1),
   },
   labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
   },
   actionStyle: {
      backgroundColor: theme.palette.background.default,
      // marginTop: -13,
      // marginBottom: -13,
      // float: 'right',
      position: 'absolute',
      right: 0,
   }
}));

export default function StyledTreeItem(props) {
   const classes = useTreeItemStyles(props);
   const {nodeId, labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, action, children, ...other} = props;

   return (
      <TreeItem
         nodeId={nodeId}
         label={
            <Grid container justify={'space-between'} alignItems={'center'} style={{position: 'relative'}}>
               <Grid item className={classes.labelRoot}>
                  {/*<LabelIcon color='inherit' className={classes.labelIcon}/>*/}
                  <TypographyFHG variant='subtitle1' className={classes.labelText}>
                     {labelText}
                  </TypographyFHG>
                  <TypographyFHG variant='caption' color='inherit'>
                     {labelInfo}
                  </TypographyFHG>
               </Grid>
               {action && (
                  <Grid item className={classes.actionStyle}>
                     {action}
                  </Grid>
               )}
            </Grid>
         }
         style={{
            '--tree-view-color': color,
            '--tree-view-bg-color': bgColor,
         }}
         classes={{
            root: classes.root,
            content: classes.content,
            expanded: classes.expanded,
            selected: classes.selected,
            group: classes.group,
            label: classes.label,
         }}
         {...other}
      >
         {children}
      </TreeItem>
   );
}

StyledTreeItem.propTypes = {
   bgColor: PropTypes.string,
   color: PropTypes.string,
   labelInfo: PropTypes.string,
   labelText: PropTypes.string.isRequired,
};

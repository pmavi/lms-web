import MuiGrid from '@material-ui/core/Grid/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import debounce from 'lodash/debounce';
import * as PropTypes from 'prop-types';
import React, {useRef, useEffect, useState, useCallback, forwardRef} from 'react';

const useStyles = makeStyles(
   {
      gridStyle: (props) => {
         return {
            overflow: props.overflow,
            height: props.fullHeight === true ? '100%' : props.fullHeight === false ? 'unset' : undefined,
            width: props.fullWidth === true ? '100%' : props.fullWidth === false ? 'unset' : undefined,
            flex: props.flex
               ? props.flex
               : props.resizable
               ? '1 1'
               : props.resizable === false
               ? '0 0 auto'
               : undefined,
         };
      },
      innerGridStyle: (props) => {
         return {
            overflow: props.overflow,
            height: props.fullHeight === true ? '100%' : props.fullHeight === false ? 'unset' : undefined,
            width: '100%',
            flex: props.flex
               ? props.flex
               : props.resizable
               ? '1 1'
               : props.resizable === false
               ? '0 0 auto'
               : undefined,
         };
      },
   },
   {name: 'gridStyles'}
);

const Grid = forwardRef(
   /**
    * The Grid component that supports overflow as a property.
    *
    * Example:
    * <Grid overflow='auto' fullWidth resizable>...</Grid>
    * @augments MuiGrid
    * @param props The props listed below.
    * @param ref The reference for the grid.
    *
    * Reviewed:
    */
   function Grid(props, ref) {
      const {
         // Name of the grid for debugging,
         name,
         // CSS overflow attribute,
         overflow,
         // Grid displayed at 100% of parent,
         fullWidth,
         // CSS flex attribute,
         flex,
         // Children to display in the grid,
         children,
         // The styles className,
         className,
         //Indicates if the Grid is resizable,
         resizable,
         // Grid displayed at 100% height of parent
         fullHeight,
         // MuiGrid attribute item
         item,
         // MuiGrid attribute container
         container,
         // MuiGrid attribute spacing
         spacing,
         // MuiGrid attribute justify
         justify,
         // MuiGrid attribute alignItems
         alignItems,
         // MuiGrid attribute alignItems
         alignContent,
         // Indicates if the grid contents scroll.
         isScrollable,
         // Indicates if padding should be added to the right for vertical scroll bars.
         isAddScrollPadding = true,
         // Style attribute for the inner grid of the scrolling grid. (Ignored if isScrollable is true)
         innerStyle,
         // MuiGrid attribute direction
         direction,
         // MuiGrid attribute wrap
         wrap,
         ...otherProps
      } = props;
      const adjustedProps = {...props};
      adjustedProps.fullHeight = isScrollable ? true : props.fullHeight;
      adjustedProps.overflow = isScrollable ? 'auto' : props.overflow;

      const theme = useTheme();
      const mainRef = useRef();
      const classes = useStyles(adjustedProps);
      const [isVerticalScroll, setIsVerticalScroll] = useState();

      const checkIsScrolling = useCallback(() => {
         if (mainRef.current && isScrollable) {
            const isVerticalScrolling = mainRef.current.scrollHeight > mainRef.current.clientHeight;
            setIsVerticalScroll(isVerticalScrolling);
         }
      }, [mainRef, isScrollable]);

      // Debounce the scroll size check.
      const handleResizeDebounced = useRef(debounce(checkIsScrolling, 750)).current;

      useEffect(() => {
         if (isScrollable) {
            checkIsScrolling();
            window.addEventListener('resize', handleResizeDebounced);
            return () => window.removeEventListener('resize', handleResizeDebounced);
         }
      }, [checkIsScrolling, handleResizeDebounced, isScrollable, mainRef]);

      let inner;

      if (isScrollable) {
         inner = (
            <MuiGrid
               name='Grid-scroll inner'
               ref={mainRef}
               className={classes.innerGridStyle}
               style={{
                  padding: spacing !== undefined ? theme.spacing(spacing) : undefined,
                  paddingRight:
                     isVerticalScroll && isAddScrollPadding
                        ? 8
                        : spacing !== undefined
                        ? theme.spacing(spacing)
                        : undefined,
                  ...innerStyle,
               }}
               container={container}
               item={item}
               spacing={spacing}
               justify={justify}
               alignItems={alignItems}
               alignContent={alignContent}
            >
               {children}
            </MuiGrid>
         );
      } else {
         inner = children;
      }

      return (
         <MuiGrid
            ref={ref}
            // ref={mainRef}
            name={name}
            className={`${classes.gridStyle} ${className}`}
            item={isScrollable ? true : item}
            container={isScrollable ? false : container}
            {...otherProps}
            // container={isScrollable ? false : container} {...otherProps}
            spacing={!isScrollable ? spacing : undefined}
            justify={!isScrollable ? justify : undefined}
            alignItems={!isScrollable ? alignItems : undefined}
            alignContent={!isScrollable ? alignContent : undefined}
            direction={!isScrollable ? direction : undefined}
            wrap={!isScrollable ? wrap : undefined}
         >
            {inner}
         </MuiGrid>
      );
   }
);

Grid.propTypes = {
   flex: PropTypes.string, // The flex style property.
   resizable: PropTypes.bool, // Indicates if the grid should use flex resizing (i.e. flex: '1 1')
   fullWidth: PropTypes.bool, // Indicates if the grid should be 100%.
   fullHeight: PropTypes.bool, // Indicates if the grid should be 100%.
   overflow: PropTypes.string, // Key to message in the localization file.
   //Properties from Grid
   alignContent: PropTypes.any,
   alignItems: PropTypes.any,
   direction: PropTypes.any,
   justify: PropTypes.any,
   lg: PropTypes.any,
   md: PropTypes.any,
   sm: PropTypes.any,
   spacing: PropTypes.any,
   wrap: PropTypes.any,
   xs: PropTypes.any,
   zeroMinWidth: PropTypes.any,
   isScrollable: PropTypes.bool,
   ...MuiGrid.propTypes, // Supports all the properties from Grid.
};

Grid.defaultProps = {
   overflow: 'hidden',
};

export default Grid;

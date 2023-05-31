import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export default function useWidthRule(mode, width) {
   const theme = useTheme();
   return useMediaQuery(theme.breakpoints[mode](width));
}

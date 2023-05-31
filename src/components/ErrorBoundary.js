import React, {Component} from 'react';
import ErrorSnackbar from '../fhg/components/ErrorSnackbar';

export default class ErrorBoundary extends Component {
   constructor(props) {
      super(props);
      this.state = {open: false, error: null, errorInfo: null};
   }

   componentDidCatch(error, errorInfo) {
      this.setState({error, errorInfo});
      console.log('Error occurred', error, errorInfo);
   }

   /**
    * On close the snackbar.
    */
   handleClose = () => {
      this.setState({open: false, errorInfo: undefined, error: undefined});
   };

   render() {
      const {error, errorInfo, open} = this.state;

      if (errorInfo) {
         return (
            <ErrorSnackbar
               open={open}
               error={error}
               messageKey={error.messageKey}
               message={error.message}
               errorInfo={errorInfo}
               onClose={this.handleClose}
            />
         );
      }
      return this.props.children;
   }
}

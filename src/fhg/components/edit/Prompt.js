import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';
import {useLocation} from 'react-router';
import {Prompt as PromptDOM} from 'react-router-dom';
import {formatMessage} from '../../utils/Utils';

/**
 * The component to prompt the user when leaving the page with unsaved changes.
 *
 * Reviewed:
 */
export default function Prompt({when, messageKey = 'leavePage', message, ...props}) {
   const intl = useIntl();
   const location = useLocation();

   const getPrompt = useCallback(
      (newLocation = {}) => {
         if (newLocation && location && newLocation.pathname !== location.pathname) {
            if (messageKey) {
               return formatMessage(intl, 'leavePage', 'Discard changes?');
            }
            return message;
         }
      },
      [intl, message, messageKey, location]
   );
   return <PromptDOM when={when} message={getPrompt} {...props} />;
}

Prompt.propTypes = {
   when: PropTypes.bool.isRequired,
   message: PropTypes.string,
   messageKey: PropTypes.string,
};

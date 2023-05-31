import PropTypes from 'prop-types';
import {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {formatMessage} from '../utils/Utils';

useMessage.propTypes = {
   id: PropTypes.string.isRequired,    // The id of the localized message.
   defaultMessage: PropTypes.string,   // The default message if not localized.
   values: PropTypes.array,            // Values to insert in the localized message.
};

export default function useMessage(id, defaultMessage, values) {
   const intl = useIntl();

   return useMemo(() => {
      return formatMessage(intl, id, defaultMessage, values);
   }, [id, intl, defaultMessage, values]);
}

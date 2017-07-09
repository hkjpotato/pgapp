import { PropTypes } from 'react';

export default {
  source: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
  // linkKey: PropTypes.number.isRequired, //TODO
  getDomNode: PropTypes.func.isRequired,
};

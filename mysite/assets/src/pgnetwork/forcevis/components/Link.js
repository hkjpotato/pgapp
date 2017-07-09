import React, { PropTypes } from 'react';
// import createForceLink from './ForceHOC/createForceLink';

// import linkRequiredPropTypes from '../propTypes/link';

/*
Link Presentational Component
*/
export default class Link extends React.PureComponent {
  // static get propTypes() {
  //   return {
  //     ...linkRequiredPropTypes,
  //     highlighted: PropTypes.bool,
  //   }
  // }
  // static get defaultProps() {
  //   //props is just for render
  //   return {
  //     highlighted: false,
  //     onClick: ()=>{}
  //   }
  // }
  constructor(props) {
    super(props);
    // this.onClick = this.onClick.bind(this);
  }
  render() {
    const {getDomNode, name, highlighted, onClick} = this.props;
    return (
      <line 
        ref={getDomNode}
        className={'link'}
        onClick={onClick}
        style={{
          cursor: 'pointer',
          strokeWidth: highlighted ? 2 : 1,
          stroke: highlighted ? '#000': '#999',
        }}
         >
      </line>
    )
  }
}

// const ForceLink = createForceLink(Link);

// export default ForceLink;
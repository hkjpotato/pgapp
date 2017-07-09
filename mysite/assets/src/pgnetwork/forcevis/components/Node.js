import React, {PropTypes} from 'react';
import createForceNode from './ForceHOC/createForceNode';
// import nodeRequiredPropTypes from '../propTypes/node';
import ReactDOM from 'react-dom';

/*
Node Presentational Component
*/
const DEFAULT_NODE_STYLE = {
  cursor: 'pointer'
}

export default class Node extends React.PureComponent {
  // static get propTypes() {
  //   return {
  //     ...nodeRequiredPropTypes,
  //     radius: PropTypes.number,
  //     highlightedRadius: PropTypes.number,
  //     selected: PropTypes.bool,
  //     highlighted: PropTypes.bool,
  //   }
  // }
  static get defaultProps() {
    //props is just for render
    return {
      selected: false,
      highlighted: false,
      radius: 4,
      highlightedRadius: 10,
    }
  }
  constructor(props) {
    super(props);
  }

  render() {
    const {getDomNode, name, selected, highlighted, radius, highlightedRadius, onClick} = this.props;

    return (
      <g 
        ref={getDomNode}
        onClick={onClick}
        className={'node'}
        style={DEFAULT_NODE_STYLE}
         >
        <circle 
          className="node-circle"
          r={radius}
          cx={0}
          cy={0}
          style={{
            fill: '#ff7f7f',
            strokeWidth: 1.5,
            stroke: selected ? '#555' : '#fff',
          }} />
        <circle 
          className="highlighted-ring"
          r={highlightedRadius}
          cx={0}
          cy={0}
          style={{
            pointerEvents: 'none',
            fill: 'none',
            strokeWidth: 1.5,
            stroke: highlighted ? '#000' : 'none',
          }} />
      </g>
    )
  }
}

// https://stackoverflow.com/questions/36261225/why-is-export-default-const-invalid
// const ForceNode = createForceNode((Node));

// export default ForceNode;
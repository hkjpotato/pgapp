import React from 'react';

//HOC for force link
export default function createForceLink (WrappedComponent) {
  return class extends React.PureComponent {
    // static get propTypes() {
    //   return {
    //     // ...nodeRequiredPropTypes,
    //     radius: PropTypes.number,
    //     highlightedRadius: PropTypes.number,
    //     selected: PropTypes.bool,
    //     highlighted: PropTypes.bool,
    //   }
    // }
    // static get defaultProps() {
    //   //props is just for render
    //   return {
    //     selected: false,
    //     highlighted: false,
    //     radius: 4,
    //     highlightedRadius: 10,
    //     onClick: ()=>{},
    //     onMouseDown: ()=>{},
    //   }
    // }
    constructor(props) {
      super(props);
      this.getDomNode = this.getDomNode.bind(this);
      this.onClick = this.onClick.bind(this);
    }
    updatePosition({source : {x : x1, y : y1}, target: {x: x2, y: y2}}) {
      //findDOMNode?..not sure, the react guide is still working on it
      d3.select(this.domNode)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2);
    }
    getDomNode(domNode) {
      this.domNode = domNode;
    }
    onClick(e) {
      console.log('onClick link')
      //https://bl.ocks.org/mbostock/a84aeb78fea81e1ad806
      //https://www.npmjs.com/package/react-native-listener
      //it is fine to still use defaultPrevented for testing if it is a drag event since d3 event comes first
      if (e.defaultPrevented) return;

      e.stopPropagation(); //prevent parent(zoomBase, svg) click listener to be called
      this.props.onClick(this.props);
    }
    render() {
      const {onClick, ...passThroughProps} = this.props;

      const injectedProp = {
        getDomNode: this.getDomNode,
        onClick: this.onClick,
      }
      return (<WrappedComponent {...injectedProp} {...passThroughProps} />);
    }
  }
}

import React from 'react';

//HOC for force Node
export default function createForceNode (WrappedComponent) {
  return class extends React.PureComponent {
    constructor(props) {
      super(props);
      this.getDomNode = this.getDomNode.bind(this);
      this.onClick = this.onClick.bind(this);
    }
    componentDidMount() {
      //native listener, not react event
      //however, it should be fine since it is MAINLY used for dragging
      this.domNode.addEventListener('mousedown', event => {
        this.props.onMouseDown(this.props, event);
      });
    }
    getDomNode(domNode) {
      this.domNode = domNode;
    }
    updatePosition({x, y}) {
      const transform = `translate(${x},${y})`
      //findDOMNode?..not sure, the react guide is still working on it
      d3.select(this.domNode)
        .attr('transform', transform)
    }
    onClick(e) {
      //https://bl.ocks.org/mbostock/a84aeb78fea81e1ad806
      //https://www.npmjs.com/package/react-native-listener
      //it is fine to still use defaultPrevented for testing if it is a drag event since d3 event comes first
      if (e.defaultPrevented) return;
      e.stopPropagation(); //prevent parent(zoomBase, svg) click listener to be called
      // console.log('force node click', this.props);
      this.props.onClick(this.props);
    }
    render() {
      //adapt the props
      const {previouslySelected, onMouseDown, onClick, ...passThroughProps} = this.props;
      // const {...passThroughProps} = this.props;
      const injectedProp = {
        getDomNode: this.getDomNode,
        onClick: this.onClick,
      }
      return (<WrappedComponent {...injectedProp} {...passThroughProps} />);
    }
  }
}
import React, { PropTypes } from 'react';
import DynamicForce from './DynamicForce';
import {getNodeKey, getLinkKey} from '../utils/d3-force';
/*
InteractiveDynamicForce has nodes and links as state (highlight is also state)
and thus control the state change event
1. mousedown(select state)
2. click(select & highlight state)
3. brushstart & brush (multi-select)
4. add/remove nodes
5. add/remove links

when calculating the state change of nodes(selected), it might require location data from the
MovableForce, it also need to know the current selection mode(multi-selection?)

current selection mode is a state of itself control by key event


InteractiveDynamicForce also control the force layout parameters as state
*/
export default class InteractiveDynamicForce extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.initNodes,
      links: props.initLinks,
      highlighted: null,
      multiSelectable: false,
    }

    //state related event handlers
    this.onNodeMouseDown = this.onNodeMouseDown.bind(this);
    this.onNodeClick = this.onNodeClick.bind(this);
    this.onLinkClick = this.onLinkClick.bind(this);
    this.onBrushStart = this.onBrushStart.bind(this);
    this.onBrush = this.onBrush.bind(this);
    this.setMultiSelectable = this.setMultiSelectable.bind(this);
    this.cleanSelectedAndHighlighted = this.cleanSelectedAndHighlighted.bind(this);
  }
  componentDidMount() {
    // let counter = 1;
    // let bb = setInterval(()=>{
    //   this.addAtSelected();
    //   counter++;
    //   if (counter > 10) clearInterval(bb);
    // }, 2000);
  }
  addAtSelected() {
    const selectedNodes = this.state.nodes.filter(n=>n.selected);
    const addedNodes = [];
    const addedLinks = [];
    const dynamicForceInstance = this.dynamicForceInstance;
    let maxIndex = this.state.nodes.length;
    selectedNodes.forEach(n=>{
      const sourceKey = getNodeKey(n);
      const sourceFnode = dynamicForceInstance.getForceNode(sourceKey);
      const addedNodeName = 'node' + maxIndex++;
      addedNodes.push({
        name: addedNodeName,
        x: sourceFnode.x + Math.random() * 10 - 5,
        y: sourceFnode.y + Math.random() * 10 - 5,
      });
      addedLinks.push({
        source: n.name,
        target: addedNodeName,
      });
    });

    this.setState({
      nodes: [...this.state.nodes, ...addedNodes],
      links: [...this.state.links, ...addedLinks]
    });
  }
  getJSONData() {
    const {nodes, links} = this.state;
    const dynamicForceInstance = this.dynamicForceInstance;
    const nodesData = nodes.map(n=> {
      const nodeKey = getNodeKey(n);
      const { x, y, fixed } = dynamicForceInstance.getForceNode(nodeKey);
      const { selected, previouslySelected, ...cloneProps} = n;
      return {
        ...cloneProps,
        x,
        y,
        fixed,
      }
    });
    const linksData = links.map(l=> {
      const { ...cloneProps } = l;
      return {
        ...cloneProps
      }
    });
    const updateData = {
      nodes: nodesData,
      links: linksData
    };

    return JSON.stringify(updateData, null, 2);
  }
  //Methods for nodes and links state change
  onNodeMouseDown(nodeProps) {
    const multiSelectable = this.state.multiSelectable;
    const nodeKey = getNodeKey(nodeProps);
    let newNodes;
    if (!nodeProps.selected) {
      newNodes = this.state.nodes.map(n=>({
        ...n,
        previouslySelected: n.selected, //always mark previously selected
        selected: nodeKey === getNodeKey(n) || (n.selected && multiSelectable), //always mark itself and previouslySelected if multiSelectable
      }));
    } else {
      newNodes = this.state.nodes.map(n=>({
        ...n,
        previouslySelected: n.selected, //always mark previously selected
      }));
    }
    this.setState({
      nodes: newNodes
    });
  }
  onNodeClick(nodeProps) {
    const multiSelectable = this.state.multiSelectable;
    const nodeKey = getNodeKey(nodeProps);
    let newNodes = this.state.nodes;
    if (nodeProps.previouslySelected) {
      if (multiSelectable) {
        //allow toggling self status since other nodes are not affected
        newNodes = this.state.nodes.map(n=>({
          ...n,
          selected: n.selected && getNodeKey(n) !== nodeKey,
        }));
      } else {
        //only itself is selected and other will be unselected
        newNodes = this.state.nodes.map(n=>({
          ...n,
          selected: nodeKey === getNodeKey(n),
        }));
      }
    }
    this.setState({
      nodes: newNodes,
      highlighted: {
        highlightedType: 'node',
        highlightedProps: nodeProps,
      },
    });
  }
  onLinkClick(linkProps) {
    this.setState({
      highlighted: {
        highlightedType: 'link',
        highlightedProps: linkProps, 
      }
    });
  }
  onBrushStart() {
    //modify the state
    const multiSelectable = this.state.multiSelectable;
    this.setState({
      nodes: this.state.nodes.map(node=>({
        ...node,
        previouslySelected: multiSelectable && node.selected
      }))
    });
  }
  onBrush(extent) {
    const dynamicForceInstance = this.dynamicForceInstance;
    //modify the state based on current state as well as the force location
    const withinExtent = ({x, y}) => (
      extent[0][0] <= x && x < extent[1][0] && extent[0][1] <=y && y < extent[1][1]
    );
    this.setState({
      nodes: this.state.nodes.map(n=>({
        ...n,
        selected: n.previouslySelected || withinExtent(dynamicForceInstance.getForceNode(getNodeKey(n))),
      }))
    });
  }
  setMultiSelectable(multiSelectable) {
    this.setState({
      multiSelectable: multiSelectable
    });
  }
  cleanSelectedAndHighlighted() {
    this.setState({
      nodes: this.state.nodes.map(n=>({
        ...n,
        selected: false
      })),
      highlighted: null
    })
  }
  render() {
    // console.log('InteractiveDynamicForce render');
    const {initNodes, initLinks, ...passThroughProps} = this.props;
    const {nodes, links, highlighted} = this.state;

    //injectedProps
    const interativeEventHandlers = {
      onNodeMouseDown: this.onNodeMouseDown,
      onNodeClick: this.onNodeClick,
      onLinkClick: this.onLinkClick,
      onBrushStart: this.onBrushStart,
      onBrush: this.onBrush,
      setMultiSelectable: this.setMultiSelectable,
      cleanSelectedAndHighlighted: this.cleanSelectedAndHighlighted,
    }
    return (
        <DynamicForce
          ref={inst=>this.dynamicForceInstance=inst}
          nodes={nodes}
          links={links}
          highlighted={highlighted}
          {...interativeEventHandlers}
          {...passThroughProps}
        />
    )
  }
}

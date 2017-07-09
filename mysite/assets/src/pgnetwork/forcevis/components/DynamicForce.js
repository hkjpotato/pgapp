import React, { PropTypes } from 'react';
import forcePropTypes, { DEFAULT_FORCE_PROPS } from '../propTypes/force';
import Node from './Node';
import Link from './Link';
import ZoomBrushBase from './ZoomBrushBase';

import * as forceUtils from '../utils/d3-force';
import getSvgPosition from '../utils/getSvgPosition';

const {getNodeKey, getLinkKey, getCentroid} = forceUtils;
import createForceNode from './ForceHOC/createForceNode';
import createForceLink from './ForceHOC/createForceLink';

const ForceNode = createForceNode(Node);
const ForceLink = createForceLink(Link);

/*
DynamicForce does not have state
it receives nodes and links (and highlight node) as props
it has a local d3 force layout to manipulate location data
thus all the 'pure' location related event will be consumed here locally
1. dragstart
2. drag
3. dragend
4. _nudge
5. rotate
6. scale
7. fix/unfix

TODO: almost all the above events depends on the 'state' of the nodes props, however, 
we do not allow modifying the state locally.

TODO: It should provide an api for accessing the location data of a specific node.
For example, the parent 'InteractiveForceContainer' might need those location for updating the state of nodes(selected)
1. brushing will require those location data
2. contouring will require those location data
3. when save it back to json, those location data will be saved as well (x, y, fixed)

!Important, the links props does not have the real reference to force nodes!! 
its source and target is just a string, the actual reference is built by forceUtils
*/
export default class DynamicForce extends React.PureComponent {
  static get propTypes() {
    return {
      // children
      nodes: PropTypes.array,
      links: PropTypes.array,

      // size for svg, ZoomBrushBase, not the force size
      width: PropTypes.number,
      height: PropTypes.number,

      // force layout options
      createForce: PropTypes.func,
      updateForce: PropTypes.func,
      forceOptions: forcePropTypes,

      //for interaction and state change
      onNodeMouseDown: PropTypes.func, //change selected state
      onNodeClick: PropTypes.func, //change highlighted state
      onLinkClick: PropTypes.func, //change highlighted state
      onBrushStart: PropTypes.func, //change selected state
      onBrush: PropTypes.func, //change selected state
      setMultiSelectable: PropTypes.func, //change how state will be changed
      cleanSelectedAndHighlighted: PropTypes.func, //change selected & highlighted state
    };
  }

  static get defaultProps() {
    return {
      createForce: forceUtils.createForce,
      updateForce: forceUtils.updateForce,
      forceOptions: DEFAULT_FORCE_PROPS,
      //default empty interactive methods(react state related)
      onNodeMouseDown: ()=>{},
      onNodeClick: ()=>{},
      onLinkClick: ()=>{},
      onBrushStart: ()=>{},
      onBrush: ()=>{},
      setMultiSelectable: ()=>{},
      cleanSelectedAndHighlighted: ()=>{},
    }
  }

  constructor(props) {
    super(props);

    const {createForce, forceOptions} = props;
    const {nodes, links} = this.props;

    //when we create the force, the force will have a map called key2fnodes
    //that map nodeKey to force nodes maintained by force
    this.force = createForce({
      ...DEFAULT_FORCE_PROPS,
      ...forceOptions,
      nodes,
      links
    });
    window.kj = this.force;

    //key maps to the node and link instances created by react
    this.nodeInstances = {};
    this.linkInstances = {};

    //!Important, the above maps help the force and react communicate with each other

    //of course we need to bind the tick function
    this.force.on('tick', ()=>{
      this._updatePositions();
    });

    //bind the private events handlers here for all the private locations related event
    //notice we always bind the callback here because we are using PureComponent and we want to avoid uneccessary re-render
    this._onNodeMoveStart = this._onNodeMoveStart.bind(this);
    this._onNodeMoveEnd = this._onNodeMoveEnd.bind(this);
    this._onNodeMouseDown = this._onNodeMouseDown.bind(this);
    this._onNodeDragStart = this._onNodeDragStart.bind(this);
    this._onNodeDrag = this._onNodeDrag.bind(this);
    this._onNodeDragEnd = this._onNodeDragEnd.bind(this);
    
    //react state related
    this.onKeyDown = this.onKeyDown.bind(this); //for multiSelectable, _nudge, rotate, scale, fix
    this.onKeyUp = this.onKeyUp.bind(this); //for multiSelectable
    this.onClick = this.onClick.bind(this); //for clean select & highlight
  }
  /*
    Important Helper function to get force node of a given node
  */
  getForceNode(nodeKey) {
    return this.force.key2fnodeMap[nodeKey];
  }
  /*
    Important Helper function to get selected force nodes
    it is used almost every where since the primary action is to 
    " select some nodes and then move them, or select nodes and do some change"
  */
  getSelectedForceNodes() {
    const key2fnodeMap = this.force.key2fnodeMap;
    const selectedForceNodes = this.props.nodes
      .filter(n=>n.selected)
      .map(n=>key2fnodeMap[getNodeKey(n)]);
    return selectedForceNodes;
  }

  componentWillReceiveProps(nextProps) {
    //before rendering, update the force
    if (this.props.nodes !== nextProps.nodes || 
        this.props.links !== nextProps.links ||
        this.props.forceOptions !== nextProps.forceOptions
    ) {
      this.updateForce(nextProps);
    }
  }

  componentWillUnmount() {
    this.force.on('tick', null);
  }

  updateForce(props = this.props) {
    const {force} = this;
    const {updateForce, forceOptions, nodes, links } = props;

    this.force = updateForce(force, {
      ...DEFAULT_FORCE_PROPS,
      ...forceOptions,
      nodes,
      links,
    });
  }

  //private method for updating location without affecting ReactDOM
  _updatePositions() {
    //update locations is the duty of force, not related with React
    //however, force only knows the location but does not have reference to actual dom
    //this is where the key-instance maps come into play

    //loop through force, update the corresponding dom
    //both ForceNode and ForceLink should implement updatePosition function, 
    //used as an API to alter the dom position, however, it does not pollute any React controlled Component
    // this.force.nodes().forEach(fnode=>{
    //   this.nodeInstances[getNodeKey(fnode)]
    //     .setAttribute('transform', `translate(${fnode.x},${fnode.y})`);
    // });
    this.force.nodes().forEach(fnode=>{
      this.nodeInstances[getNodeKey(fnode)].updatePosition({
        x: fnode.x,
        y: fnode.y
      });
    });

    this.force.links().forEach(flink=>{
      this.linkInstances[getLinkKey(flink)].updatePosition(flink);
    });
  }
  /*
  All the locations related methods, they will not affect the React side,
  just update locations
  */
  /* general preparation methods for node movement */
  _onNodeMoveStart() {
    this.getSelectedForceNodes()
      .forEach(fnode=>fnode.fixed = true);
  }
  _onNodeMoveEnd() {
    this.getSelectedForceNodes()
      .forEach(fnode=>fnode.fixed &= ~6);
  }
  /* drag function */
  _onNodeMouseDown(nodeProps, event) {
    // console.log('private onNodeMouseDown', nodeProps);
    this.props.onNodeMouseDown(nodeProps); //do the state
    this._onNodeDragStart(event); //TODO, async setState
  }

  _onNodeDragStart(event) {
    // console.log('hi _onNodeDragStart', event);
    //drag behavior
    event.stopPropagation();
    document.addEventListener('mousemove', this._onNodeDrag, false); //native
    document.addEventListener('mouseup', this._onNodeDragEnd, false);
    this.dragging = true;
    this.position0 = getSvgPosition(this.ZoomBrushBase.visContainer, event);
    //force behavior
    this._onNodeMoveStart();
  }

  _onNodeDrag(event) {
    //drag behavior
    event.stopPropagation();
    if (!this.position0) return;
    const position1 = getSvgPosition(this.ZoomBrushBase.visContainer, event);
    const dx = position1.x - this.position0.x;
    const dy = position1.y - this.position0.y;
    this.position0 = position1;

    //force behavior
    this.getSelectedForceNodes()
      .forEach(fnode=>{
        fnode.px += dx;
        fnode.py += dy;
      });

    // console.log('dragging', dx, dy)
    this.force.resume();
  }

  _onNodeDragEnd() {
    //drag behavior
    event.stopPropagation();
    document.removeEventListener('mousemove', this._onNodeDrag, false); //native
    document.removeEventListener('mouseup', this._onNodeDragEnd, false);
    this.dragging = false;
    this.position0 = null;

    //force behavior
    this._onNodeMoveEnd();
  }
  /* _nudge function */
  _nudge(dx, dy) {
    this._onNodeMoveStart();
    this.getSelectedForceNodes().forEach(fnode=>{
      fnode.px += dx;
      fnode.py += dy;
    });
    this.force.resume();
    this._onNodeMoveEnd();
  }
  /* scale function */
  _partialScale(scale) {
    function getNewPos([x, y], old, scale) {
      return [
        (old.x - x) * scale + x,
        (old.y - y) * scale + y
      ]
    }
    const selectedForceNodes = this.getSelectedForceNodes();
    const centroid = getCentroid(selectedForceNodes);
    this._onNodeMoveStart();
    selectedForceNodes.forEach(fnode=>{
      const newPos = getNewPos(centroid, fnode, scale);
      fnode.px = newPos[0];
      fnode.py = newPos[1];
    });
    this.force.resume();
    this._onNodeMoveEnd();
  }
  /* rotate function */
  _partialRotate(deg) {
    function rotateAround([x, y], old, deg) {
      var cos = Math.cos, sin = Math.sin, r = deg / 180 * Math.PI;
      var newX = (old.x - x) * cos(r) - (old.y - y) * sin(r) + x;
      var newY = (old.x - x) * sin(r) + (old.y - y) * cos(r) + y;
      return [newX, newY];
    }
    const selectedForceNodes = this.getSelectedForceNodes();
    const centroid = forceUtils.getCentroid(selectedForceNodes);
    this._onNodeMoveStart();
    selectedForceNodes.forEach(fnode=>{
      const newPos = rotateAround(centroid, fnode, deg);
      fnode.px = newPos[0];
      fnode.py = newPos[1];
    });
    this.force.resume();
    this._onNodeMoveEnd();
  }
  /* toggle fixed */
  _toggleFixed(fixed) {
    this.getSelectedForceNodes().forEach(fnode=>fnode.fixed = fixed);
    this.force.resume();
  }
  /* Key Events */
  onKeyDown(e) {
    e.preventDefault();

    if (e.metaKey) {
      this.props.setMultiSelectable(true);
      return;
    }

    if (!e.metaKey || !e.shiftKey) switch (e.keyCode) {
      case 38: this._nudge( 0, -1); break; // UP
      case 40: this._nudge( 0, +1); break; // DOWN
      case 37: this._nudge(-1,  0); break; // LEFT
      case 39: this._nudge(+1,  0); break; // RIGHT
      case 68: this._toggleFixed(false); break; // 'd', unfix selected
      case 70: this._toggleFixed(true); break; // 'f', fixed selected
      case 187: this._partialScale(1.05); break; // '+', scaleup
      case 189: this._partialScale(1/1.05); break; // '-', scaledown
      case 48: this._partialRotate(2); break; // '(', rotate clockwise
      case 57: this._partialRotate(-2); break; // ')', rotate anti-clockwise
    }
  }

  onKeyUp(e) {
    e.preventDefault();
    this.props.setMultiSelectable(false);
  }

  onClick(e) {
    console.log('svg click ', e.defaultPrevented);
    //event could be prevented by zoom pan or click on white space when brushing
    if (!e.defaultPrevented) {
      this.props.cleanSelectedAndHighlighted();
    }
  }

  render() {
    const {
      nodes,
      links,
      highlighted,
      width,
      height,
      forceOptions,
    } = this.props;

    //maybe calcualte this on parent?
    const highlightedType = highlighted && highlighted.highlightedType;
    const highlightedKey = highlightedType && (highlightedType === 'node' ? getNodeKey(highlighted.highlightedProps) : getLinkKey(highlighted.highlightedProps));

    //clean the key-instances map
    this.nodeInstances = {};
    this.linkInstances = {};


    // build up the real React children to render(Pure! Pure! Pure!)
    // Pure means that we only extract the props related to React.PureComponent UI rendering
    const nodeElements = nodes.map(node=> {
      //extract the props required by React rendering
      const {
        x, //for force
        y, //for force
        fixed, //for force
        // previousSelected, //this is only used as a temporary flag for selection, not related to render
        ...pureNodeProps, //the actual props for rendering
      } = node;

      const nodeKey = getNodeKey(node); //might save back to json?

      const eventHandlers = {
        onMouseDown: this._onNodeMouseDown,
        onClick: this.props.onNodeClick,
      }

      return (
        <ForceNode
          key={nodeKey}
          ref={n=>this.nodeInstances[nodeKey] = n}
          highlighted={highlightedType==="node" && nodeKey===highlightedKey}
          {...pureNodeProps}
          {...eventHandlers} />
      );
    });

    const linkElements = links.map(link=> {
      const {
        ...pureLinkProps
      } = link;
      const linkKey = getLinkKey(link);
      const eventHandlers = {
        onClick: this.props.onLinkClick,
      }
      return (
        <ForceLink
          key={linkKey}
          ref={l=>this.linkInstances[linkKey] = l}
          highlighted={highlightedType==="link" && linkKey===highlightedKey}
          {...pureLinkProps}
          {...eventHandlers} />
      );
    });

    const ZoomBrushBaseProps = {
      width,
      height,
      onBrushStart: this.props.onBrushStart,
      onBrush: this.props.onBrush,
    }


    return (
      <svg 
        className="kj-force__svg" 
        width={width} 
        height={height}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onClick={this.onClick}
      >
        <ZoomBrushBase ref={d=>this.ZoomBrushBase=d} {...ZoomBrushBaseProps}>
          <g className="kj-force__linksLayer">{linkElements}</g>
          <g className="kj-force__nodesLayer">{nodeElements}</g>
        </ZoomBrushBase>
      </svg>
    );

  }
}

function renderNode(props) {
  return (
    <circle
      r={2}
      cx={0}
      cy={0} />
  )
}
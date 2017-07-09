import d3 from "d3";

import setsEqual from './sets-equal';

const FORCELAYOUT_PARAMS = [
  'gravity',
  'theta',
  'friction',
  'linkStrength',
  'linkDistance',
  'charge',
];

//the props required by force nodes(nodes contains [...forceprops, uiprops])
const DESIRED_FORCE_NODE_PROPS = [
  'name',
  'x',
  'y',
  // 'px',
  // 'py',
  'fixed',
];

// ---- PRIVATE METHODS ----

//maybe is just a general param update
function applySize(force, {size: [width, height]}) {
  //only update if it is not the same as the previous value
  if (force.size()[0] !== width || force.size()[1] !== height) {
    console.log('update size');
    force.size([width, height]);
    force.shouldRun = true;
  }
  return force;
}

function applyForceLayoutVars(force, options) {
  FORCELAYOUT_PARAMS.forEach((paramName) => {
    // if ({}.hasOwnProperty.call(options, paramName)) {
    //   force[paramName](options[paramName]);
    // }
    if (options[paramName] !== force[paramName]()) {
      // console.log('update', paramName);
      force[paramName](options[paramName]);
      force.shouldRun = true;
    }
  });

  return force;
}

/* 
  Heavy duty, replace the d3 update pattern
  this is where new nodes and links data is passed to force
  the reason behind is not to mutate the data
  we know force layout will mutate x and y
  to avoid that, we give them a new object (Object.assign)
  use set equal checks to avoid unnecessary binding
  
  Notice:
  1. We want to keep the previous x and y value for the same node
  2. When the link, we assume the link from props does not have source and target reference built up
     Thus we always need to built up its reference here 
     ->When there is a new link
     ->AND when force nodes updated(because force links always need to point to the actual force nodes)
*/
function applyNodesAndLinks(force, {
  links,
  nodes,
}) {
  // set the nodes and links for this force. provide
  // new instances to avoid mutating the underlying values.
  // only update if there are changes.
  const prevNodesSet = new Set(force.nodes().map(getNodeKey));
  const newNodesSet = new Set(nodes.map(getNodeKey));
  let updateLinks = false;
  if (!setsEqual(prevNodesSet, newNodesSet)) {
    force.shouldRun = true;
    const key2fnodeMap = {}; //set a new map of nodeKey to new force node
    const fnodes = nodes.map((node) => {
      let fnode = {}; //a new force node object
      const nodeKey = getNodeKey(node);
      //update the map
      key2fnodeMap[nodeKey] = fnode;

      //copy the desired node properties to the force nodes, Maybe after force nodes copy?
      DESIRED_FORCE_NODE_PROPS.reduce((obj, prop)=>(
        Object.assign(obj, {[prop]: node[prop]})
      ), fnode);

      //copy the previous force node's properties if it previously exists
      //otherwise it will just jump to a random position
      if (force.key2fnodeMap && force.key2fnodeMap[nodeKey]) {
        Object.assign(fnode, force.key2fnodeMap[nodeKey]);
      }

      return fnode;
    });

    force.nodes(fnodes);
    force.key2fnodeMap = key2fnodeMap;
    updateLinks = true; //must update the links connection if nodes is updated
  }

  const prevLinksSet = new Set(force.links().map(getLinkKey));
  const newLinksSet = new Set(links.map(getLinkKey));
  if (!setsEqual(prevLinksSet, newLinksSet) || updateLinks) {
    force.shouldRun = true;
    //use the real 'node' used by the current force to ensure the connection
    const flinks = links.map(l=>({
      source: force.key2fnodeMap[l.source],
      target: force.key2fnodeMap[l.target],
    }));
    //the force link is, just  {source, target}...yeah, what else should it knows
    force.links(flinks);
  }
}



// ---- PUBLIC METHODS ----

//KEY, like the key function of d3 data binding, for glm format, use 'name' as the key
export function getNodeKey(node) {
  return node.name;
}

export function getLinkKey(link) {
  return `${link.source.name || link.source}-${link.target.name || link.target}`;
}

//UI related methods (used it for calculating the contour!)
export function getHullVertices(fnodes) {
  const vertices = fnodes.map(d=>[d.x, d.y]);
  return d3.geom.hull(vertices);
}

export function getVerticesCentroid(vertices) {
  return d3.geom.polygon(vertices).centroid();
}

export function getCentroid(fnodes) {
  return getVerticesCentroid(getHullVertices(fnodes));
}


export function createForce(options) {
  const force = d3.layout.force();
  force.key2fnodeMap = {};
  return updateForce(force, options);
}

export function updateForce(force, options) {
  applySize(force, options);
  applyForceLayoutVars(force, options);
  applyNodesAndLinks(force, options);

  if (force.shouldRun) {
    console.log('should run');
    force.start();
  }
  force.shouldRun = null;
  return force;
}

import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';



// function mouse(container, event) {
//   const rect = container.getBoundingClientRect();
//   const x = event.clientX - rect.left - container.clientLeft;
//   const y = event.clientY - rect.top - container.clientTop;
//   return [x, y];
// }


// const points = [
//   {
//     x: 100,
//     y: 100,
//   },
//   {
//     x: 200,
//     y: 100,
//   }
// ]

// class Example extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//     }
//     this.onMouseDown = this.onMouseDown.bind(this);
//     this.onMouseMove = this.onMouseMove.bind(this);
//     this.onMouseUp = this.onMouseUp.bind(this);
//   }

//   onMouseDown(event) {
//     // ignore non-left buttons.
//     if (event.button !== 0) {
//       return null;
//     }

//     return this.setState({
//       dragging: true,
//       dragX: event.clientX,
//       dragY: event.clientY,
//     })
//   }

//   _onDragStart(point, event) {
//     event.stopPropagation();
//     document.addEventListener('mousemove', this._onDrag, false);
//     document.addEventListener('mouseup', this._onDragEnd, false);
//   }

//   _onDrag(event) {
//     event.stopPropagation();
//     const pixel = mouse(this.refs.container, event);
//     const svg = 'laohuang';
//     const position = ''
//   }

//   onMouseMove(event) {
//     if (!this.state.dragging) {
//       return event;
//     }

//     return this.dragBy(event.clientX, event.clientY);
//   }

//   dragBy(clientX, clientY, event) {
//     // const { width, height } = this.props;
//     const {
//       dragX: prevDragX,
//       dragY: prevDragY,
//     } = this.state;


//     const dx = clientX - prevDragX;
//     const dy = clientY - prevDragY;

//     console.log('client', clientX, clientY);

//     this.setState({
//       dragX: clientX,
//       dragY: clientY,
//     })
//   }

//   onMouseUp(event) {
//     this.setState({
//       dragging: false,
//       dragX: null,
//       dragY: null,
//     });
//   }


//   render() {
//     const { width, height, points } = this.props;
//     console.log('======example render');
//     // onMouseDown
//     // onMouseMove
//     // onMouseUp

//     return (
//       <svg
//         width={width}
//         height={height}
//         style={{
//           background: 'lightyellow'
//         }}
//       >
//         <g>
//           {
//             points.map((point, index)=> {
//               return (
//                 <g
//                   key={ index }
//                   transform={`translate(${point.x}, ${point.y})`}
//                   onMouseDown={this.onMouseDown}
//                 >
//                   <circle
//                     r={5}
//                     cx={0}
//                     cy={0}/>
//                 </g>
//               )
//             })
//           }
//         </g>
//       </svg>
//     )
//   }
// }


// var App = React.createClass({
//   onMouseDown() {
//     console.log('--app setState')
//     this.setState({
//       value: Math.random()
//     })
//   },

//   render() {
//     console.log('app render');
//     return (<Example points={points} width={500} height={500} onMouseDown={this.onMouseDown} />)
//   }
// })


// class Child extends React.PureComponent {
//   render() {
//     console.log('Child render');
//     return (
//       <div>child</div>
//     )
//   }
// }



// function renderChild(d) {
//   return (
//     <div>{'child' + d}</div>
//   )
// }



// // const nodes = [1,2,3,4,5,6,7];


// class Parent extends React.Component {
//   componentDidMount() {
//     setInterval(() => {
//       this.setState({
//         val: Math.random()
//       })
//     }, 1000);
//   }
//   render() {
//     console.log('parent render');
//     const children = nodes.map((d, i) => {
//       return (
//         <div key={i}>
//           {renderChild.call(this, d, i)}
//         </div>
//       )
//     });

//     return (
//       <div>
//         {children}
//       </div>
//     )
//   }
// }


// // ReactDOM.render(
// //   <Parent width={500} height={500}/>,
// //   document.getElementById('root')
// // )


// import d3 from 'd3';



// var svg = d3.select('#root').append('svg')
//   .attr('width', 500)
//   .attr('height', 500)
//   .style({
//     background: 'lightyellow'
//   })


// var g = svg.append('g')
//   .attr('class', 'zoomBase')
//   .attr('transform', 'scale(1.2)')

// // var vis = g.append('g');
// // var vis = g.append('g');
// // var vis = g.append('g');
// // var vis = g.append('g');
// var vis = g;

// vis.append('rect')
//   .attr('width', 50)
//   .attr('height', 50)
//   .attr('x', 50)
//   .attr('y', 50)
//   .on('click', function() {
//     console.log(this);
//     console.log(this.ownerSVGElement.getScreenCTM().inverse());
//     console.log(this.parentNode.getScreenCTM().inverse());

//   })


import jsondata from './data2';
import DynamicForce from './components/DynamicForce';
import InteractiveDynamicForce from './components/InteractiveDynamicForce';


// var pgForce = {
//   gravity: 0.01, //True, maybe
//   friction: 0.9,
//   charge: -5,
//   linkDistance: 5,
//   linkStrength: 5,
//   theta: 0.8,
//   size: [9, 1000]
// }

var demo_options = {
  charge: -120,
  linkDistance: 30,
  size: [960, 500]
};



// const nodes = jsondata.nodes.map((n, i)=>{
//   return {
//     ...n,
//     name: i + '',
//   }
// });

// const links = jsondata.links.map(l=>{
//   return {
//     source: l.source + '',
//     target: l.target + '',
//   }
// })

const nodes = jsondata.nodes;
const links = jsondata.links;
// // nodes.forEach(n=>{n.selected = true; n.highlighted = true});
var element = <InteractiveDynamicForce initNodes={nodes} initLinks={links} width={960} height={500} forceOptions={demo_options}/>
ReactDOM.render(element, document.getElementById('root'));



// ReactDOM.render(element, document.getElementById('root'))




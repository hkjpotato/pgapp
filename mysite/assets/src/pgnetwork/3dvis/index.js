// import React from 'react';
import ReactDOM from 'react-dom';
// import ReactDataGrid from 'react-data-grid';
// import glm_object_properties from './utils/glm_object_properties'

// const object = 'node';
// console.log(glm_object_properties['node']);


// console.log()
// class Example extends React.Component {
//   constructor(props) {
//     super(props);
//     // this.state = {
//     // }
//     this._rows = [
//       {
//         id: 1,
//         value: 100
//       },
//       {
//         id: 2,
//         value: 200
//       },
//       {
//         id: 3,
//         // value: 2
//       }
//     ];
//     this._columns = [
//       {key: 'id', name: 'ID' },
//       {key: 'value', name: 'msg' },
//       {key: 'hi', name: 'HI'},
//     ];

//     this._columns = glm_object_properties['node'].map((key)=>({
//       key: key,
//       // name: key.toUpperCase(),
//       name: key,
//       // width: 200,
//       resizable: true,
//     }))


//     this.rowGetter = this.rowGetter.bind(this);
//   }
//   rowGetter(i) {
//     return this._rows[i];
//   }
//   render() {
//     return (
//       <ReactDataGrid
//         columns={this._columns}
//         rowGetter={this.rowGetter}
//         rowsCount={this._rows.length}
//         minHeight={500} />
//     );
//   }
// }

// const Example = React.createClass({
//   getInitialState() {
//     this.createRows();
//     this._columns = [
//       { key: 'id', name: 'ID' },
//       { key: 'title', name: 'Title' },
//       { key: 'count', name: 'Count' } ];

//     return null;
//   },

//   createRows() {
//     let rows = [];
//     for (let i = 1; i < 1000; i++) {
//       rows.push({
//         id: i,
//         title: 'Title ' + i,
//         count: i * 1000
//       });
//     }

//     this._rows = rows;
//   },

//   rowGetter(i) {
//     return this._rows[i];
//   },

//   render() {
//     return  (
//       <ReactDataGrid
//         columns={this._columns}
//         rowGetter={this.rowGetter}
//         rowsCount={this._rows.length}
//         minHeight={500} />);
//   }
// });




/// app.js
import React, {Component} from 'react';
import MapGL from 'react-map-gl';
import Immutable from 'immutable';
import ScatterPlotOverlay from 'react-map-gl/src/overlays/scatterplot.react';
import DraggablePoints from 'react-map-gl/src/overlays/draggable-points.react';


// import Test from './components/Test'
// Set your mapbox access token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGtqcG90YXRvIiwiYSI6ImNqNDlmazNpNzB3bmwzM3FsN3psZzlubjMifQ.Eb3uP8dKNBuIaF0vMk7fuw';


var locations = Immutable.fromJS([
  [-122.39851786165565, 37.78736425435588],
  [-122.40015469418074, 37.78531678199267],
  [-122.4124101516789, 37.80051001607987],
  // ...
]);
var rawPoints = [
  {location:[-122.39508481737994, 37.79450507471435 ], id: 0},
  {location:[-122.39750244137034, 37.79227619464379 ], id: 1},
  {location:[-122.4013303460217,  37.789251178427776], id: 2},
]

var m = 2;
while(m++ < 4) {
  rawPoints.push({
    location: [-122.39508481737994 + Math.random() / 100, 37.79450507471435 - Math.random() / 100],
    id: m
  })
}



var points = Immutable.fromJS(rawPoints);



function lngLatAccessor(location) {
  return [location.get(0), location.get(1)];
}


class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.785164,
        longitude: -122.41669,
        zoom: 12,
        bearing: 0,
        pitch: 60,
        width: 500,
        height: 500,
        isDragging: false,
      },
      points: points
    };



    this.updatePoint = this.updatePoint.bind(this);
  }
  updatePoint({key, location}) {
    // console.log('updatePoint', key)
    var points = this.state.points.map(point => {
      var id = point.get('id');
      return id === key ? point.set('location', Immutable.List(location)) : point;
    });
    this.setState({points: points});
  }
  render() {
    //use state's params for rendering
    const {viewport, points} = this.state;

    return (
      <MapGL
        {...viewport}
        preventStyleDiffing={true}
        onChangeViewport={v=>{
          // console.log(v);
          this.setState({
            viewport: {
              ...this.state.viewport,
              ...v
            }
          })
        }}
        mapboxApiAccessToken={MAPBOX_TOKEN}>



        <DraggablePoints
          {...viewport}
          points={points}
          onUpdatePoint={this.updatePoint}
          renderPoint={point => {
            var scale = point.get('id') / 10 + 1;
            return <g transform={'scale(' + 1 + ')'}>
              <circle r="3"></circle>
            </g>;
          }}
        />
      </MapGL>
    );
  }
}

        // <ScatterPlotOverlay 
        //   {...viewport}
        //   locations={locations}
        //   dotRadius={4} 
        //   globalOpacity={1} 
        //   compositeOperation="source-over"
        //   dotFill="#1FBAD6"
        //   renderWhileDragging={true} 
        // />

        // <DeckGL
        //   {...viewport}
        //   width={width}
        //   height={height}
        //   debug
        //   layers={[
        //     new LineLayer({
        //       data: [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}]
        //     })
        //   ]} />





ReactDOM.render(
  <Root />,
  document.getElementById('root')
)


import React from 'react';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';

import document from 'global/document';
import window from 'global/window';
const {projectName, feederName} = window;


import App from './components/App';
import columnsByObject from './utils/columns_by_object';



// Object.keys(columnsByObject).forEach(function(obj) {
//   if (columnsByObject[obj].length <= 13) {
//     // console.log(obj);
//     columnsByObject[obj].forEach(function(col) {
//       delete col.width;
//     })
//   }
// })

//TODO: try to make the datastore
// createDataStore() {
//   let data = {};
//   let listeners = [];
//   function fetchRows() {

//   }
//   function updateRows() {

//   }
//   function addEventListener(listener) {

//   }
// }


//global
history.pushState(null, null, location.href);
window.onpopstate = function(event) {
    history.go(1);
};


//Interaction with data
const feederAPI =  `/projects/${projectName}/${feederName}`;
let pgJson = null;

$.ajax({
  dataType: "json",
  url: feederAPI + '/get_pg_json',
  success: (data) => {
    pgJson = data;
  }
});

function fetchRows(object) {
  return new Promise((resolve, reject)=>{
    //https://stackoverflow.com/questions/9516900/how-can-i-create-an-asynchronous-function-in-javascript
    setTimeout(() => {
      const rows = [];
      //TODO, use es5 map
      for (var key in pgJson) {
        // console.log(key)
        if ('object' in pgJson[key] && pgJson[key]['object'] === object) {
          rows.push({...pgJson[key], glmIndex: +key})
        }
      }
      resolve(rows);
    }, 0);
  });
}

function updateRow(updatedRow) {
  return new Promise((resolve, reject)=> {
    setTimeout(() => {
      const glmIndex = updatedRow['glmIndex'];
      if (glmIndex in pgJson) {
        pgJson[glmIndex] = updatedRow;
        resolve(updatedRow);
      } else {
        reject(updatedRow);
      }
    }, 0);
  })
}

function savePgData() {
  //AJAX
  $.ajax({
      url: feederAPI + '/save_pg_json',
      type: "POST",
      data: JSON.stringify(pgJson),
      // processData: false,
      contentType: "application/json; charset=UTF-8",
      success: function() {
        alert('success updated!');
      }
  });
}


class TableManager extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currObject: null,
      currColumns: [],
      currRows: [], //the state, update locally and remotely
      ready: true,
    }
    this.onPgSaveBtnClick = this.onPgSaveBtnClick.bind(this);
    this.onObjectBtnClick = this.onObjectBtnClick.bind(this);
    this.handleGridRowsUpdated = this.handleGridRowsUpdated.bind(this);
  }
  onPgSaveBtnClick(e) {
    // console.log('onPgSaveBtnClick');
    savePgData();
  }
  onObjectBtnClick(nextObject) {
    if (nextObject !== this.state.currObject) {
      // fetch the columns and rows for the next object

      // should be async
      fetchRows(nextObject).then((rows)=>{
        console.log('after fetch row data', rows.length);
        this.setState({
          currRows: rows,
          ready: true,
        });
      });

      console.log('set ready false');
      this.setState({
        currObject: nextObject,
        currColumns: columnsByObject[nextObject],
        currRows: [],
        ready: false,
      });
    }
  }
  handleGridRowsUpdated({fromRow, toRow, updated}) {
    // console.log(fromRow, toRow, updated);
    let rows = this.state.currRows.slice();
    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = {
        ...rowToUpdate,
        ...updated
      }
      //database update
      updateRow(updatedRow)
        .then((updatedRow)=>{
          console.log('success updated', updatedRow);
        })
        .catch((updatedRow)=>{
          alert(`object ${updatedRow.object} idx ${updateRow.glmIndex} update fails, please check it!`);
        });

      rows[i] = updatedRow;
    }

    this.setState({
      currRows: rows
    });
  }

  componentDidMount() {
    //register for data
  }

  componentWillUnmount() {

  }
  render() {
    const {projectName, feederName} = this.props;
    const eventHandlers = {
      onPgSaveBtnClick: this.onPgSaveBtnClick,
      onObjectBtnClick: this.onObjectBtnClick,
      handleGridRowsUpdated: this.handleGridRowsUpdated,
    }
    return (
      <App
        {...this.props}
        {...this.state}
        {...eventHandlers} />
    )
  }
}



ReactDOM.render(
  <TableManager projectName={projectName} feederName={feederName}/>,
  document.getElementById('root')
)


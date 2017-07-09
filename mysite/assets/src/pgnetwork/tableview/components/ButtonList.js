import React from 'react';
import objectList from './../utils/objects_list';

//make it a presentational component
export default function ButtonList(props) {
  const {onClick } = props;
  const buttons = objectList.map(obj=>(
    <button
      style={{
        textAlign: 'left'
      }}
      key={obj}
      type="button"
      onClick={()=>{
        onClick(obj);
      }}
      className="btn btn-default"
    >
    {obj}
    </button>
  ));
  return (
    <div 
      className="btn-group-vertical btn-group-xs" 
      role="group"
      style={{
        maxHeight: window.innerHeight - 100,
        overflowY: 'scroll',
        border: '1px solid #ddd'
      }}
    >
      {buttons}
    </div>
  )
}
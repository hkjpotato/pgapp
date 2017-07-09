import React from 'react';
import ButtonList from './ButtonList';
import TablePresenter from './TablePresenter';

export default class App extends React.PureComponent {
  render() {
    const { 
      projectName, 
      feederName, 
      currObject,
      currColumns,
      currRows,
      onObjectBtnClick,
      onPgSaveBtnClick,
      handleGridRowsUpdated,
      ready,
    } = this.props;
    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <h5>
              {projectName} 
              &nbsp;
              <i className="fa fa-long-arrow-right"></i>
              &nbsp;
              {feederName}
              {currObject ? (
                <span>
                  &nbsp;
                  <i className="fa fa-long-arrow-right"></i>
                  &nbsp;
                  <span className="label label-success" style={{fontSize: 14}}>{`${currObject}(${currRows.length})`}</span>
                </span>
              ) : null}
              </h5>
          </div>
          <div className="col-sm-6">
            <button 
              className="btn btn-success pull-right btn-sm" 
              style={{
                marginTop: 5
              }}
              onClick={onPgSaveBtnClick}
            >
              <i className="fa fa-cloud-upload"></i>Save
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-2" >
            <ButtonList onClick={onObjectBtnClick} />
          </div>
          <div className="col-sm-10">
            {
              ready ? (
                <TablePresenter 
                  rows={currRows} 
                  columns={currColumns}
                  handleGridRowsUpdated={handleGridRowsUpdated}  />
              ) : 'loading data...' 
            }
          </div>
        </div>
      </div>
    )
  }
}
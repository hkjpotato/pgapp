import ReactDataGrid from 'react-data-grid';
import React, { PropTypes } from 'react';
export default class TablePresenter extends React.PureComponent {
  static get defaultProps() {
    return {
      columns: [],
      rows: [],
    }
  }
  constructor(props) {
    super(props);
    this.rowGetter = this.rowGetter.bind(this);
  }
  rowGetter(i) {
    return this.props.rows[i];
  }
  render() {
    const { rows, columns, handleGridRowsUpdated } = this.props;
    return (
      <div style={{
        fontSize: '0.8em'
      }}>
        <ReactDataGrid
          enableCellSelect={true}
          columns={columns}
          rowGetter={this.rowGetter}
          rowsCount={rows.length}
          minHeight={window.innerHeight - 100}
          rowHeight={30}
          onGridRowsUpdated={handleGridRowsUpdated}
        >
        </ReactDataGrid>
      </div>
    );
  }
}
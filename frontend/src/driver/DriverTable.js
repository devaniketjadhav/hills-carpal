import matchSorter from 'match-sorter';
import history from '../history';
import moment from 'moment';
import Table from '../components/table';

import React, { Component } from 'react';
const columns = [
  {
    Header: 'Pickup Time',
    id: 'pickupTimeAndDateInUTC',
    accessor: cell => moment(cell).format('dddd hh:mma DD/MM/YYYY'),
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['pickupTimeAndDateInUTC'] }),
    filterAll: true,
  },
  {
    Header: 'Location from',
    id: 'locationFrom',
    accessor: cell => cell.locationFrom.placeName,
    filterMethod: (filter, rows) => {
      return matchSorter(rows, filter.value, { keys: ['locationFrom'] });
    },
    filterAll: true,
  },
  {
    id: 'locationTo',
    Header: 'Location to',
    accessor: cell => cell.locationTo.placeName,
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['locationTo'] }),
    filterAll: true,
  },
  {
    id: 'fbLink',
    Header: 'Facebook link',
    accessor: cell => (
      <a href={cell.fbLink} target="blank">
        Go to facebook event
      </a>
    ),
  },
];

class DriverTable extends Component {
  render() {
    return (
      <Table
        style={{ paddingTop: '10px' }}
        data={this.props.rides}
        columns={columns}
      />
    );
  }
}

export default DriverTable;

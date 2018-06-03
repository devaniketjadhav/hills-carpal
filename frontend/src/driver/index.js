import React, { Component } from "react";
import moment from "moment";
import axiosInstance from "../auth/api";
import Table from "../components/table";
import matchSorter from "match-sorter";
import history from "../history";

const columns = [
  {
    Header: "Pickup Time",
    id: "pickupTimeAndDateInUTC",
    accessor: cell => moment(cell).format("YYYY-MM-DD"),
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ["pickupTimeAndDateInUTC"] }),
    filterAll: true
  },
  {
    Header: "Location from",
    id: "locationFrom",
    accessor: cell => cell.locationFrom.placeName,
    filterMethod: (filter, rows) => {
      return matchSorter(rows, filter.value, { keys: ["locationFrom"] });
    },
    filterAll: true
  },
  {
    id: "locationTo",
    Header: "Location to",
    accessor: cell => cell.locationTo.placeName,
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ["locationTo"] }),
    filterAll: true
  },
  {
    id: "fbLink",
    Header: "Facebook link",
    accessor: cell => (
      <a href={cell} target="blank">
        Go to facebook event
      </a>
    )
  }
];

class Driver extends Component {
  constructor() {
    super();
    this.state = { drives: null };
  }
  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      history.replace("/");
      return false;
    }

    // const url = process.env.REACT_APP_API_URL + '/drives'
    axiosInstance.get("/rides").then(res => {
      this.setState({ drives: res.data });
    });
  }
  render() {
    if (!this.state.drives) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    return (
      <div className="container">
        <h1>Find drives</h1>
        <Table data={this.state.drives} columns={columns} />
      </div>
    );
  }
}

Driver.propTypes = {};

export default Driver;

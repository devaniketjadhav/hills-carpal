import React, { Component } from 'react';
import history from 'next/router';
import LocationSearch from '../../../src/components/driver/location-search';
import qs from 'qs';
// import DriverTable from './DriverTable';
import DriverList from './DriverList';
import DriverMap from './DriverMap';

interface Props {}

class FindRides extends Component<Props> {
  state = {
    rides: null,
    page: 'table',
    driverCoords: null,
    showLocationSearch: false
  };

  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      history.replace('/');
      return false;
    }

    this.searchAllRides();
  }

  searchAllRides() {
    this.setState({
      loading: true
    });
    const url =
      process.env.REACT_APP_API_URL +
      '/rides?listType=driver&status=OPEN&includePast=false';
    axiosInstance
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({
          loading: false,
          rides: res.data
        });
      })
      .catch(e => {
        console.error(e);
        this.setState({
          loading: false,
          error: e
        });
      });
  }

  handleSearch({ locationFrom, locationTo }) {
    this.setState({
      loading: true
    });
    const query = {
      listType: 'driver',
      toLongitude: locationTo.longitude,
      toLatitude: locationTo.latitude,
      fromLongitude: locationFrom.longitude,
      fromLatitude: locationFrom.latitude
    };
    const qString = qs.stringify(query);
    axiosInstance
      .get('/rides?' + qString, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({
          loading: false,
          rides: res.data,
          driverCoords: { locationFrom, locationTo }
        });
      })
      .catch(e => {
        console.error(e);
        this.setState({
          loading: false,
          error: e
        });
      });
  }
  renderPage() {
    if (this.state.page === 'table') {
      return (
        <DriverList rides={this.state.rides} history={this.props.history} />
      );
    }
    return (
      <DriverMap
        onViewTableClick={() => this.setState({ page: 'table' })}
        driverCoords={this.state.driverCoords}
        rides={this.state.rides}
      />
    );
  }

  renderMapBtn() {
    const isMap = this.state.page === 'map';

    return (
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => this.setState({ page: isMap ? 'table' : 'map' })}
      >
        {isMap ? 'Use table instead' : 'Use map instead'}
      </button>
    );
  }

  toggleLocationSearchVisible = () => {
    this.setState(state => {
      if (state.showLocationSearch) {
        // We've just hidden the location search, so make sure the search results don't include it
        this.searchAllRides();
      }

      return {
        showLocationSearch: !state.showLocationSearch
      };
    });
  };

  renderLocationSearchBtn() {
    return (
      <button
        className={`btn btn-sm btn-outline-secondary ${
          this.state.showLocationSearch ? 'active' : ''
        }`}
        onClick={this.toggleLocationSearchVisible}
      >
        Filter by location
      </button>
    );
  }

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }
    if (this.state.error) {
      return (
        <span>
          Error: {this.state.error.message}. Please refresh the page to try
          again.
        </span>
      );
    }
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12 col-sm-6">
            <h4>Available Rides</h4>
          </div>
          {/* <div className="col-12 col-sm-6 text-left text-sm-right">
            <div className="btn-group">
              {this.renderLocationSearchBtn()}
              {this.renderMapBtn()}
            </div>
          </div> */}
        </div>
        {this.state.showLocationSearch && (
          <LocationSearch
            clearable={true}
            onLocationSearch={this.handleSearch}
          />
        )}
        {this.state.rides && this.state.rides.length > 0
          ? this.renderPage()
          : 'There are no rides available right now - try again later!'}
      </React.Fragment>
    );
  }
}

FindRides.propTypes = {};

export default FindRides;
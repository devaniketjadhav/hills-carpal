import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Link } from 'react-router-dom';
import LocationInput from '../components/location-input';
import axiosInstance from '../auth/api';
import history from '../history';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateNewRide.css';

class CreateNewRide extends Component {
  constructor() {
    super();
    this.state = {
      client: '',
      datetime: moment(),
      driverGender: '',
      locationTo: '',
      locationFrom: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const url = process.env.REACT_APP_API_URL || '';
    axiosInstance.post(url, this.state);
  }
  render() {
    return (
      <div className="container">
        <h1>Create new ride</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Client</label>
            <input
              required
              onChange={e => this.setState({ client: e.currentTarget.value })}
              type="text"
              name="client"
              className="form-control"
              placeholder="Type your name"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <DatePicker
              required
              selected={this.state.datetime}
              onChange={date => this.setState({ datetime: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="LLL"
              timeCaption="time"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Location from</label>
            <LocationInput
              required={true}
              value={this.state.locationFrom}
              onChange={value => {
                this.setState({ locationFrom: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Location to</label>
            <LocationInput
              required={true}
              value={this.state.locationTo}
              onChange={value => {
                this.setState({ locationTo: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Facebook link</label>
            <input
              onChange={e => this.setState({ fbLink: e.currentTarget.value })}
              type="text"
              name="fbLink"
              className="form-control"
              placeholder="Type your Facebook link here"
            />
          </div>
          <div className="form-group">
            <label>Driver Gender</label>
            <select
              required
              onChange={e => {
                this.setState({ driverGender: e.currentTarget.value });
              }}
              className="custom-select"
            >
              <option>Select from following</option>
              <option value="a">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Car type</label>

            <select
              required
              onChange={e => {
                this.setState({ carType: e.currentTarget.value });
              }}
              className="custom-select"
            >
              <option>Select from following</option>
              <option value="noSUV">No SUV</option>
              <option value="All">All</option>
            </select>
          </div>
          <label />
          <div
            className="btn-group mr-2"
            role="group"
            aria-label="Basic example"
          >
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </div>
          <div
            className="btn-group mr-2"
            role="group"
            aria-label="Basic example"
          >
            <Link className="btn btn-secondary" to={'/facilitator'}>
              Back
            </Link>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateNewRide;

import React, { Component } from "react";
import "./App.css";
import Login from "./Login.js";
import Facilitator from "./facilitator/";

import axios from "axios";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userRole: "facilitator"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit({ username, password }) {
    const URL = process.env.API_URL || "";
    axios.post(URL + "/login", { username, password }).then(response => {
      this.setState({ userRole: response.data.role });
    });
  }
  render() {
    if (!this.state.userRole) {
      return <Login onSubmit={this.handleSubmit} />;
    }
    if (this.state.userRole === "facilitator") {
      return <Facilitator />;
    }
    if (this.state.userRole === "driver") {
      return <p> This should be a facilitator screen </p>;
    }
    return null;
  }
}

export default App;

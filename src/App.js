import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class LambdaDemo extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, msg: null };
  }

  handleClick = api => e => {
    e.preventDefault();

    this.setState({ loading: true });
    fetch("/.netlify/functions/" + api)
      .then(response => response.json())
      .then(json => this.setState({ loading: false, msg: json.msg }));
  };

  render() {
    const { loading, msg } = this.state;

    return (
      <p>
        <button onClick={this.handleClick("hello")}>
          {loading ? "Loading..." : "Call Lambda"}
        </button>
        <button onClick={this.handleClick("async-chuck-norris")}>
          {loading ? "Loading..." : "Call Async Lambda"}
        </button>
        <button
          onClick={this.handleClick(
            "autocrop?imageX=0&imageY=0&imageWidth=450&imageHeight=600&cropX=0&cropY=0&cropWidth=107&cropHeight=248&cropStyle=1&rubberBandX=158.66666666666666&rubberBandY=102.66666666666666&rubberBandWidth=80&rubberBandHeight=78.66666666666666"
          )}
        >
          {loading ? "Loading..." : "Call Autocrop Lambda"}
        </button>
        <br />
        <span>{msg}</span>
      </p>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <LambdaDemo />
        </header>
      </div>
    );
  }
}

export default App;

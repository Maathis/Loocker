import { Component } from "react";

export class Dashboard extends Component {
    render() {
      return <h1>Hello, {this.props.name}!</h1>;
    }
}
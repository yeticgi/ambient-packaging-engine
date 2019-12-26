import React, { Component } from "react";
import "./App.css";

var foo = 'foo';
export class App extends Component {
    render() {
        console.log(foo);
        foo += 'bar';
        return (
            <div className="app">
                <h1 className="helloWorld">Hello World</h1>
            </div>
        );
    }
}
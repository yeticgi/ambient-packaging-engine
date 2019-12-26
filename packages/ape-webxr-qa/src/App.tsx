import React, { Component } from "react";
import "./App.css";
// import { HelloWorld } from '../../ape-reactcomponents/dist';
import { HelloWorld } from '@yeticgi/ape-reactcomponents'

export class App extends Component {
    render() {
        return (
            <div className="app">
                <HelloWorld />
            </div>
        );
    }
}
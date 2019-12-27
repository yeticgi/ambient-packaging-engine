import React, { Component } from "react";
import "./App.css";
import { 
    HelloWorld, 
    TicTacToe 
} from '@yeticgi/ape-reactcomponents'

export class App extends Component {
    render() {
        return (
            <div className="app">
                <HelloWorld />
                <TicTacToe />
            </div>
        );
    }
}
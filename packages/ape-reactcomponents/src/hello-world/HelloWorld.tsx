import React, { Component } from "react";
import "./HelloWorld.css";

import reactLogo from './public/logo192.png';

export class HelloWorld extends Component {
    render() {
        return (
            <div>
                <img src={reactLogo} />
                <p className="helloWorld">Hello World!</p>
            </div>
        );
    }
}
import React from 'react';
import './TicTacToe.css';
import logo from './public/tictactoe.gif';

export function TicTacToeLogo(props: any): JSX.Element {
    return (
        <img className="logo" src={logo} />
    );
}
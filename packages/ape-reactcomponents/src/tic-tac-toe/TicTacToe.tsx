import React from 'react';
import './TicTacToe.css';
import { Board } from './Board';
import { TicTacToeLogo } from './TicTacToeLogo';

export class TicTacToe extends React.Component {
    render() {
        return (
            <div className="game">
                <div>
                    <TicTacToeLogo />
                </div>
                <div>
                    <div className="game-board">
                        <Board />
                    </div>
                </div>
            </div>
        );
    }
}
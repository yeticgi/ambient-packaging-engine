import React from 'react';
import './TicTacToe.css';
import { Mark } from './Board';

interface ISquareProps {
    number: number
    mark: Mark
    onClick(id: number): void
}

export function Square(props: ISquareProps): JSX.Element {
    return (
        <button
            className="square"
            onClick={() => { props.onClick(props.number) }}
        >
            {props.mark}
        </button>
    );
}
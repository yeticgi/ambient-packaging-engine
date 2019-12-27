import React from 'react';
import './TicTacToe.css';
import { Square } from './Square';


interface IBoardState {
    squares: Mark[]
    nextMark: Mark
}

export type Mark = 'X' | 'O' | null;

export class Board extends React.Component<{}, IBoardState> {
    constructor(props: any) {
        super(props);
        this.state = {
            squares: Array<Mark>(9).fill(null),
            nextMark: 'X'
        };

        this.handleSquareClick = this.handleSquareClick.bind(this);
    }

    renderSquare(i: number) {
        return <Square
            number={i}
            mark={this.state.squares[i]}
            onClick={this.handleSquareClick}
        />;
    }

    render() {
        const winner = calculateWinner(this.state.squares);
        let status: string;
        if (winner) {
            status = `Winner: ${winner}`;
        } else {
            status = `Next Player: ${this.state.nextMark}`;
        }

        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }

    handleSquareClick(number: number): void {
        if (this.state.squares[number]) {
            // Spot already filled.
            return;
        }
        if (calculateWinner(this.state.squares)) {
            // Already have a winner.
            return;
        }
        
        // let squares = Object.assign({}, this.state.squares);
        let squares = [...this.state.squares];
        squares[number] = this.state.nextMark;

        this.setState({
            squares,
            nextMark: (this.state.nextMark === 'X' ? 'O' : 'X')
        });
    }
}

function calculateWinner(squares: Mark[]): Mark {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
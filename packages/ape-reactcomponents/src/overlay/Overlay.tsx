import React, { Component } from "react";

interface IOverlayProps {
    /**
     * Color of the overlay
     */
    color?: string;

    /**
     * Callback made when the overlay is clicked.
     */
    onClick?: () => void;
}

export class Overlay extends Component<IOverlayProps> {

    constructor(props: IOverlayProps) {
        super(props);
    }

    render() {
        const style: React.CSSProperties = {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            backgroundColor: this.props.color ?? 'rgba(0,0,0,0.5)'
        };
        return (
            <div id='overlay' 
                style={style}
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }} 
            />
        );
    }
}
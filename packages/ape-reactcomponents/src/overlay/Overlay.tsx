import React, { Component } from "react";

interface IOverlayProps {
    /**
     * Wether or not the overlay is open.
     */
    isOpen: boolean;

    /**
     * Color of the overlay
     */
    color?: string;

    /**
     * Can overlay request close by being clicked on?
     */
    canCloseByClick?: boolean;

    /**
     * The callback made when the overlay wants to close. It's the job of the parent component to close the overlay.
     */
    onRequestClose: () => void;
}

export class Overlay extends Component<IOverlayProps> {

    constructor(props: IOverlayProps) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        console.log(`[Overlay] onClick`);
        if (this.props.canCloseByClick) {
            this.props.onRequestClose();
        }
    }

    render() {
        if (this.props.isOpen) {
            const style: React.CSSProperties = {
                position: 'fixed',
                top: '0px',
                left: '0px',
                width: '100%',
                height: '100%',
                backgroundColor: this.props.color ?? 'rgba(0,0,0,0.5)'
            };
            return (
                <div id='overlay' style={style} onClick={this.onClick} />
            );
        } else {
            return null;
        }
    }
}
import { Component } from "react";
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
export declare class Overlay extends Component<IOverlayProps> {
    constructor(props: IOverlayProps);
    render(): JSX.Element;
}
export {};

/*! window-post-message-proxy v0.2.14 | (c) 2016 Microsoft Corporation MIT */
interface ITrackingProperties {
    id: string;
    source: string;
    target?: string;
}
interface IAddTrackingProperties {
    <T>(message: T, trackingProperties: ITrackingProperties): T;
}
interface IGetTrackingProperties {
    (message: any): ITrackingProperties;
}
interface IProcessTrackingProperties {
    addTrackingProperties: IAddTrackingProperties;
    getTrackingProperties: IGetTrackingProperties;
}
interface IIsErrorMessage {
    (message: any): boolean;
}
interface IExtractErrorMessage {
    (message: any): any;
}
interface IMessageHandler {
    test(message: any): boolean;
    handle(message: any): any;
}
interface IWindowPostMessageProxyOptions {
    receiveWindow?: Window;
    processTrackingProperties?: IProcessTrackingProperties;
    isErrorMessage?: IIsErrorMessage;
    extractErrorMessage?: IExtractErrorMessage;
    name?: string;
    target?: string;
    logMessages?: boolean;
    eventSourceOverrideWindow?: Window;
    suppressWarnings?: boolean;
}
declare class WindowPostMessageProxy {
    static defaultAddTrackingProperties<T>(message: T, trackingProperties: ITrackingProperties): T;
    static defaultGetTrackingProperties(message: any): ITrackingProperties;
    static defaultIsErrorMessage(message: any): boolean;
    static defaultExtractErrorMessage(message: any): any;
    private static messagePropertyName;
    /**
     * Utility to create a deferred object.
     */
    private static createDeferred;
    /**
     * Utility to generate random sequence of characters used as tracking id for promises.
     */
    private static createRandomString;
    private logMessages;
    private name;
    private target?;
    private addTrackingProperties;
    private getTrackingProperties;
    private isErrorMessage;
    private extractErrorMessage;
    private receiveWindow;
    private pendingRequestPromises;
    private handlers;
    private windowMessageHandler;
    private eventSourceOverrideWindow;
    private suppressWarnings;
    constructor(options?: IWindowPostMessageProxyOptions);
    /**
     * Adds handler.
     * If the first handler whose test method returns true will handle the message and provide a response.
     */
    addHandler(handler: IMessageHandler): void;
    /**
     * Removes handler.
     * The reference must match the original object that was provided when adding the handler.
     */
    removeHandler(handler: IMessageHandler): void;
    /**
     * Start listening to message events.
     */
    start(): void;
    /**
     * Stops listening to message events.
     */
    stop(): void;
    /**
     * Post message to target window with tracking properties added and save deferred object referenced by tracking id.
     */
    postMessage<T>(targetWindow: Window, message: any): Promise<T>;
    /**
     * Send response message to target window.
     * Response messages re-use tracking properties from a previous request message.
     */
    private sendResponse;
    /**
     * Message handler.
     */
    private onMessageReceived;
}

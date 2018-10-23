import {
    CloseRequestMessage,
    ConnectRequestMessage,
    ErrorMessage,
    MqttPayloadMessage,
    MqttStateMessage,
    PingMessage,
    PublishRequestMessage,
    SubscribeRequestMessage,
    UnsubscribeRequestMessage,
} from './message';

export interface SharedWorker extends EventTarget, AbstractWorker {
    port: MessagePort;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void;
}

export interface SharedWorkerConstructor {
    prototype: SharedWorker;
    new (stringUrl: string, name?: string): SharedWorker;
}

export interface WindowStateEvent extends MessageEvent {
    data: PingMessage | MqttStateMessage;
}

export interface WindowSubscriptionEvent extends MessageEvent {
    data: PingMessage | ErrorMessage | MqttPayloadMessage;
}

export interface WindowConnectionPort extends MessagePort {
    onmessage: null | ((event: WindowStateEvent) => void);
    postMessage(
        message:
            | PingMessage
            | ConnectRequestMessage
            | CloseRequestMessage
            | PublishRequestMessage
            | SubscribeRequestMessage
            | UnsubscribeRequestMessage
    ): void;
    addEventListener(type: 'message', listener: (event: WindowStateEvent | WindowSubscriptionEvent) => void): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;
}

export interface WindowConnectionWorker extends SharedWorker {
    port: WindowConnectionPort;
}

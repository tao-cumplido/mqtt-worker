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

export interface WindowConnectionEvent extends MessageEvent {
    data: PingMessage | MqttStateMessage;
}

export interface WindowConnectionPort extends MessagePort {
    onmessage: null | ((event: WindowConnectionEvent) => void);
    postMessage(message: PingMessage | ConnectRequestMessage | CloseRequestMessage | PublishRequestMessage): void;
    addEventListener(type: 'message', listener: (event: WindowConnectionEvent) => void): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;
}

export interface WindowConnectionWorker extends SharedWorker {
    port: WindowConnectionPort;
}

export interface WindowSubscriptionEvent extends MessageEvent {
    data: PingMessage | ErrorMessage | MqttPayloadMessage;
}

export interface WindowSubscriptionPort extends MessagePort {
    onmessage: null | ((event: WindowSubscriptionEvent) => void);
    postMessage(message: PingMessage | SubscribeRequestMessage | UnsubscribeRequestMessage): void;
    addEventListener(type: 'message', listener: (event: WindowSubscriptionEvent) => void): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;
}

export interface WindowSubscriptionWorker extends SharedWorker {
    port: WindowSubscriptionPort;
}

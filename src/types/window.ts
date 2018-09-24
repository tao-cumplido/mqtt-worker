import {
    CloseRequestMessage,
    ConnectRequestMessage,
    ErrorMessage,
    Message,
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
    data: MqttStateMessage;
}

export interface WindowConnectionPort extends MessagePort {
    postMessage(
        message:
            | Message
            | PingMessage
            | ConnectRequestMessage
            | CloseRequestMessage
            | PublishRequestMessage
    ): void;
}

export interface WindowConnectionWorker extends SharedWorker {
    port: WindowConnectionPort;
}

export interface WindowSubscriptionEvent extends MessageEvent {
    data: PingMessage | ErrorMessage | MqttPayloadMessage;
}

export interface WindowSubscriptionPort extends MessagePort {
    postMessage(
        message:
            | Message
            | PingMessage
            | SubscribeRequestMessage
            | UnsubscribeRequestMessage
    ): void;
}

export interface WindowSubscriptionWorker extends SharedWorker {
    port: WindowSubscriptionPort;
}

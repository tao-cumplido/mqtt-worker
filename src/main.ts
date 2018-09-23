import {
    CloseRequestMessage,
    ConnectRequestMessage,
    MqttWorkerMessageEvent,
    PublishRequestMessage,
    SubscribeRequestMessage,
    UnsubscribeRequestMessage,
} from '@types';
import { MqttWorker } from './worker/mqtt-worker';
import { monitorPort, StatusPort } from './worker/port';

type ConnectEventHandler = (event: MessageEvent) => void;

interface SharedWorkerGlobalScope extends WorkerGlobalScope {
    readonly name: string;
    onconnect: null | ((event: MessageEvent) => void);
    // prettier-ignore
    addEventListener(type: 'connect', listener: ConnectEventHandler, options?: boolean | AddEventListenerOptions): void;;
    // prettier-ignore
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;;
    // prettier-ignore
    removeEventListener(type: 'connect', listener: ConnectEventHandler, options?: boolean | EventListenerOptions): void;;
    // prettier-ignore
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface RequestMessageEvent extends MqttWorkerMessageEvent {
    data:
        | ConnectRequestMessage
        | SubscribeRequestMessage
        | UnsubscribeRequestMessage
        | PublishRequestMessage
        | CloseRequestMessage;
}

interface MainPort extends StatusPort {
    // prettier-ignore
    addEventListener(type: 'message', listener: (event: RequestMessageEvent) => void, options?: boolean | AddEventListenerOptions): void;;
    // prettier-ignore
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;;
    // prettier-ignore
    removeEventListener(type: 'message', listener: (event: RequestMessageEvent) => void, options?: boolean | EventListenerOptions): void;;
    // prettier-ignore
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var self: SharedWorkerGlobalScope;

const worker = new MqttWorker();

self.onconnect = ({ ports: [port] }) => {
    const statusPort = monitorPort(port);

    (statusPort as MainPort).addEventListener('message', ({ data }) => {
        if (typeof data !== 'object') return;

        switch (data.type) {
            case 'connect':
                // https://github.com/prettier/prettier/issues/4935
                // prettier-ignore
                return worker.connect(statusPort, data);
            case 'subscribe':
                return worker.subscribe(statusPort, data);
            case 'unsubscribe':
                return worker.unsubscribe(statusPort, data);
            case 'close':
                return worker.close(statusPort, data);
        }
    });

    statusPort.start();
};

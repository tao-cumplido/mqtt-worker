import { ErrorMessage, Message, MqttWorkerMessageEvent, PingMessage } from '@types';

export interface WorkerPort extends MessagePort {
    postMessage(message: Message | PingMessage | ErrorMessage): void;
    addEventListener(
        type: 'message',
        listener: (event: MqttWorkerMessageEvent) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: 'message',
        listener: (event: MqttWorkerMessageEvent) => void,
        options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void;
}

export interface StatusPort extends WorkerPort {
    whenDisconnected: Promise<void>;
}

export function monitorPort(port: WorkerPort, interval = 5000, responseTime = 5000): StatusPort {
    let connected = true;

    const whenDisconnected = new Promise<void>((resolve) => {
        let disconnect: any;

        const sendRequest = () => {
            setTimeout(() => {
                disconnect = setTimeout(() => {
                    port.close();
                    resolve();
                }, responseTime);

                port.postMessage({
                    type: 'ping',
                });
            }, interval);
        };

        port.addEventListener('message', ({ data }) => {
            if (data.type !== 'ping') return;
            if (connected) {
                clearTimeout(disconnect);
                sendRequest();
            }
        });

        sendRequest();
    });

    return new Proxy(port as StatusPort, {
        get: (target: any, property) => {
            if (property === 'whenDisconnected') {
                return whenDisconnected;
            }

            const value = target[property];

            if (typeof value === 'function') {
                if (property === 'close') {
                    connected = false;
                }

                return value.bind(target);
            }

            return value;
        },
    });
}

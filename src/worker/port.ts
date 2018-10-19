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

export function monitorPort(port: WorkerPort, interval = 5000, responseTime = 1000): StatusPort {
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign(port, {
        whenDisconnected: new Promise<void>((resolve) => {
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
                clearTimeout(disconnect);
                sendRequest();
            });

            sendRequest();
        }),
    });
}

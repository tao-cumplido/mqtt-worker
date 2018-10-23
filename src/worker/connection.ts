import { IClientPublishOptions, IClientSubscribeOptions, MqttClient } from 'mqtt';

import { MqttConnectionError, MqttPayloadMessage, MqttStateMessage } from '@types';
import { StatusPort } from './port';

interface MqttConnectionPort extends StatusPort {
    postMessage(message: MqttStateMessage | MqttPayloadMessage): void;
}

export class Connection {
    listeners = new Set<MqttConnectionPort>();
    subscriptions = new Map<RegExp, Set<MqttConnectionPort>>();
    retainCache = new Map<string, MqttPayloadMessage>();

    state?: MqttStateMessage;

    constructor(private client: MqttClient) {
        this.initClient();
    }

    register(port: MqttConnectionPort) {
        this.listeners.add(port);

        if (this.state) {
            port.postMessage(this.state);
        }

        port.whenDisconnected.then(() => this.listeners.delete(port));
    }

    subscribe(topic: string, filter: RegExp, port: MqttConnectionPort, options?: IClientSubscribeOptions) {
        const ports = this.subscriptions.get(filter) || new Set();

        if (ports.size) {
            this.retainCache.forEach((message, retainTopic) => {
                if (filter.test(retainTopic)) {
                    port.postMessage(message);
                }
            });
        } else {
            this.client.subscribe(topic, options!);
        }

        ports.add(port);
        port.whenDisconnected.then(() => this.unsubscribe(topic, filter, port));

        this.subscriptions.set(filter, ports);
    }

    unsubscribe(topic: string, filter: RegExp, port: MqttConnectionPort) {
        const ports = this.subscriptions.get(filter);

        if (!ports) return;

        ports.delete(port);

        if (!ports.size) {
            this.client.unsubscribe(topic);
            this.subscriptions.delete(filter);
        }
    }

    publish(topic: string, payload: string | Uint8Array, options?: IClientPublishOptions) {
        this.client.publish(topic, payload as any, options!);
    }

    close(port: MqttConnectionPort): boolean {
        port.close();
        this.listeners.delete(port);
        return !this.listeners.size;
    }

    private initClient() {
        this.client.on('connect', () => {
            const message = (this.state = { type: 'mqtt-connect' });
            this.listeners.forEach((port) => {
                port.postMessage(message);
            });
        });

        this.client.on('close', () => {
            const message = (this.state = { type: 'mqtt-close' });
            this.listeners.forEach((port) => {
                port.postMessage(message);
            });
        });

        this.client.on('offline', () => {
            const message = (this.state = { type: 'mqtt-offline' });
            this.listeners.forEach((port) => {
                port.postMessage(message);
            });
        });

        this.client.on('error', (e) => {
            const error: MqttConnectionError = {
                name: 'MqttConnectionError',
                message: e.message,
                stack: e.stack,
            };

            const message = (this.state = {
                type: 'error',
                error,
            });

            this.listeners.forEach((port) => {
                port.postMessage(message);
            });
        });

        this.client.on('message', (topic, payload, packet) => {
            const message: MqttPayloadMessage = {
                type: 'mqtt-payload',
                topic,
                payload,
            };

            if ('retain' in packet && packet.retain) {
                this.retainCache.set(topic, message);
            }

            this.subscriptions.forEach((ports, filter) => {
                if (filter.test(topic)) {
                    ports.forEach((port) => {
                        port.postMessage(message);
                    });
                }
            });
        });
    }
}

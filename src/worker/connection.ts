import {
    IClientPublishOptions,
    IClientSubscribeOptions,
    MqttClient,
} from 'mqtt';

import {
    MqttConnectionError,
    MqttPayloadMessage,
    MqttStateMessage,
} from '@types';
import { StatusPort } from './port';

interface MqttStatePort extends StatusPort {
    postMessage(message: MqttStateMessage): void;
}

interface MqttPayloadPort extends StatusPort {
    postMessage(message: MqttPayloadMessage): void;
}

export class Connection {
    listeners = new Set<MqttStatePort>();
    subscriptions = new Map<RegExp, Set<MqttPayloadPort>>();

    state?: MqttStateMessage;

    constructor(private client: MqttClient) {
        this.initClient();
    }

    register(port: MqttStatePort) {
        this.listeners.add(port);

        if (this.state) {
            port.postMessage(this.state);
        }

        port.whenDisconnected.then(() => this.listeners.delete(port));
    }

    subscribe(
        topic: string,
        filter: RegExp,
        port: MqttPayloadPort,
        options?: IClientSubscribeOptions
    ) {
        const ports = this.subscriptions.get(filter) || new Set();

        if (!ports.size) {
            this.client.subscribe(topic, options!);
        }

        ports.add(port);
        port.whenDisconnected.then(() => ports.delete(port));

        this.subscriptions.set(filter, ports);
    }

    unsubscribe(topic: string, filter: RegExp, port: MqttPayloadPort) {
        const ports = this.subscriptions.get(filter);

        if (!ports) return;

        ports.delete(port);

        if (!ports.size) {
            this.client.unsubscribe(topic);
            this.subscriptions.delete(filter);
        }
    }

    publish(
        topic: string,
        payload: string | Uint8Array,
        options?: IClientPublishOptions
    ) {
        this.client.publish(topic, payload as any, options!);
    }

    close(port: MqttStatePort): boolean {
        this.listeners.delete(port);
        port.close();

        if (this.listeners.size) return false;

        this.subscriptions.forEach((ports) => {
            ports.forEach((subscriptionPort) => {
                subscriptionPort.close();
            });
        });

        return true;
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

        this.client.on('message', (topic, payload) => {
            const message: MqttPayloadMessage = {
                type: 'mqtt-payload',
                topic,
                payload,
            };

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

import { connect as mqttConnect } from 'web-mqtt';

import {
    CloseRequestMessage,
    ConnectRequestMessage,
    InvalidTopicError,
    NoSuchConnectionError,
    NoSuchSubscriptionError,
    PublishRequestMessage,
    SubscribeRequestMessage,
    UnsubscribeRequestMessage,
} from '@types';
import { Connection } from './connection';
import { StatusPort } from './port';
import { validateSubscriptionTopic } from './topic';

export class MqttWorker {
    connections = new Map<string, Connection>();

    filterCache: Partial<Record<string, RegExp>> = {};

    connect(port: StatusPort, { name, url, options }: ConnectRequestMessage) {
        const connection =
            this.connections.get(name) ||
            new Connection(mqttConnect(url, options));
        connection.register(port);
        this.connections.set(name, connection);
    }

    subscribe(
        port: StatusPort,
        { connection: name, topic, options }: SubscribeRequestMessage
    ) {
        this.ensureConnection(port, name, (connection) => {
            const filter =
                this.filterCache[topic] || validateSubscriptionTopic(topic);

            if (!filter) {
                const error: InvalidTopicError = {
                    name: 'InvalidTopicError',
                    message: `Invalid subscription topic '${topic}'`,
                };

                port.postMessage({
                    type: 'error',
                    error,
                });

                return;
            }

            this.filterCache[topic] = filter;
            connection.subscribe(topic, filter, port, options);
        });
    }

    unsubscribe(
        port: StatusPort,
        { connection: name, topic }: UnsubscribeRequestMessage
    ) {
        this.ensureConnection(port, name, (connection) => {
            const filter = this.filterCache[topic];

            if (!filter) {
                const error: NoSuchSubscriptionError = {
                    name: 'NoSuchSubscriptionError',
                    message: `Topic '${topic}' hasn't been subscribed yet.`,
                };

                port.postMessage({
                    type: 'error',
                    error,
                });

                return;
            }

            connection.unsubscribe(topic, filter, port);
        });
    }

    publish(
        port: StatusPort,
        { connection: name, topic, payload, options }: PublishRequestMessage
    ) {
        this.ensureConnection(port, name, (connection) => {
            connection.publish(topic, payload, options);
        });
    }

    close(port: StatusPort, { connection: name }: CloseRequestMessage) {
        this.ensureConnection(port, name, (connection) => {
            if (connection.close(port)) {
                this.connections.delete(name);
            }
        });
    }

    private ensureConnection(
        port: StatusPort,
        name: string,
        callback: (connection: Connection) => void
    ) {
        const connection = this.connections.get(name);

        if (connection) {
            return callback(connection);
        }

        const error: NoSuchConnectionError = {
            name: 'NoSuchConnectionError',
            message: `Connection '${name}' doesn't exist.`,
        };

        port.postMessage({
            type: 'error',
            error,
        });
    }
}

import { IClientOptions, IClientPublishOptions, IClientSubscribeOptions } from 'mqtt';

import { RequestError } from './error';

export interface Message {
    type: string;
}

export interface ErrorMessage extends Message {
    type: 'error';
    error: RequestError;
}

export interface PingMessage extends Message {
    type: 'ping';
}

export interface ConnectRequestMessage extends Message {
    type: 'connect';
    name: string;
    url: string;
    options?: IClientOptions;
}

interface ConnectionRequest {
    connection: string;
}

interface TopicRequest extends ConnectionRequest {
    topic: string;
}

export interface SubscribeRequestMessage extends Message, TopicRequest {
    type: 'subscribe';
    options?: IClientSubscribeOptions;
}

export interface UnsubscribeRequestMessage extends Message, TopicRequest {
    type: 'unsubscribe';
}

export interface PublishRequestMessage extends Message, TopicRequest {
    type: 'publish';
    payload: string | Uint8Array;
    options?: IClientPublishOptions;
}

export interface CloseRequestMessage extends Message, ConnectionRequest {
    type: 'close';
}

export interface MqttConnectMessage extends Message {
    type: 'mqtt-connect';
}

export interface MqttCloseMessage extends Message {
    type: 'mqtt-close';
}

export interface MqttOfflineMessage extends Message {
    type: 'mqtt-offline';
}

export interface MqttPayloadMessage extends Message {
    type: 'mqtt-payload';
    topic: string;
    payload: Uint8Array;
}

export type MqttStateMessage = ErrorMessage | MqttConnectMessage | MqttCloseMessage | MqttOfflineMessage;

export interface RequestError {
    message: string;
    name?: string;
    stack?: string;
}

export interface NoSuchConnectionError extends RequestError {
    name: 'NoSuchConnectionError';
}

export interface InvalidTopicError extends RequestError {
    name: 'InvalidTopicError';
}

export interface NoSuchSubscriptionError extends RequestError {
    name: 'NoSuchSubscriptionError';
}

export interface MqttConnectionError extends RequestError {
    name: 'MqttConnectionError';
}

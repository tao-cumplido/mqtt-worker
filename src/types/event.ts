import { ErrorMessage, Message, PingMessage } from './message';

export interface MqttWorkerMessageEvent extends MessageEvent {
    data: Message | PingMessage | ErrorMessage;
}

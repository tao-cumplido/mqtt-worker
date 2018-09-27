import { Connection } from './connection';

// tslint:disable:no-console

export function log(name: string, connection: Connection) {
    let state!: [string, string];

    if (!connection.state) {
        state = ['unknown', 'background: rgb(108, 117, 125); color: white;'];
    } else {
        switch (connection.state.type) {
            case 'mqtt-connect':
                state = [
                    'connected',
                    'background: rgb(40, 167, 69); color: white;',
                ];
                break;
            case 'mqtt-close':
                state = [
                    'closed',
                    'background: rgb(23, 162, 184); color: white;',
                ];
                break;
            case 'mqtt-offline':
                state = [
                    'offline',
                    'background: rgb(255, 193, 7); color: rgb(52, 58, 64);',
                ];
                break;
            case 'error':
                state = [
                    `error: ${connection.state.error.name}`,
                    'background: rgb(220, 53, 69); color: white;',
                ];
                break;
        }
    }

    console.log(
        `Connection: %c${name}%c | %c ${state[0]} %c | listeners: ${
            connection.listeners.size
        }`,
        'font-weight: bolder;',
        '',
        state[1],
        ''
    );
}

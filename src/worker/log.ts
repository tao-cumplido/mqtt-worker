import { Connection } from './connection';

interface Subscription {
    topic: string;
    listeners: number;
}

function filterToTopic(filter: RegExp): string {
    return filter.source
        .slice(1, -1)
        .replace('.*', '#')
        .replace('[^/]*', '+')
        .replace(/\\(\/|\[|\\|\^|\$|\.|\||\?|\*|\(|\))/g, (c) => c.slice(1));
}

function getState(connection: Connection): [string, string] {
    if (!connection.state) {
        return ['unknown', 'background: rgb(108, 117, 125); color: white;'];
    }

    switch (connection.state.type) {
        case 'mqtt-connect':
            return ['connected', 'background: rgb(40, 167, 69); color: white;'];
        case 'mqtt-close':
            return ['closed', 'background: rgb(23, 162, 184); color: white;'];
        case 'mqtt-offline':
            return [
                'offline',
                'background: rgb(255, 193, 7); color: rgb(52, 58, 64);',
            ];
        case 'error':
            return [
                `error: ${connection.state.error.name}`,
                'background: rgb(220, 53, 69); color: white;',
            ];
    }
}

function getHeader(name: string, connection: Connection): string[] {
    const state = getState(connection);

    return [
        `Connection: %c${name}%c | %c ${state[0]} %c | listeners: ${
            connection.listeners.size
        }`,
        'font-weight: bolder;',
        '',
        state[1],
        '',
    ];
}

function getSubscriptions(connection: Connection): Subscription[] {
    return [...connection.subscriptions].map(([filter, ports]) => {
        return {
            topic: filterToTopic(filter),
            listeners: ports.size,
        };
    });
}

// tslint:disable:no-console

export function log(connections: Map<string, Connection>) {
    let cache: Array<[string[], Subscription[]]> = [];

    setInterval(() => {
        const next = [...connections].map(([name, connection]) => {
            return [
                getHeader(name, connection),
                getSubscriptions(connection),
            ] as typeof cache[0];
        });

        if (JSON.stringify(next) !== JSON.stringify(cache)) {
            console.clear();
            next.forEach(([header, subscriptions]) => {
                console.log(...header);
                console.table(subscriptions);
            });

            cache = next;
        }
    }, 500);
}

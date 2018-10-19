import ava, { TestInterface } from 'ava';
import { fake, stub, SinonStub } from 'sinon';

import * as mqtt from 'mqtt';
import * as connection from '../../src/worker/connection';

import { MqttWorker } from '../../src/worker/mqtt-worker';

const test = ava as TestInterface<{
    Connection: SinonStub;
    mqttConnect: SinonStub;
}>;

test.before((t) => {
    t.context.mqttConnect = stub(mqtt, 'connect');
});

test.beforeEach((t) => {
    t.context.Connection = stub(connection, 'Connection');
});

test.afterEach((t) => {
    t.context.Connection.restore();
});

test.after((t) => {
    t.context.mqttConnect.restore();
});

test.serial('first connect', (t) => {
    const fakeConnection = {
        register: fake(),
    };

    t.context.Connection.returns(fakeConnection);

    const worker = new MqttWorker();

    worker.connect(
        {} as any,
        {
            type: 'connect',
            name: 'foo',
            url: '',
        }
    );

    t.deepEqual<any>(worker.connections, new Map([['foo', fakeConnection]]));
});

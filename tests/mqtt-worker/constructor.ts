import ava, { TestInterface } from 'ava';
import { stub, SinonStub } from 'sinon';

import * as log from '../../src/worker/log';

import { MqttWorker } from '../../src/worker/mqtt-worker';

const test = ava as TestInterface<{
    log: SinonStub;
}>;

test.beforeEach((t) => {
    t.context.log = stub(log, 'log');
});

test.afterEach((t) => {
    t.context.log.restore();
});

test.serial('log in development only', (t) => {
    process.env.NODE_ENV = 'development';
    // tslint:disable-next-line:no-unused-expression
    new MqttWorker();
    t.is(t.context.log.callCount, 1);
});

test.serial('no logging in production mode', (t) => {
    process.env.NODE_ENV = 'production';
    // tslint:disable-next-line:no-unused-expression
    new MqttWorker();
    t.is(t.context.log.callCount, 0);
});

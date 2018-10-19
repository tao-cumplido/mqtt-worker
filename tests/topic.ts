import test, { Macro } from 'ava';

import { validateSubscriptionTopic } from '../src/worker/topic';

const invalid: Macro = (t, topic) => {
    t.falsy(validateSubscriptionTopic(topic));
};

const valid: Macro = (t, topic) => {
    t.truthy(validateSubscriptionTopic(topic));
};

invalid.title = valid.title = (_, topic) => `topic: '${topic}'`;

test(invalid, '');
test(invalid, '##');
test(invalid, '++');
test(invalid, '#/');
test(invalid, '#/#');
test(invalid, 'a/#/b');
test(invalid, 'a/++');
test(invalid, 'a/++/b');
test(invalid, 'a+');
test(invalid, 'a/b+/c');

test(valid, ' ');
test(valid, '/');
test(valid, '//');
test(valid, '#');
test(valid, '+');
test(valid, '/#');
test(valid, 'a');
test(valid, 'a/');
test(valid, '/a');
test(valid, '+/');
test(valid, '/+');
test(valid, '+/+');
test(valid, 'a/b');
test(valid, 'a/+/b');
test(valid, 'a/#');
test(valid, 'Are topics like these discouraged? (stupid question)');

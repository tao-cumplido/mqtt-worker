export function validateSubscriptionTopic(topic: string): RegExp | undefined {
    const validator = /^(#|([^+#/]*|\+)(\/([^+#/]*|\+))*(\/+|\/#)?)$/;

    if (!topic || !validator.test(topic)) return;

    const filter = topic
        .replace(/\[|\\|\^|\$|\.|\||\?|\*|\(|\)/g, (c) => `\\${c}`)
        .replace('+', '[^/]*')
        .replace('#', '.*');

    return new RegExp(`^${filter}$`);
}

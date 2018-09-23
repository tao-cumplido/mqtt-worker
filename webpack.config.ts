import { pathExists, readJson, writeFile } from 'fs-extra';
import * as path from 'path';

import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import fetch from 'node-fetch';
import { Configuration } from 'webpack';

async function createConfig(): Promise<Configuration> {
    const cwd = process.cwd();
    const webMqttPath = path.join(cwd, 'web-mqtt', 'index.js');

    if (!(await pathExists(webMqttPath))) {
        const {
            devDependencies: { mqtt },
        } = await readJson(path.join(cwd, 'package.json'));
        const js = await fetch(`https://unpkg.com/mqtt@${mqtt}/dist/mqtt.js`);
        await writeFile(webMqttPath, await js.text());
    }

    return {
        mode: 'production',
        target: 'webworker',
        entry: './src/main.ts',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'awesome-typescript-loader',
                    exclude: [/node_modules/],
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.ts'],
            plugins: [new TsConfigPathsPlugin()],
        },
        output: {
            filename: 'mqtt-worker.js',
            path: path.join(cwd, 'dist'),
        },
    };
}

export default createConfig();

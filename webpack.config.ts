import { pathExists, readJson, writeFile } from 'fs-extra';
import * as path from 'path';

import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import fetch from 'node-fetch';
import { Configuration } from 'webpack';
import * as merge from 'webpack-merge';

async function createConfig(): Promise<[Configuration, Configuration]> {
    const cwd = process.cwd();
    const webMqttPath = path.join(cwd, 'web-mqtt', 'index.js');

    if (!(await pathExists(webMqttPath))) {
        const {
            devDependencies: { mqtt },
        } = await readJson(path.join(cwd, 'package.json'));
        const js = await fetch(`https://unpkg.com/mqtt@${mqtt}/dist/mqtt.js`);
        await writeFile(webMqttPath, await js.text());
    }

    const base: Configuration = {
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
            path: path.join(cwd, 'dist'),
        },
    };

    return [
        merge(base, {
            mode: 'development',
            devtool: 'source-map',
            output: {
                filename: 'mqtt-worker.js',
            },
        }),
        merge(base, {
            mode: 'production',
            output: {
                filename: 'mqtt-worker.min.js',
            },
        }),
    ];
}

export default createConfig();

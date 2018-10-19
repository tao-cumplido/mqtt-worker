import * as path from 'path';

import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import { Configuration } from 'webpack';
import * as merge from 'webpack-merge';

async function createConfig(): Promise<[Configuration, Configuration]> {
    const base: Configuration = {
        target: 'webworker',
        entry: './src/main.ts',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: [/node_modules/],
                    loader: 'awesome-typescript-loader',
                    query: {
                        configFileName: './tsconfig.lib.json',
                    },
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.ts'],
            plugins: [new TsConfigPathsPlugin()],
        },
        output: {
            path: path.join(process.cwd(), 'dist'),
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

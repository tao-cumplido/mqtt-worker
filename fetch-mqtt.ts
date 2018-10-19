import { pathExists, readJson, writeFile, writeJson } from 'fs-extra';
import * as path from 'path';

import fetch from 'node-fetch';

async function fetchMqtt() {
    const {
        devDependencies: { mqtt: version },
    } = await readJson(path.join(process.cwd(), 'package.json'));
    const dir = path.join(process.cwd(), 'mqtt');
    const packagePath = path.join(dir, 'package.json');
    const indexPath = path.join(dir, 'index.js');

    if (await pathExists(packagePath)) {
        const json = await readJson(packagePath);
        if (json.version === version && (await pathExists(indexPath))) {
            return;
        }
    }

    const index = await fetch(`https://unpkg.com/mqtt@${version}/dist/mqtt.js`);
    await writeFile(indexPath, await index.text());
    await writeJson(packagePath, {
        name: 'mqtt',
        version,
        main: 'index.js',
        typings: 'index.d.ts',
    });
}

fetchMqtt();

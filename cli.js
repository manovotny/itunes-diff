const os = require('os');

const fse = require('fs-extra');
const itunes = require('itunes-data');
const moment = require('moment');
const pathExists = require('path-exists');

const parser = itunes.parser();
const stream = fse.createReadStream(`${os.homedir()}/Music/iTunes/iTunes Library.xml`);

const current = [];

parser.on('track', (track) => {
    if (track.hasOwnProperty('Bit Rate')) {
        current.push(`${track['Artist']} - ${track['Name']} // ${track['Album']}`);
    }
});

stream.on('close', () => {
    const cachePath = `${os.homedir()}/.itunes/cache.txt`;

    if (pathExists.sync(cachePath)) {
        const cache = fse.readFileSync(cachePath, {encoding: 'utf8'}).split('\n');
        const removed = cache.filter((x) => current.indexOf(x) < 0);

        if (removed.length) {
            fse.writeFileSync(`${os.homedir()}/.itunes/removed-${moment().format('YYYY-MM-DD@hh.mm.ssa')}.txt`, removed.join('\n'));
        }
    }

    fse.writeFileSync(cachePath, current.join('\n'));
});

stream.pipe(parser);

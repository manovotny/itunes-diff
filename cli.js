const os = require('os');

const fse = require('fs-extra');
const itunes = require('itunes-data');
const moment = require('moment');
const pathExists = require('path-exists');

const parser = itunes.parser();
const stream = fse.createReadStream(`${os.homedir()}/Music/iTunes/iTunes Library.xml`);

const music = [];

parser.on('track', (track) => {
    if (track.hasOwnProperty('Bit Rate')) {
        music.push(`${track['Artist']} - ${track['Name']} // ${track['Album']}`);
    }
});

stream.on('close', () => {
    const cachePath = `${os.homedir()}/.itunes/cache.json`;

    if (!pathExists.sync(cachePath)) {
        fse.writeJSONSync(cachePath, {});
    }

    const defaults = {
        music: []
    };
    const cache = Object.assign(
        defaults,
        fse.readJSONSync(cachePath)
    );
    const removed = cache.music.filter((x) => music.indexOf(x) < 0).filter(String);

    if (removed.length) {
        fse.writeFileSync(`${os.homedir()}/.itunes/removed-${moment().format('YYYY-MM-DD@hh.mm.ssa')}.txt`, {
            music: removed
        });
    }

    fse.writeJSONSync(cachePath, Object.assign(
        defaults,
        {
            music
        }
    ));
});

stream.pipe(parser);

const os = require('os');

const fse = require('fs-extra');
const itunes = require('itunes-data');
const moment = require('moment');
const pathExists = require('path-exists');

const config = fse.readJsonSync(`${os.homedir()}/.itunes/config.json`);
const parser = itunes.parser();
const stream = fse.createReadStream(config.itunesLibraryXmlPath);

const current = [];

parser.on('track', (track) => {
    if (track.hasOwnProperty('Bit Rate')) {
        current.push(`${track['Artist']} - ${track['Name']} // ${track['Album']}`);
    }
});

stream.on('close', () => {
    const previousPath = `${os.homedir()}/.itunes/previous.txt`;

    if (pathExists.sync(previousPath)) {
        const previous = fse.readFileSync(previousPath, {encoding: 'utf8'}).split('\n');
        const removed = previous.filter((x) => current.indexOf(x) < 0);

        if (removed.length) {
            fse.writeFileSync(`${os.homedir()}/.itunes/removed-${moment().format('YYYY-MM-DD@hh.mm.ssa')}.txt`, removed.join('\n'));
        }
    }

    fse.writeFileSync(previousPath, current.join('\n'));
});

stream.pipe(parser);

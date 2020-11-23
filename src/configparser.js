const util = require('util');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const errors = require('./errors');
const interpolation = require('./interpolation');

/**
 * Regular Expression to match section headers.
 * @type {RegExp}
 * @private
 */
const SECTION = new RegExp(/\s*\[([^\]]+)]/);

/**
 * Regular expression to match key, value pairs.
 * @type {RegExp}
 * @private
 */
const KEY = new RegExp(/\s*(.*?)\s*[=:]\s*(.*)/);

/**
 * Regular expression to match comments. Either starting with a
 * semi-colon or a hash.
 * @type {RegExp}
 * @private
 */
const COMMENT = new RegExp(/^\s*[;#]/);

// RL1.6 Line Boundaries (for unicode)
// ... it shall recognize not only CRLF, LF, CR,
// but also NEL, PS and LS.
const LINE_BOUNDARY = new RegExp(/\r\n|[\n\r\u0085\u2028\u2029]/g);

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const statAsync = util.promisify(fs.stat);
const mkdirAsync = util.promisify(mkdirp);

/**
 * @constructor
 */
function ConfigParser() {
    this._sections = {};
}

/**
 * Returns an array of the sections.
 * @returns {Array}
 */
ConfigParser.prototype.sections = function() {
    return Object.keys(this._sections);
};

/**
 * Adds a section named section to the instance. If the section already
 * exists, a DuplicateSectionError is thrown.
 * @param {string} section - Section Name
 */
ConfigParser.prototype.addSection = function(section) {
    if(this._sections.hasOwnProperty(section)){
        throw new errors.DuplicateSectionError(section)
    }
    this._sections[section] = {};
};

/**
 * Indicates whether the section is present in the configuration
 * file.
 * @param {string} section - Section Name
 * @returns {boolean}
 */
ConfigParser.prototype.hasSection = function(section) {
    return this._sections.hasOwnProperty(section);
};

/**
 * Returns an array of all keys in the specified section.
 * @param {string} section - Section Name
 * @returns {Array}
 */
ConfigParser.prototype.keys = function(section) {
    try {
        return Object.keys(this._sections[section]);
    } catch(err){
        throw new errors.NoSectionError(section);
    }
};

/**
 * Indicates whether the specified key is in the section.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @returns {boolean}
 */
ConfigParser.prototype.hasKey = function (section, key) {
    return this._sections.hasOwnProperty(section) &&
        this._sections[section].hasOwnProperty(key);
};

/**
 * Reads a file and parses the configuration data.
 * @param {string|Buffer|int} file - Filename or File Descriptor
 */
ConfigParser.prototype.read = function(file) {
    const lines = fs.readFileSync(file)
        .toString('utf8')
        .split(LINE_BOUNDARY);
    parseLines.call(this, file, lines);
};

/**
 * Reads a file asynchronously and parses the configuration data.
 * @param {string|Buffer|int} file - Filename or File Descriptor
 */
ConfigParser.prototype.readAsync = async function(file) {
    const lines = (await readFileAsync(file))
        .toString('utf8')
        .split(LINE_BOUNDARY);
    parseLines.call(this, file, lines);
}

/**
 * Gets the value for the key in the named section.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @param {boolean} [raw=false] - Whether or not to replace placeholders
 * @returns {string|undefined}
 */
ConfigParser.prototype.get = function(section, key, raw) {
    if(this._sections.hasOwnProperty(section)){
        if(raw){
            return this._sections[section][key];
        } else {
            return interpolation.interpolate(this, section, key);
        }
    }
    return undefined;
};

/**
 * Coerces value to an integer of the specified radix.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @param {int} [radix=10] - An integer between 2 and 36 that represents the base of the string.
 * @returns {number|undefined|NaN}
 */
ConfigParser.prototype.getInt = function(section, key, radix) {
    if(this._sections.hasOwnProperty(section)){
        if(!radix) radix = 10;
        return parseInt(this._sections[section][key], radix);
    }
    return undefined;
};

/**
 * Coerces value to a float.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @returns {number|undefined|NaN}
 */
ConfigParser.prototype.getFloat = function(section, key) {
    if(this._sections.hasOwnProperty(section)){
        return parseFloat(this._sections[section][key]);
    }
    return undefined;
};

/**
 * Returns an object with every key, value pair for the named section.
 * @param {string} section - Section Name
 * @returns {Object}
 */
ConfigParser.prototype.items = function(section) {
    return this._sections[section];
};

/**
 * Sets the given key to the specified value.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @param {*} value - New Key Value
 */
ConfigParser.prototype.set = function(section, key, value) {
    if(this._sections.hasOwnProperty(section)){
        this._sections[section][key] = value;
    }
};

/**
 * Removes the property specified by key in the named section.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @returns {boolean}
 */
ConfigParser.prototype.removeKey = function(section, key) {
    // delete operator returns true if the property doesn't not exist
    if(this._sections.hasOwnProperty(section) &&
        this._sections[section].hasOwnProperty(key)){
        return delete this._sections[section][key];
    }
    return false;
};

/**
 * Removes the named section (and associated key, value pairs).
 * @param {string} section - Section Name
 * @returns {boolean}
 */
ConfigParser.prototype.removeSection = function(section) {
    if(this._sections.hasOwnProperty(section)){
        return delete this._sections[section];
    }
    return false;
};

/**
 * Writes the representation of the config file to the
 * specified file. Comments are not preserved.
 * @param {string|Buffer|int} file - Filename or File Descriptor
 * @param {bool} [createMissingDirs=false] - Whether to create the directories in the path if they don't exist
 */
ConfigParser.prototype.write = function(file, createMissingDirs = false) {
    if (createMissingDirs) {
        const dir = path.dirname(file);
        mkdirp.sync(dir);
    }

    fs.writeFileSync(file, getSectionsAsString.call(this));
};

/**
 * Writes the representation of the config file to the
 * specified file asynchronously. Comments are not preserved.
 * @param {string|Buffer|int} file - Filename or File Descriptor
 * @param {bool} [createMissingDirs=false] - Whether to create the directories in the path if they don't exist
 * @returns {Promise}
 */
ConfigParser.prototype.writeAsync = async function(file, createMissingDirs = false) {
    if (createMissingDirs) {
        const dir = path.dirname(file);
        await mkdirAsync(dir);
    }

    await writeFileAsync(file, getSectionsAsString.call(this));
}

function parseLines(file, lines) {
    let curSec = null;
    lines.forEach((line, lineNumber) => {
        if(!line || line.match(COMMENT)) return;
        let res = SECTION.exec(line);
        if(res){
            const header = res[1];
            curSec = {};
            this._sections[header] = curSec;
        } else if(!curSec) {
            throw new errors.MissingSectionHeaderError(file, lineNumber, line);
        } else {
            res = KEY.exec(line);
            if(res){
                const key = res[1];
                curSec[key] = res[2];
            } else {
                throw new errors.ParseError(file, lineNumber, line);
            }
        }
    });
}

function getSectionsAsString() {
    let out = '';
    let section;
    for(section in this._sections){
        if(!this._sections.hasOwnProperty(section)) continue;
        out += ('[' + section + ']\n');
        const keys = this._sections[section];
        let key;
        for(key in keys){
            if(!keys.hasOwnProperty(key)) continue;
            let value = keys[key];
            out += (key + '=' + value + '\n');
        }
        out += '\n';
    }
    return out;
}

module.exports = ConfigParser;

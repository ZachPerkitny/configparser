/**
 * Regular Expression to match placeholders.
 * @type {RegExp}
 * @private
 */
const PLACEHOLDER = new RegExp(/%\(([\w-]+)\)s/g);

/**
 * Recursively parses a string and replaces the placeholder ( %(key)s )
 * with the value the key points to.
 * @param {ParserConfig} parser - Parser Config Object
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 */
function parse(parser, section, key){
    var value = parser.get(section, key, true);
    var res = PLACEHOLDER.exec(value);
    while(res !== null){
        const placeholder = res[1];
        const rep = this.parse(parser, section, placeholder);
        // replace %(key)s with the returned value next
        value = value.substr(0, res.index) + rep +
            value.substr(res.index + res[0].length);
        // get next placeholder
        res = PLACEHOLDER.exec(value);
    }
    return value;
}

module.exports = {
    parse: parse
};
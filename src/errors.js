/**
 * Error thrown when addSection is called with a section
 * that already exists.
 * @param {string} section - Section Name
 * @constructor
 */
function DuplicateSectionError(section) {
    this.name = 'DuplicateSectionError';
    this.message = section + ' already exists';
    Error.captureStackTrace(this, this.constructor);
}

/**
 * Error thrown when the section being accessed, does
 * not exist.
 * @param {string} section - Section Name
 * @constructor
 */
function NoSectionError(section) {
    this.name = this.constructor.name;
    this.message =  'Section ' + section + ' does not exist.';
    Error.captureStackTrace(this, this.constructor);
}

/**
 * Error thrown when a file is being parsed.
 * @param {string} filename - File name
 * @param {int} lineNumber - Line Number
 * @param {string} line - Contents of the line
 * @constructor
 */
function ParseError(filename, lineNumber, line) {
    this.name = this.constructor.name;
    this.message = 'Source contains parsing errors.\nfile: ' + filename +
        ' line: ' + lineNumber + '\n' + line;
    Error.captureStackTrace(this, this.constructor);
}

/**
 * Error thrown when there are no section headers present
 * in a file.
 * @param {string} filename - File name
 * @param {int} lineNumber - Line Number
 * @param {string} line - Contents of the line
 * @constructor
 */
function MissingSectionHeaderError(filename, lineNumber, line) {
    this.name = this.constructor.name;
    this.message = 'File contains no section headers.\nfile: ' + filename +
        ' line: ' + lineNumber + '\n' + line;
    Error.captureStackTrace(this, this.constructor);
}

/**
 * Error thrown when the interpolate function exceeds the maximum recursion
 * depth.
 * @param {string} section - Section Name
 * @param {string} key - Key Name
 * @param {string} value - Key Value
 * @param {int} maxDepth - Maximum recursion depth
 * @constructor
 */
function MaximumInterpolationDepthError(section, key, value, maxDepth) {
    this.name = this.constructor.name;
    this.message = 'Exceeded Maximum Recursion Depth (' + maxDepth +
        ') for key ' + key + ' in section ' + section + '\nvalue: ' + value;
    Error.captureStackTrace(this, this.constructor);
}

module.exports = {
    DuplicateSectionError,
    NoSectionError,
    ParseError,
    MissingSectionHeaderError,
    MaximumInterpolationDepthError
};
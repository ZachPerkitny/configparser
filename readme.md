### Config Parser [![CircleCI](https://circleci.com/gh/ZachPerkitny/configparser.svg?style=svg)](https://circleci.com/gh/ZachPerkitny/configparser)
A NodeJS module based off of Python's ConfigParser. It implements a basic configuration file
parser. The structure is very similar to the Windows INI file.

#### Installation
`npm install configparser`

### Documentation
See Full Documentation [Here](https://zachperkitny.github.io/configparser/)

#### Example
##### Writing

There are two methods available for writing the contents
of the config file to disk: [write](https://zachperkitny.github.io/configparser/ConfigParser.html#write) and [writeAsync](https://zachperkitny.github.io/configparser/ConfigParser.html#writeAsync).

```js
const ConfigParser = require('configparser');

const config = new ConfigParser();

// Adding sections and adding keys
config.addSection('User');
config.set('User', 'token', 'some value');
config.set('User', 'exp', 'some value');

// With String Interpolation, %(key_name)s
config.addSection('MetaData');
config.set('MetaData', 'path', '/home/%(dir_name)s/');
config.set('MetaData', 'dir_name', 'me');

config.write('my-cfg-file.cfg');
```

##### File
```ini
[User]
token=some value
exp=some value

[MetaData]
path=/home/%(dir_name)s/
dir_name=me
```

##### Reading

There are two methods available for reading the contents
of the config file from disk: [read](https://zachperkitny.github.io/configparser/ConfigParser.html#read) and [readAsync](https://zachperkitny.github.io/configparser/ConfigParser.html#readAsync).

```js
config.read('my-cfg-file.cfg');
config.sections(); // ['User', 'MetaData']
config.get('User', 'token'); // 'some value'
config.get('MetaData', 'path'); // '/home/me/'
```

### Questions and Issues
Use the [Github Issue Tracker](https://github.com/ZachPerkitny/configparser/issues) to report a bug, request a feature, or if you need any help.

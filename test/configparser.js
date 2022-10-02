const expect = require('chai').expect;
const ConfigParser = require('../src/configparser');

describe('ConfigParser object', function(){
    const config = new ConfigParser();
    config.read('test/data/file.ini');

    it('should return all sections in the config file', function(){
        expect(config.sections()).to.deep.equal([
            'section1',
            'section2',
            'USER',
            'im running out of ideas',
            'interpolation',
            'permissive_section:headers%!?',
            'more_complex_interpolation',
            'sec'
        ]);
    });

    it('should indicate if a section is present in a config file', function(){
        expect(config.hasSection('section1')).to.equal(true);
        expect(config.hasSection('section4')).to.equal(false);
        expect(config.hasSection('sec')).to.equal(true);
    });

    it('should add a new section', function(){
        config.addSection('new-section');
        expect(config.hasSection('new-section')).to.equal(true);
    });

    it('should return every key in a section', function(){
        expect(config.keys('section1')).to.deep.equal(['key', 'other', 'idontknow']);
        expect(config.keys('section2')).to.deep.equal(['value', 'key', 'woah', 'this']);
        expect(config.keys('USER')).to.deep.equal(['username', 'password']);
        expect(config.keys('permissive_section:headers%!?')).to.deep.equal(['hello', 'goodbye']);
        expect(config.keys('im running out of ideas')).to.deep.equal(['anotherthing', 'otherthing']);
        expect(config.keys('sec')).to.deep.equal(['key', 'test', '[wow]']);
    });

    it('should indicate if a section has a key', function(){
         expect(config.hasKey('section1', 'idontknow')).to.equal(true);
         expect(config.hasKey('section1', 'fakekey')).to.equal(false);
         expect(config.hasKey('fake section', 'fakekey')).to.equal(false);
         expect(config.hasKey('permissive_section:headers%!?', 'hello')).to.equal(true);
         expect(config.hasKey('sec', 'key')).to.equal(true);
    });

    it('should get the value for a key in the named section', function(){
        expect(config.get('section1', 'key')).to.equal('value');
        expect(config.get('USER', 'username')).to.equal('user');
        expect(config.get('sec', 'key')).to.equal('[value]');
    });

    it('should recursively replace placehoders', function(){
        expect(config.get('interpolation', 'greeting')).to.equal('hello zach, how are you?');
        expect(config.get('more_complex_interpolation', 'path')).to.equal('/home/nested/zach/documents/mytextfile.txt');
    });

    it('should add or modify a key in the named section', function(){
        config.set('section1', 'key', 55);
        config.set('section1', 'NewKey', 'hello');
        expect(config.get('section1', 'key')).to.equal(55);
        expect(config.get('section1', 'NewKey')).to.equal('hello');
    });

    it('should return the correct key, value pairs for each section', function(){
        expect(config.items('section1')).to.deep.equal({
            key: 55,
            other: 'something else',
            idontknow: 'more values!',
            NewKey: 'hello'
        });
        expect(config.items('sec')).to.deep.equal({
            key: '[value]',
            test: '[something 1234 hello]',
            '[wow]': '[45]'
        });
    });

    it('should remove a key from the named section', function(){
        expect(config.removeKey('fakesection', 'NewKey')).to.equal(false);
        expect(config.removeKey('section1', 'not a real key')).to.equal(false);
        expect(config.removeKey('section1', 'NewKey')).to.equal(true);
        expect(config.get('section1', 'NewKey')).to.equal(undefined);
    });

    it('should remove a section', function(){
        expect(config.removeSection('fake-section')).to.equal(false);
        expect(config.removeSection('new-section')).to.equal(true);
        expect(config.hasSection('new-section')).to.equal(false);
    });
});
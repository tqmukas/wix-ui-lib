module.exports = function(grunt) {
    var _ = grunt.util._;
    function execCommon(command, args, callback) {
        var jsonCallback = "";
        var child = require('child_process').spawn(command, args);
        child.stdout.on('data', function (data) {
            jsonCallback += data;
        }.bind(this));
        child.on('close', function (code) {
            console.log(jsonCallback);
            callback(JSON.parse(jsonCallback));
        }.bind(this));
        child.on('exit', this.async());
    }

    function upload(username, password, release, assetName){
        _.bind(execCommon, this, 'curl', ['-u', username + ':' + password,
            '-H', 'Accept: application/vnd.github.manifold-preview', '-H', 'Content-Type: application/zip',
            '--data-binary', '@archive.zip',
            'https://uploads.github.com/repos/wix/wix-ui-lib/releases/' + release +'/assets?name=' + assetName + '.zip'])();
    }

    grunt.registerTask('release-create-upload', 'create a new release on github.com', function() {
        var username = grunt.option('username');
        var password = grunt.option('password');
        var tag_name = grunt.option('tag');
        var name = grunt.option('name');
        var body = grunt.option('body');
        if(username && password && tag_name && name && body){
            _.bind(execCommon, this, 'curl', ['-u', username + ':' + password,
                '-d', '{"tag_name":"' + tag_name + '","target_commitish": "master","name": "' + name + '","body":"' + body + '","draft": false,"prerelease": false}',
                'https://api.github.com/repos/liors/TVPirate/releases'], function(data){
                _.bind(upload, this, username, password, data.id, data.name)();
            }.bind(this))();
        } else {
            grunt.warn('Missing require argument(s). Try something like: '+
                'grunt release --username=EMAIL --password=PASSWORD --tag=v1.0.0 --name=v1.0.0 --body=\'Description of the release\'')
        }
    });
};
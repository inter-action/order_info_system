
fs = require('fs')
path = require('path')

loadProjectMeta = ()->
    projectRoot = path.normalize(__dirname + '/../..')
    projectMeta = JSON.parse(fs.readFileSync(projectRoot + '/meta.json', 'utf8'))

    srcroot = "#{projectRoot}/#{projectMeta.path.src.js}"
    specroot = "#{projectRoot}/#{projectMeta.path.spec.js}"

    console.log('srcroot: %s, \n specroot: %s', srcroot, specroot)

    return {
        'src.js': srcroot,
        'spec.js': specroot
    }


module.exports = {
    loadProjectMeta: loadProjectMeta
}
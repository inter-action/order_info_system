testinit = require('./testinit')
meta = testinit.loadProjectMeta()
srcroot = meta['src.js']

calculator = require(srcroot + "/testdemo/calculator")

describe 'multiplication', ()->
    it 'should multiply 2 and 3', ()->
        product = calculator.multiply(2, 3)
        expect(product).toBe(6)

/**
 * Created by ChengZheLin on 2019/4/12.
 * Features: Jest config.
 */

'use strict'

module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json'
    }
  },
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
  },
  testMatch: [
    '**/test/**/*.test.(ts|js)'
  ],
  testEnvironment: 'node'
}

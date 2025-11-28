const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/*handler.spec.ts'],
  roots: ['<rootDir>/libs/domains'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@safliix-back/cqrs$': '<rootDir>/libs/shared/cqrs/src/index.ts',
    '^@safliix-back/database$': '<rootDir>/libs/shared/database/src/index.ts',
    '^@safliix-back/contents$': '<rootDir>/libs/domains/contents/src/index.ts',
    '^@safliix-back/movies$': '<rootDir>/libs/domains/movies/src/index.ts',
    '^@safliix-back/series$': '<rootDir>/libs/domains/series/src/index.ts',
    '^@safliix-back/access$': '<rootDir>/libs/domains/access/src/index.ts',
    '^@safliix-back/videoTracking$': '<rootDir>/libs/domains/videoTracking/src/index.ts',
    '^@safliix-back/users$': '<rootDir>/libs/domains/users/src/index.ts',
    '^@database/(.*)$': '<rootDir>/libs/shared/database/src/lib/generated/client/$1',
    '^@safliix-back/(.*)$': '<rootDir>/libs/$1/src/index.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          ...compilerOptions,
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
        },
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/libs/domains/common/'],
};

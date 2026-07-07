import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    // Map test directories to their required environment:
    //   unit tests  → jsdom  (DOM APIs available for React component tests)
    //   security    → node   (@firebase/rules-unit-testing runs in Node)
    //   integration → node   (Firestore Emulator SDK runs in Node)
    environmentMatchGlobs: [
      ['tests/unit/**', 'jsdom'],
      ['tests/security/**', 'node'],
      ['tests/integration/**', 'node'],
    ],
    // Point all tests to the local Firebase Emulator Suite (T006: ports per firebase.json)
    env: {
      FIRESTORE_EMULATOR_HOST: 'localhost:8080',
      FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
    },
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Coverage targets: domain rules + application use cases (Constitución VI)
      include: ['src/domain/**', 'src/application/**'],
      exclude: ['src/domain/errors/**'],
    },
  },
  resolve: {
    alias: {
      '@domain': resolve(__dirname, 'src/domain'),
      '@application': resolve(__dirname, 'src/application'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@presentation': resolve(__dirname, 'src/presentation'),
      '@ui': resolve(__dirname, 'src/ui'),
    },
  },
})

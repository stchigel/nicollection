/**
 * Global Vitest setup file — runs before each test suite.
 *
 * Environment routing (configured in vitest.config.ts):
 *   tests/unit/**        → jsdom   (React component tests)
 *   tests/security/**    → node    (@firebase/rules-unit-testing)
 *   tests/integration/** → node    (Firestore Emulator SDK)
 *
 * Extend here as needed per phase (e.g., import jest-dom matchers for unit tests).
 */

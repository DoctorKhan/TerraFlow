// Jest setup file
global.console = {
    ...console,
    // Suppress console.log during tests unless needed
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
};

// Mock Date.now for consistent testing
const mockDateNow = jest.fn(() => 1000000);
global.Date.now = mockDateNow;

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1000000);
});

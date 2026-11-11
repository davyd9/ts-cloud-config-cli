import { createValidateCommand } from './validate';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';
import { AppError } from '../errors/AppError';
import { Command } from 'commander';

// Mock dependencies
jest.mock('../services/config.service');
jest.mock('../utils/logger');

const mockedConfigService = ConfigService as jest.Mocked<typeof ConfigService>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('validate command', () => {
  let program: Command;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    const validateCommand = createValidateCommand();
    program.addCommand(validateCommand);
    // Prevent tests from exiting the process
    mockExit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as (code?: number) => never);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockExit.mockRestore();
  });

  it('should log success message when validation passes', async () => {
    const filePath = 'config.valid.yml';
    mockedConfigService.load.mockResolvedValue({ dev: {} }); // Mock a successful load

    await program.parseAsync(['node', 'test', 'validate', filePath]);

    expect(mockedConfigService.load).toHaveBeenCalledWith(filePath);
    expect(mockedLogger.success).toHaveBeenCalledWith(`Configuration file '${filePath}' is valid.`);
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should log an error and exit with code 1 when validation fails due to AppError', async () => {
    const filePath = 'config.invalid.yml';
    const errorMessage = 'File is not good';
    const appError = new AppError(errorMessage);
    mockedConfigService.load.mockRejectedValue(appError);

    await program.parseAsync(['node', 'test', 'validate', filePath]);

    expect(mockedConfigService.load).toHaveBeenCalledWith(filePath);
    expect(mockedLogger.error).toHaveBeenCalledWith(errorMessage);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should log a generic error and exit with code 1 for unexpected errors', async () => {
    const filePath = 'config.error.yml';
    const unexpectedError = new Error('Something went wrong');
    mockedConfigService.load.mockRejectedValue(unexpectedError);

    await program.parseAsync(['node', 'test', 'validate', filePath]);

    expect(mockedConfigService.load).toHaveBeenCalledWith(filePath);
    expect(mockedLogger.error).toHaveBeenCalledWith('An unexpected error occurred: Something went wrong');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should show help if no file path is provided', async () => {
    // Commander's .action() is not called if a required argument is missing.
    // Instead, it shows an error and help. We can test the error message.
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'test', 'validate']);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("error: missing required argument 'filePath'"));
    expect(mockExit).toHaveBeenCalledWith(1);
    consoleErrorSpy.mockRestore();
  });
});

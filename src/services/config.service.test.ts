import { ConfigService } from './config.service';
import { AppError } from '../errors/AppError';
import fs from 'fs';
import yaml from 'js-yaml';

// Mock the external dependencies
jest.mock('fs');
jest.mock('js-yaml');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedYaml = yaml as jest.Mocked<typeof yaml>;

describe('ConfigService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validYamlContent = `
dev:
  url: http://dev.example.com
  port: 8080
  credentials:
    user: dev_user
    pass: dev_pass
prod:
  url: http://prod.example.com
  port: 80
  credentials:
    user: prod_user
    pass: prod_pass
`;

  const validConfigObject = {
    dev: {
      url: 'http://dev.example.com',
      port: 8080,
      credentials: { user: 'dev_user', pass: 'dev_pass' },
    },
    prod: {
      url: 'http://prod.example.com',
      port: 80,
      credentials: { user: 'prod_user', pass: 'prod_pass' },
    },
  };

  it('should load and parse a valid YAML file successfully', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(validYamlContent);
    mockedYaml.load.mockReturnValue(validConfigObject);

    const config = await ConfigService.load('config.yaml');

    expect(config).toEqual(validConfigObject);
    expect(mockedFs.existsSync).toHaveBeenCalledWith('config.yaml');
    expect(mockedFs.readFileSync).toHaveBeenCalledWith('config.yaml', 'utf8');
    expect(mockedYaml.load).toHaveBeenCalledWith(validYamlContent);
  });

  it('should load and parse a valid JSON file successfully', async () => {
    const jsonContent = JSON.stringify(validConfigObject);
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(jsonContent);

    const config = await ConfigService.load('config.json');

    expect(config).toEqual(validConfigObject);
    expect(mockedYaml.load).not.toHaveBeenCalled(); // Ensure YAML parser is skipped
  });

  it('should throw AppError if the configuration file is not found', async () => {
    mockedFs.existsSync.mockReturnValue(false);

    await expect(ConfigService.load('nonexistent.yml')).rejects.toThrow(
      new AppError('Configuration file not found at path: nonexistent.yml')
    );
  });

  it('should throw AppError for invalid YAML syntax', async () => {
    const invalidYaml = 'dev: url: http://oops';
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(invalidYaml);
    const parseError = new Error('YAML parse error');
    mockedYaml.load.mockImplementation(() => {
      throw parseError;
    });

    await expect(ConfigService.load('invalid.yml')).rejects.toThrow(
      new AppError('Failed to parse configuration file: invalid.yml. Reason: YAML parse error')
    );
  });

  it('should throw AppError for invalid JSON syntax', async () => {
    const invalidJson = '{"dev": {';
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(invalidJson);

    await expect(ConfigService.load('invalid.json')).rejects.toThrow(
      new AppError('Failed to parse configuration file: invalid.json. Reason: Unexpected end of JSON input')
    );
  });

  it('should throw AppError if configuration data fails schema validation', async () => {
    const invalidData = {
      dev: { url: 'http://dev.example.com', port: '8080' }, // port is a string
    };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('...data...');
    mockedYaml.load.mockReturnValue(invalidData);

    await expect(ConfigService.load('invalid-data.yml')).rejects.toThrow(AppError);
    await expect(ConfigService.load('invalid-data.yml')).rejects.toThrow(
        /Configuration validation failed/ 
    );
  });

  it('should throw AppError with detailed Zod validation issues', async () => {
    const invalidData = {
      dev: { url: 123 }, // url is not a string
      prod: { port: 80 } // missing required fields
    };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('...data...');
    mockedYaml.load.mockReturnValue(invalidData);

    try {
      await ConfigService.load('zod-errors.yml');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.message).toContain('Configuration validation failed');
      expect(appError.message).toContain('dev.url: Expected string, received number');
      expect(appError.message).toContain('prod.url: Required');
      expect(appError.message).toContain('prod.credentials: Required');
    }
  });
});

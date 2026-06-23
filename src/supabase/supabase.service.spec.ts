import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

// Mock the entire @supabase/supabase-js module so no real HTTP client is created
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.Mock;

describe('SupabaseService', () => {
  const VALID_URL = 'https://test.supabase.co';
  const VALID_KEY = 'service-role-key-xxx';

  // Helper: builds the NestJS testing module with controlled env values.
  // Returns the compiled module (or rejects if construction throws).
  function buildModule(url: string | undefined, key: string | undefined) {
    return Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((envKey: string) => {
              if (envKey === 'SUPABASE_URL') return url;
              if (envKey === 'SUPABASE_SERVICE_ROLE_KEY') return key;
              return undefined;
            }),
          },
        },
      ],
    }).compile();
  }

  beforeEach(() => {
    // Reset call history between tests, but keep the mock implementation
    mockCreateClient.mockClear();
    mockCreateClient.mockReturnValue({ from: jest.fn() }); // default fake client
  });

  // --- Happy path ---

  it('should be defined when both env vars are present', async () => {
    const module = await buildModule(VALID_URL, VALID_KEY);
    const service = module.get<SupabaseService>(SupabaseService);
    expect(service).toBeDefined();
  });

  it('should call createClient() once with the URL and key from ConfigService', async () => {
    await buildModule(VALID_URL, VALID_KEY);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(VALID_URL, VALID_KEY);
  });

  it('getClient() should return the exact client instance created by createClient()', async () => {
    const fakeClient = { from: jest.fn() };
    mockCreateClient.mockReturnValueOnce(fakeClient);

    const module = await buildModule(VALID_URL, VALID_KEY);
    const service = module.get<SupabaseService>(SupabaseService);

    expect(service.getClient()).toBe(fakeClient);
  });

  it('getClient() should return the same instance on repeated calls (no re-creation)', async () => {
    const module = await buildModule(VALID_URL, VALID_KEY);
    const service = module.get<SupabaseService>(SupabaseService);

    const first = service.getClient();
    const second = service.getClient();

    expect(first).toBe(second);
    expect(mockCreateClient).toHaveBeenCalledTimes(1); // still only once
  });

  // --- Guard: missing env vars ---

  it('should throw during module init when SUPABASE_URL is missing', async () => {
    await expect(buildModule(undefined, VALID_KEY)).rejects.toThrow(
      'Supabase URL or Service Role Key is missing in .env',
    );
  });

  it('should throw during module init when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    await expect(buildModule(VALID_URL, undefined)).rejects.toThrow(
      'Supabase URL or Service Role Key is missing in .env',
    );
  });

  it('should throw during module init when both env vars are missing', async () => {
    await expect(buildModule(undefined, undefined)).rejects.toThrow(
      'Supabase URL or Service Role Key is missing in .env',
    );
  });

  it('should NOT call createClient() when env vars are missing', async () => {
    await buildModule(undefined, VALID_KEY).catch(() => {});
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});

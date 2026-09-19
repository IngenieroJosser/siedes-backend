import { PredictionService } from './prediction.service';

describe('PredictionService institutional AI contract', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.AI_SERVICE_URL = 'http://ai:8000';
    process.env.AI_API_KEY = 'test-secret';
    process.env.AI_TIMEOUT_MS = '1000';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('forwards X-API-Key to protected institutional endpoints', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify([{ codigo_dane_establecimiento: '270001' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new PredictionService();
    const result = await service.getInstitutions();

    expect(result).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('X-API-Key')).toBe('test-secret');
  });

  it('uses the institutional dashboard endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          anio: 2025,
          instituciones: 24,
          riesgo: { BAJO: 10, MEDIO: 8, ALTO: 6 },
          prob_alto_media: 0.2,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new PredictionService();
    const result = await service.getDashboardSummary();

    expect(result.instituciones).toBe(24);
    expect(fetchMock.mock.calls[0][0]).toBe('http://ai:8000/dashboard/summary');
  });
});

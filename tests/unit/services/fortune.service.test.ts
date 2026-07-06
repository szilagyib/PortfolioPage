import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { fetchFortune } from '@/services/fortune.service';

/* Fortune now flows through /api/fortune (a Pages Function proxy) instead
 * of api.adviceslip.com. Same wildcard pattern that other Pages-Function
 * tests use. */
const FORTUNE_URL = '*/api/fortune';

const server = setupServer(
  http.get(FORTUNE_URL, () =>
    HttpResponse.json({ text: 'Ship small. Ship often.', attribution: 'slip #042' })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchFortune', () => {
  it('returns { text, attribution } on a successful response', async () => {
    const f = await fetchFortune();
    expect(f.text).toBe('Ship small. Ship often.');
    expect(f.attribution).toBe('slip #042');
  });

  it('returns a fallback fortune on network error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.get(FORTUNE_URL, () => HttpResponse.error()));
    const f = await fetchFortune();
    expect(f.text.length).toBeGreaterThan(0);
    expect(f.attribution.length).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it('returns a fallback fortune on malformed response', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.get(FORTUNE_URL, () => HttpResponse.json({})));
    const f = await fetchFortune();
    expect(f.text.length).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it('returns a fallback fortune on non-200 status', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.get(FORTUNE_URL, () => new HttpResponse(null, { status: 503 })));
    const f = await fetchFortune();
    expect(f.text.length).toBeGreaterThan(0);
    spy.mockRestore();
  });
});

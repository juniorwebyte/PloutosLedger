// Serviço simples para detectar disponibilidade do backend e fornecer modo demo
class BackendService {
  private lastCheckTs = 0;
  private cachedOnline: boolean | null = null;
  private readonly ttlMs = 15_000; // 15s
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  async isOnline(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && this.cachedOnline !== null && now - this.lastCheckTs < this.ttlMs) {
      return this.cachedOnline;
    }
    try {
      const res = await fetch(`${this.baseUrl}/health`, { cache: 'no-store' });
      this.cachedOnline = res.ok;
    } catch {
      this.cachedOnline = false;
    }
    this.lastCheckTs = now;
    return this.cachedOnline;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

const backendService = new BackendService();
export default backendService;


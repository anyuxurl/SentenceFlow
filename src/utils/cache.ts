interface CacheItem {
  timestamp: number;
  data: any;
}

class SentenceCache {
  private static instance: SentenceCache;
  private cache: Map<string, CacheItem>;
  private readonly CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24小时过期
  private readonly MAX_CACHE_SIZE = 100; // 最大缓存条目数

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): SentenceCache {
    if (!SentenceCache.instance) {
      SentenceCache.instance = new SentenceCache();
    }
    return SentenceCache.instance;
  }

  public set(key: string, value: any): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      timestamp: Date.now(),
      data: value
    });
  }

  public get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.CACHE_EXPIRY_TIME) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  public clear(): void {
    this.cache.clear();
  }

  public getSize(): number {
    return this.cache.size;
  }
}

export default SentenceCache;

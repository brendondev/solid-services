import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('should execute function within tenant context', () => {
      const tenantId = 'tenant-123';
      const result = service.run({ tenantId }, () => {
        return service.getTenantId();
      });

      expect(result).toBe(tenantId);
    });

    it('should isolate contexts between different runs', () => {
      const tenant1 = 'tenant-1';
      const tenant2 = 'tenant-2';

      const result1 = service.run({ tenantId: tenant1 }, () => {
        return service.getTenantId();
      });

      const result2 = service.run({ tenantId: tenant2 }, () => {
        return service.getTenantId();
      });

      expect(result1).toBe(tenant1);
      expect(result2).toBe(tenant2);
      expect(result1).not.toBe(result2);
    });
  });

  describe('getTenantId', () => {
    it('should return tenant ID from context', () => {
      const tenantId = 'tenant-456';

      service.run({ tenantId }, () => {
        expect(service.getTenantId()).toBe(tenantId);
      });
    });

    it('should throw error when no context exists', () => {
      expect(() => service.getTenantId()).toThrow('Tenant context not found');
    });
  });

  describe('getTenantIdOrNull', () => {
    it('should return tenant ID when context exists', () => {
      const tenantId = 'tenant-789';

      service.run({ tenantId }, () => {
        expect(service.getTenantIdOrNull()).toBe(tenantId);
      });
    });

    it('should return null when no context exists', () => {
      expect(service.getTenantIdOrNull()).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return user ID from context', () => {
      const userId = 'user-123';

      service.run({ tenantId: 'tenant-1', userId }, () => {
        expect(service.getUserId()).toBe(userId);
      });
    });

    it('should return undefined when user ID not set', () => {
      service.run({ tenantId: 'tenant-1' }, () => {
        expect(service.getUserId()).toBeUndefined();
      });
    });
  });

  describe('hasContext', () => {
    it('should return true when context exists', () => {
      service.run({ tenantId: 'tenant-1' }, () => {
        expect(service.hasContext()).toBe(true);
      });
    });

    it('should return false when no context exists', () => {
      expect(service.hasContext()).toBe(false);
    });
  });

  describe('getContext', () => {
    it('should return full context', () => {
      const context = { tenantId: 'tenant-1', userId: 'user-1' };

      service.run(context, () => {
        expect(service.getContext()).toEqual(context);
      });
    });

    it('should return undefined when no context exists', () => {
      expect(service.getContext()).toBeUndefined();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { meta } from '../../_auth.signIn';

describe('meta function', () => {
  it('should return correct title "Sign In"', () => {
    const result = meta({} as any);
    
    expect(result).toEqual([{ title: 'Sign In' }]);
  });

  it('should return array with single object', () => {
    const result = meta({} as any);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('should have title property with string value', () => {
    const result = meta({} as any);
    
    expect(result[0]).toHaveProperty('title');
    expect(typeof result[0].title).toBe('string');
  });
});
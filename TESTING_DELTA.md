# TESTING DELTA

## Current Strategy
- **Status:** Non-existent. No tests found in `src/` or root.

## Coverage Gaps
- **P0:** Semantic Project Summarization logic.
- **P0:** Card Filter/Search algorithms.
- **P1:** Task State Transitions.
- **P1:** Speech-to-Task integration.
- **P2:** UI Component Accessibility (ARIA roles).

## Recommendations
- **Framework:** **Vitest** (Native to Vite) + **React Testing Library**.
- **Directory Structure:**
  ```
  /src
    /__tests__
      App.spec.tsx
      CardView.spec.tsx
    /services
      /__tests__
        gemini.spec.ts
  ```

## Bootstrap Test File (`src/services/__tests__/logic.spec.ts`)
```typescript
import { describe, it, expect } from 'vitest';

describe('Inventory Logic', () => {
  it('should filter cards by tag correctly', () => {
    const cards = [{ tags: ['a'] }, { tags: ['b'] }];
    const filtered = cards.filter(c => c.tags.includes('a'));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].tags).toContain('a');
  });
});
```

## High-Value Test Cases
1. **Search Precision:** Verify that searching for "Security" returns only cards with that keyword in name or description.
2. **State Persistence:** Verify that updating a card's "Goal" is reflected in the mocked storage layer.
3. **AI Failure Recovery:** Mock a Gemini API 500 error and verify that the UI displays a "Semantic summary unavailable" fallback instead of crashing.

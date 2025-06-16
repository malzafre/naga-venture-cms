# Code Review Instructions for NAGA VENTURE Tourism CMS

You are reviewing code for the NAGA VENTURE Tourism CMS, a React Native (Expo) application with Supabase backend. Follow
these specific review criteria:

## Architecture & Design Patterns

### ✅ Check for "Smart Hook, Dumb Component" Pattern

- **Hooks**: Should contain ALL business logic, data fetching, and state management
- **Components**: Should be purely presentational, receiving only props
- **Flag**: Any business logic or API calls directly in components

### ✅ Verify Atomic Design Structure

- Components should follow Atoms → Molecules → Organisms hierarchy
- Reuse existing components from the component library
- **Flag**: Duplicated UI patterns that could use existing components

## Code Quality & Standards

### ✅ Formatting & Style

- **Indentation**: Must use tabs, not spaces
- **Naming**: PascalCase for types/enums, camelCase for functions/variables
- **Flag**: Inconsistent naming conventions or space indentation

### ✅ TypeScript & Type Safety

- All functions/variables must have proper types
- Leverage `types/database.ts` and `types/supabase.ts`
- No `any` types unless absolutely necessary
- **Flag**: Missing types, improper type definitions, or `any` usage

### ✅ Functional Programming

- Prefer `const` over `let`, use `readonly` when appropriate
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Immutable data patterns
- **Flag**: Mutating data directly, missing optional chaining

## State Management & Data Flow

### ✅ Server State (TanStack Query)

- ALL server state must use TanStack Query
- Proper query keys and cache invalidation
- **Flag**: Direct API calls without TanStack Query

### ✅ Data State Handling

- Every data component must handle: `isLoading`, `isError`, empty states
- Proper error boundaries implementation
- **Flag**: Missing loading/error state handling

### ✅ Validation with Zod

- All form inputs and API responses must use Zod validation
- Proper error handling for validation failures
- **Flag**: Missing validation or manual validation instead of Zod

## Performance & Optimization

### ✅ List Rendering

- Must use `@shopify/flash-list` for dynamic lists
- **Flag**: Usage of `FlatList`, `ScrollView`, or `map()` for large lists

### ✅ Image Optimization

- All images must use `expo-image`
- **Flag**: Usage of standard `Image` component

### ✅ React Performance

- Proper use of `useCallback`, `useMemo` for expensive operations
- Avoid unnecessary re-renders
- **Flag**: Missing memoization for expensive calculations

## Security & Best Practices

### ✅ API Keys & Environment Variables

- No hardcoded API keys or secrets in code
- All secrets loaded from environment variables
- **Flag**: Any exposed secrets or hardcoded sensitive data

### ✅ Database Security

- Sensitive operations (DELETE, complex updates) must use Supabase RPC functions
- No direct table access for sensitive operations
- **Flag**: Direct database calls for sensitive operations

### ✅ Navigation

- Must use centralized `NavigationService` for routing
- **Flag**: Direct `router.push()` or `router.replace()` calls in components

## Error Handling

### ✅ Async Operations

- All async operations wrapped in try/catch blocks
- Contextual error logging
- **Flag**: Unhandled async operations or generic error handling

### ✅ Error Boundaries

- Proper React error boundaries for component trees
- **Flag**: Missing error boundaries for data-driven components

## Code Organization

### ✅ Constants & Magic Strings

- Use constant files instead of magic strings
- Centralized configuration
- **Flag**: Hardcoded strings that should be constants

### ✅ Import Organization

- Clean import statements, grouped logically
- No unused imports
- **Flag**: Messy imports or unused dependencies

## Review Output Format

For each issue found, provide:

```
🔴 CRITICAL: [Brief description]
📁 File: [filename:line]
💡 Fix: [Specific solution]
```

```
🟡 IMPROVEMENT: [Brief description]
📁 File: [filename:line]
💡 Suggestion: [Recommended improvement]
```

```
✅ GOOD: [What's done well]
```

## Priority Levels

- **🔴 CRITICAL**: Security issues, performance problems, architecture violations
- **🟡 IMPROVEMENT**: Code quality, maintainability, best practices
- **✅ GOOD**: Acknowledge well-implemented patterns

## Final Checklist

Before approving, ensure:

- [ ] No security vulnerabilities
- [ ] Follows "Smart Hook, Dumb Component" pattern
- [ ] Proper type safety throughout
- [ ] All data states handled (loading/error/empty)
- [ ] Performance optimizations in place
- [ ] Consistent code style and naming
- [ ] Proper error handling
- [ ] No magic strings or hardcoded values

Focus on maintainability, security, and adherence to project-specific patterns. Prioritize architectural consistency and
type safety above minor style issues.

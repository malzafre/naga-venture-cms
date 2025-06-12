# GitHub Copilot Instructions for the NAGA VENTURE Project

# CODING_GUIDELINES.md

## Project Context
You are working on the NAGA VENTURE Tourism CMS, a React Native (Expo) application for managing tourism data in Naga City. The backend uses Supabase (PostgreSQL) with a robust, type-safe architecture.

## Key Libraries Usage Summary

- TanStack Query: Server state management - All API calls and caching
- Zustand: Global client state management - UI state, user preferences, app-wide settings
- Zod: Data validation - Forms and API response validation
- @shopify/flash-list: List rendering - Replace FlatList/ScrollView
- expo-image: Image optimization - All image components
- Supabase: Backend/Database - Type-safe database operations

## Core Development Principles

### Code Quality Standards
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **KISS**: Keep It Simple, Stupid - prioritize simplicity and readability
- **DRY**: Don't Repeat Yourself - eliminate code duplication
- **Atomic Design**: Organize UI components as Atoms → Molecules → Organisms

### Architecture Pattern
- **"Smart Hook, Dumb Component" Pattern**: 
  - Hooks handle ALL logic (data fetching, state management, business logic)
  - Components are purely presentational, receiving only data and functions as props

## Code Formatting & Style

### Indentation
- **Use tabs, not spaces** for all indentation

### Naming Conventions
- **PascalCase**: Type names, enum values, React components
- **camelCase**: Function names, method names, property names, local variables
- **Use descriptive, whole words** in names when possible

### Language Features
- Use **functional programming principles** where possible
- Prefer **immutable data** (const, readonly)
- Use **optional chaining** (`?.`) and **nullish coalescing** (`??`) operators
- Use **interfaces** for data structures and type definitions

## React Native & React Guidelines

### Component Structure
- Use **functional components with hooks** exclusively
- Follow **React hooks rules** (no conditional hooks)
- Use **React.FC type** for components with children
- Keep components **small and focused** (single responsibility)

### Styling
- Use **CSS modules** for component styling
- Follow atomic design principles for component organization

## State Management & Data Flow

### Server State
- Use **TanStack Query (React Query)** for ALL server state management
- Handle all data states explicitly: `isLoading`, `isError`, and empty data states

### Client State
- Use Zustand for global client state management (UI state, user preferences, app-wide settings)
- Organize stores by feature/domain with immutable updates
- Use standard **React Hooks** (`useState`, `useCallback`, `useReducer`) for local component state

### Type Safety
- Leverage `types/database.ts` and `types/supabase.ts` for complete type safety
- Use **Zod** for all data validation (forms and API responses)

## Performance Optimization

### Lists & Rendering
- **Always use `@shopify/flash-list`** for dynamic lists
- **Never use** `ScrollView` or `FlatList` for dynamic data lists
- Use **expo-image** for all image rendering

## Navigation & Routing
- Use **centralized NavigationService** for all routing operations
- **Avoid direct calls** to `router.push()` or `router.replace()` in components
- **Centralize constants** - avoid magic strings by using constant files

## Security Best Practices

### API Keys & Secrets
- **Never expose API keys** directly in code
- Load ALL secrets from **environment variables** via `app.config.js`
- Use **Supabase Edge Functions** as middleware for sensitive API calls

### Database Security
- For sensitive operations (DELETE, complex updates), **do not call tables directly**
- Create and call **secure RPC functions** in Supabase with `security_definer`

## Error Handling

### Implementation Requirements
- Use **try/catch blocks** for all async operations
- Implement **proper error boundaries** in React components
- **Always log errors** with contextual information
- Every data-driven component must handle error states explicitly

## Development Workflow

### Documentation & Research
- Leverage web browsing for checking documentation, Stack Overflow, and dev communities
- Cross-reference problems and solutions with official documentation

### Code Quality Checks
- Follow formatting rules in `.prettierrc.js`
- Adhere to linting rules in `.eslintrc.js`
- Ensure all code passes TypeScript compilation without errors

## Checklist for Every Feature

- [ ] Business logic is in custom hooks, not components
- [ ] All data states (loading, error, empty) are handled
- [ ] Type safety is maintained with proper interfaces
- [ ] Security: No exposed secrets, sensitive ops use RPC
- [ ] Performance: Lists use FlashList, images use expo-image
- [ ] Navigation uses NavigationService
- [ ] Error handling with try/catch and proper logging
- [ ] Code follows naming conventions and formatting rules
- [ ] Validation implemented with Zod schemas

Remember: Prioritize code maintainability, type safety, and user experience in every implementation decision.
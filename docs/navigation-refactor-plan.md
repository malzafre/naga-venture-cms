# Refactoring Plan: Navigation & Theme

This plan will establish a clear, single source of truth for all navigation and theme-related concerns, eliminating redundancy and improving code organization in line with the NAGA VENTURE project's coding guidelines.

---

## 1. Defining File Roles (Single Responsibility Principle)

Here is the proposed role for each relevant file in the new, refactored structure:

*   **`constants/RouteConstants.ts`**: **Single Source of Truth for Route Paths.** This file will exclusively contain string constants for every route in the application (e.g., `/dashboard`, `/business/create`). This eliminates "magic strings" and makes route management safer.

*   **`config/NavigationConfig.ts`**: **Single Source of Truth for Navigation UI Structure.** This file will define the hierarchical structure of navigation elements like the sidebar menu. It will contain the array of `NavigationItem` objects, defining labels, icons, permissions, and parent-child relationships.

*   **`services/NavigationService.ts`**: **Centralized Programmatic Navigation.** This service will be the *only* place where navigation actions (e.g., `router.push`, `router.back`) are directly called. It will provide simple, abstracted methods like `NavigationService.toDashboard()` or `NavigationService.goBack()`. Components and hooks will call these methods instead of the router directly.

*   **`utils/navigationUtils.ts`**: **Pure Navigation Logic.** This file will contain pure, testable utility functions that operate on navigation data structures. Examples include `filterNavigationByRole` and `findActiveSection`. These functions will not have any side effects or dependencies on hooks or stores.

*   **`hooks/shared/useSidebarLogic.ts`**: **The "Smart Hook" for the Sidebar.** This hook will be the brain of the sidebar. It will:
    1.  Fetch the navigation structure from `config/NavigationConfig.ts`.
    2.  Use `navigationUtils.ts` to filter items based on user roles.
    3.  Get UI state (e.g., expanded sections) from the Zustand store.
    4.  Use `NavigationService.ts` to handle navigation events.
    5.  Provide the final, processed data and action handlers to the dumb `Sidebar` component.

*   **`constants/Colors.ts`**: **Single Source of Truth for the Color Palette.** This file will export an object containing all the application's color values.

*   **`hooks/useTheme.ts`**: **Theme Provider Hook.** This hook will import the colors from `Colors.ts` and other theme values (spacing, fonts, etc.) to construct and provide the complete theme object to the components that need it.

---

## 2. Identified Redundancies and Issues

My analysis found several areas of overlapping logic and misplaced files:

*   **Redundant Logic**:
    *   **Navigation Filtering**: The logic to filter navigation items by user role is implemented inline within `useSidebarLogic.ts` but also exists as a pure function `filterNavigationByRole` in `navigationUtils.ts`.
    *   **Active Section Detection**: Similarly, the logic to find the active navigation section is duplicated in `useSidebarLogic.ts` and `navigationUtils.ts`.
*   **Misplaced Files**:
    *   `constants/NavigationService.ts`: This is a service, not a constant. It performs actions and should be located in a `services/` directory.
    *   `constants/useTheme.ts`: This is a React hook, not a constant. It should be in the `hooks/` directory. The color definitions within it are constants and should be extracted.
*   **Transitional/Legacy Code**:
    *   `hooks/shared/useNavigationManagement.ts`: This hook appears to be a legacy wrapper. Its functionality is now better handled by the combination of `useSidebarLogic.ts` and the Zustand stores, making it redundant.

---

## 3. Refactoring Checklist

### Phase 1: Theme Refactoring
- [x] Create `constants/Colors.ts`.
- [x] Move the `colors` object from `constants/useTheme.ts` to `constants/Colors.ts`.
- [x] Move `constants/useTheme.ts` to `hooks/useTheme.ts`.
- [x] Update `hooks/useTheme.ts` to import the color palette from `constants/Colors.ts`.

### Phase 2: Navigation Service & Configuration
- [x] Create `services/` directory if it doesn't exist.
- [x] Move `constants/NavigationService.ts` to `services/NavigationService.ts`.
- [x] Create `config/` directory if it doesn't exist.
- [x] Move `constants/NavigationConfig.ts` to `config/NavigationConfig.ts`.
- [x] Verify that `config/NavigationConfig.ts` only contains the `tourismAdminNavigation` data structure.

### Phase 3: Logic Consolidation
- [x] Refactor `hooks/shared/useSidebarLogic.ts` to use `filterNavigationByRole` from `utils/navigationUtils.ts`.
- [x] Refactor `hooks/shared/useSidebarLogic.ts` to use `findActiveSection` from `utils/navigationUtils.ts`.
- [x] Delete the redundant legacy hook: `hooks/shared/useNavigationManagement.ts`.

### Phase 4: Verification
- [x] Ensure all imports across the project are updated to the new file locations.
- [x] Run the application and test navigation and theme-dependent components to confirm everything works as expected.
- [x] Run linter and type checker to ensure no new issues have been introduced.

### Phase 5: Error Resolution (Added During Implementation)
- [x] Fixed forbidden `require()` usage in `app/index.tsx` - replaced with ES6 import.
- [x] Removed unused imports and variables identified by the linter:
  - [x] Removed unused `Platform` import from `app/index.tsx`.
  - [x] Removed unused `ROLE_ICONS` constant and related icon imports from `ModernStaffCard.tsx`.
  - [x] Removed unused `onEdit` prop from `ModernStaffCard.tsx`.
  - [x] Removed unused `takePhoto` function from `CMSImagePicker.tsx`.
- [x] Fixed type errors in business management screens:
  - [x] Added missing required properties (`phone`, `latitude`, `longitude`) to `BusinessInsert` in `create.tsx`.
  - [x] Fixed `handleSubmit` function in `edit/[id].tsx` to be type-safe and only include changed fields.
  - [x] Fixed incorrect property access (`business.profiles` → `business.owner`) in `all-businesses.tsx`.
- [x] Added proper fallback values for potentially undefined data in `ModernStaffCard.tsx`.
- [x] **Final verification completed**: TypeScript compiler and ESLint both pass without errors or warnings.

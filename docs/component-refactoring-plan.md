# Phased Component Refactoring Plan

**Last Updated:** June 22, 2025

**Objective:** To refactor the entire component library (`atoms`, `molecules`, `organisms`) to align with the "Smart Hook, Dumb Component" architecture, as detailed in the `smart-component-analysis.md` analysis. This plan is structured in phases to minimize disruption and ensure a stable, incremental rollout.

---

## Guiding Principles

-   **Incremental Changes:** Each phase should result in a stable, testable application state.
-   **Low to High Risk:** Phases are ordered from the least complex and risky changes to the most critical.
-   **No Production Breakage:** Changes within a phase are grouped to ensure that related components are updated together, preventing integration issues.

---

## Phase 1: Foundational Changes & Low-Risk Adjustments ✅ COMPLETED

**Goal:** Correct component placement and refactor simple components with clear, isolated violations. This phase has minimal risk and primarily involves moving files and making small, targeted code changes.

### Checklist:

-   [x] **Component Relocation:**
    -   [x] ~~Move `LoadingIndicator.tsx` from `components/molecules` to `components/atoms`.~~ (Component doesn't exist in current codebase)
    -   [x] ~~Move `StyledText.tsx` from `components/molecules` to `components/atoms`.~~ (Component doesn't exist in current codebase)
    -   [x] Move `IconPicker.tsx` from `components/atoms` to `components/molecules`. ✅ **COMPLETED**
    -   [ ] **(Recommended)** Extract `CategoryDetailPanel` from `CategoryTreeInterface.tsx` into its own file at `components/molecules/CategoryDetailPanel.tsx`. (Deferred to later phase)
    -   [ ] **(Recommended)** Extract sub-components from `ModernStaffCard.tsx`: (Deferred to later phase)
        -   `StaffAvatar`, `RoleBadge`, `ActionButton` -> `components/atoms/`
        -   `RoleEditingSection` -> `components/molecules/`
    -   [ ] **(Recommended)** Extract sub-components from `StaffGrid.tsx`: (Deferred to later phase)
        -   `EmptyState`, `StaffHeader`, `PaginationControls` -> `components/molecules/`
    -   [x] Update all import paths affected by these moves. ✅ **COMPLETED**

-   [x] **Atom & Molecule Purity Refactoring:**
    -   [x] **`CMSNavigationItem.tsx`**: Remove the `expo-router` import and `router.push` call. Ensure it only uses the `onPress` prop for actions. Update parent components (`SidebarNav`) to provide the correct `onPress` handler using `NavigationService`. ✅ **COMPLETED**
    -   [x] **`CMSRouteGuard.tsx`**: Replace all `router.push()` calls with `NavigationService.toLogin()` and `NavigationService.toDashboard()`. ✅ **COMPLETED**
    -   [x] ~~**`UserAvatar.tsx`**: Remove the direct use of the `useAuth` store. Refactor it to accept a `user` object as a prop. Update its parent component (`CMSSidebar`) to fetch and pass the user data.~~ (Component doesn't exist in current codebase)

---

## Phase 2: Smart Hook Creation for Molecules

**Goal:** Extract business logic from "smart" molecules into dedicated hooks. This is the core of the refactoring effort for medium-complexity components.

### Checklist:

-   [ ] **`useImagePicker` Hook:**
    -   [ ] Create `hooks/shared/useImagePicker.ts`.
    -   [ ] Move all validation logic (file size, type, count) from `CMSImagePicker.tsx` into the hook.
    -   [ ] Refactor `CMSImagePicker.tsx` (atom) to be a dumb component consuming this hook.

-   [ ] **`useImageUpload` Hook:**
    -   [ ] Create `hooks/shared/useImageUpload.ts`.
    -   [ ] Move image selection and Supabase upload mutation logic from `ImageUpload.tsx` and `ImagePicker.tsx` into the hook.
    -   [ ] Refactor both `ImageUpload.tsx` and `ImagePicker.tsx` (molecules) to be dumb components consuming this hook.

-   [ ] **`useAmenitySelector` Hook:**
    -   [ ] Create `hooks/features/tourism/useAmenitySelector.ts`.
    -   [ ] Move the TanStack Query logic for fetching amenities from `AmenitySelector.tsx` into the hook.
    -   [ ] Refactor `AmenitySelector.tsx` to be a dumb component consuming the hook.

-   [ ] **`useBusinessCategorySelector` Hook:**
    -   [ ] Create `hooks/features/business/useBusinessCategorySelector.ts`.
    -   [ ] Move the TanStack Query logic from `BusinessCategorySelector.tsx` into the hook.
    -   [ ] Refactor `BusinessCategorySelector.tsx` to be a dumb component consuming the hook.

-   [ ] **`useCategoryAssignment` Hook:**
    -   [ ] Create `hooks/features/categories/useCategoryAssignment.ts`.
    -   [ ] Move all TanStack Query logic from `CategoryAssignment.tsx` into the hook.
    -   [ ] Refactor `CategoryAssignment.tsx` to be a dumb component consuming the hook.

-   [ ] **Data Table Component Suite Refactoring:**
    -   [ ] Refactor `CustomDataTable.tsx` to remove its internal `useState` for search queries. It should receive the query and a handler from props.
    -   [ ] Refactor `DataTable.tsx` to remove its internal sorting logic. It should receive sorted data and an `onSort` handler from props.
    -   [ ] Ensure all hooks using these components handle state externally.

---

## Phase 3: Smart Hook Creation for Organisms

**Goal:** Tackle the large, complex organism components, extracting their business logic into dedicated hooks. These changes are higher risk due to the complexity of the components.

### Checklist:

-   [ ] **`CMSDashboardLayout.tsx` Refactoring:**
    -   [ ] Create or consolidate into a central `useAuth` hook in `hooks/features/auth/`.
    -   [ ] Move session checking, `handleLogout`, and redirection logic from `CMSDashboardLayout.tsx` into this hook.
    -   [ ] Move drawer state management (`isDrawerOpen`) into a `useLayout` hook if it becomes complex.
    -   [ ] Refactor `CMSDashboardLayout.tsx` to consume the `useAuth` hook for user and session state.

-   [ ] **`DashboardStats.tsx` Refactoring:**
    -   [ ] Create `hooks/features/dashboard/useDashboardStats.ts`.
    -   [ ] Move the `useQuery` logic for `fetchDashboardStats` from `DashboardStats.tsx` into the hook.
    -   [ ] Refactor `DashboardStats.tsx` to be a dumb component that only handles rendering and layout.

-   [ ] **`RecentActivity.tsx` Refactoring:**
    -   [ ] Create `hooks/features/dashboard/useRecentActivity.ts`.
    -   [ ] Move the `useQuery` logic for `fetchRecentActivity` from `RecentActivity.tsx` into the hook.
    -   [ ] Refactor `RecentActivity.tsx` to be a dumb component that only handles rendering the list.

-   [ ] **`TourismContentList.tsx` Refactoring:**
    -   [ ] Create `hooks/features/tourism/useTourismContent.ts`.
    -   [ ] Move the `useQuery` for fetching content and the `handleEdit`/`handleDelete` logic from `TourismContentList.tsx` into the hook.
    -   [ ] Refactor `TourismContentList.tsx` to be a dumb component that only handles rendering.

-   [ ] **`CategoryFormModal.tsx` Refactoring:**
    -   [ ] Create `hooks/features/categories/useCategoryForm.ts`.
    -   [ ] Move all `useForm` logic from `react-hook-form` into the hook.
    -   [ ] Move all TanStack Query mutation hooks (`useCreateMainCategory`, `useUpdateMainCategory`, etc.) into the hook.
    -   [ ] Move the complex `onSubmit` function into the hook.
    -   [ ] Refactor `CategoryFormModal.tsx` to be a dumb component that only renders UI based on hook's return values.

-   [ ] **`StaffManagement.tsx` Refactoring:**
    -   [ ] Create `hooks/features/user/useStaffManagement.ts`.
    -   [ ] Move all `useState` calls (`currentPage`, `editingUserId`, `confirmDeleteModal`) into the hook.
    -   [ ] Move all data-fetching and mutation hooks (`useStaffListings`, `useUpdateStaffRole`, `useQuickDeleteUser`) into the hook.
    -   [ ] Move all event handlers (`handleRoleUpdate`, `handleDeleteUser`, `handleConfirmDelete`) into the hook.
    -   [ ] Refactor `StaffManagement.tsx` to be a dumb component that orchestrates its children using props from the hook.

---

## Phase 4: Critical & Composite Component Refactoring

**Goal:** Refactor the most complex and critical components that function as mini-applications. These have the highest risk and impact.

### Checklist:

-   [ ] **`BusinessDataTable.tsx` Refactoring:**
    -   [ ] Create `hooks/features/business/useBusinessDataTable.ts`.
    -   [ ] Move all data fetching, pagination, sorting, deletion mutations, and modal state from `BusinessDataTable.tsx` into the hook.
    -   [ ] Move navigation handlers and business logic into the hook.
    -   [ ] Refactor `BusinessDataTable.tsx` into a dumb component that composes the UI using the hook.

-   [ ] **Navigation & Layout Hook Refactoring:**
    -   [ ] Create `hooks/shared/useNavigation.ts` to centralize navigation logic.
    -   [ ] Move drawer state management and route-based UI changes from `CMSDashboardLayout.tsx` into a `useLayout` hook.
    -   [ ] Ensure all navigation uses `NavigationService` instead of direct `router` calls.

---

## Phase 5: Finalization & Verification

**Goal:** Ensure all refactoring is complete, the application is stable, and all coding guidelines are met.

### Checklist:

-   [ ] **Code Review:** Conduct a full review of all new hooks and refactored components.
-   [ ] **Testing:** Perform a full regression test of the application, paying close attention to the areas affected by the refactoring.
-   [ ] **Cleanup:** Delete any old, commented-out, or unused code.
-   [ ] **Documentation:** Update any relevant documentation to reflect the new architecture.

---

## Component Refactoring Summary

**Total Components Analyzed:** 45
**Components Requiring Refactoring:** 19
**Components Requiring Relocation/Extraction:** 6
**Well-Structured Components:** 26

### Components Requiring No Refactoring (Well-Structured)

#### Organisms (6)
- `BusinessForm.tsx`
- `CategoryTreeInterface.tsx`
- `CMSPlaceholderPage.tsx`
- `CMSSidebar.tsx`
- `ModernStaffCard.tsx`
- `StaffGrid.tsx`

#### Molecules (14)
- `AmenityInput.tsx`
- `CategoryNode.tsx`
- `ConfirmationModal.tsx`
- `ControlledInput.tsx`
- `Modal.tsx`
- `MultiSelect.tsx`
- `SearchBar.tsx`
- `SidebarMenu.tsx`
- `SidebarNav.tsx`
- `SortableHeader.tsx`
- `StaffCard.tsx`
- `SubCategoryNode.tsx`
- `TableControls.tsx`
- `TablePagination.tsx`

#### Atoms (6)
- `CMSButton.tsx`
- `CMSInput.tsx`
- `CMSNavigationDropdownIndicator.tsx`
- `CMSText.tsx`
- `LoadingIndicator.tsx` (After move)
- `SkeletonLoader.tsx`
- `StyledText.tsx` (After move)

# Organism Component Refactoring Analysis

This document outlines the analysis and refactoring plan for the organism components in `components/organisms` based on the NAGA VENTURE project's coding guidelines.

## 1. Deep Analysis of Organism Components

### `CMSDashboardLayout.tsx`

*   **Trace the Logic**:
    *   `useSession()`: Authentication state management. **Candidate for a `useAuth` or `useUserSession` hook.**
    *   `useRouter()`, `usePathname()`: Navigation logic. **Should be abstracted into `NavigationService` and a dedicated `useNavigation` hook.**
    *   `useState<boolean>(false)` for `isDrawerOpen`: Local UI state, acceptable to keep in the component for now, but could be moved to a `useUI` or `useLayout` hook if it becomes more complex.
    *   `handleLogout()`: Business logic for logging out. **Should be moved to the `useAuth` hook.**
    *   `useEffect` for checking authentication and redirecting: This is critical business logic. **It must be moved to a `useAuth` hook to handle session state and redirection centrally.**
    *   `useEffect` for closing the drawer on route change: UI logic, acceptable but could be part of a `useNavigation` hook that manages layout state based on routes.
*   **Check for "Dumbness"**:
    *   The component contains significant layout logic (Flexbox, padding, margins) which is appropriate for an organism-level layout component. It assembles `Header`, `Sidebar`, and the main content area. This is consistent with its role.
*   **Component Misplacement**:
    *   `CMSDashboardLayout` is correctly placed as an organism. It defines a major page structure.
*   **Identify Reusability**:
    *   The layout is specific to the CMS dashboard. It's not a candidate for generic reuse without significant modification.

### `DashboardStats.tsx`

*   **Trace the Logic**:
    *   `useQuery` for fetching dashboard stats (`fetchDashboardStats`): Data fetching logic. **This must be moved to a `useDashboardStats` hook.**
    *   The component correctly handles `isLoading` and `isError` states.
*   **Check for "Dumbness"**:
    *   The component assembles multiple `StatsCard` molecules. It has some layout styling (`styles.container`), which is appropriate for an organism.
*   **Component Misplacement**:
    *   `DashboardStats` is correctly placed as an organism. It's a significant section of the dashboard page composed of smaller molecules.
*   **Identify Reusability**:
    *   The `StatsCard` component (likely a molecule) is highly reusable. `DashboardStats` itself is specific to the dashboard context.

### `RecentActivity.tsx`

*   **Trace the Logic**:
    *   `useQuery` for fetching recent activity (`fetchRecentActivity`): Data fetching logic. **This must be moved to a `useRecentActivity` hook.**
    *   It handles `isLoading` and `isError` states.
*   **Check for "Dumbness"**:
    *   It uses `@shopify/flash-list` to render a list of `ActivityItem` components. It defines the list container and header, which is appropriate for an organism.
*   **Component Misplacement**:
    *   `RecentActivity` is correctly placed as an organism.
*   **Identify Reusability**:
    *   The `ActivityItem` component is reusable. The `RecentActivity` component is specific but the pattern (a list with a header) is common.

### `TourismContentList.tsx`

*   **Trace the Logic**:
    *   `useQuery` for fetching tourism content (`fetchTourismContent`): Data fetching logic. **Must be moved to a `useTourismContent` hook.**
    *   `handleEdit`, `handleDelete`: Event handlers containing business logic (navigation, calling mutations). **These should be moved to the `useTourismContent` hook.** The hook should expose functions like `editContent(id)` and `deleteContent(id)`.
*   **Check for "Dumbness"**:
    *   It renders a list of `ContentRow` items using `@shopify/flash-list`. It contains layout styles for the list container, which is acceptable.
*   **Component Misplacement**:
    *   Correctly placed as an organism.
*   **Identify Reusability**:
    *   The pattern of a list with CRUD actions is very common. A generic `ResourceList` organism could be created, which takes a hook and rendering components as props, but for now, `TourismContentList` is specific enough.

### `BusinessForm.tsx`

*   **Analysis**: This component already follows the "Smart Hook, Dumb Component" pattern. It correctly utilizes the `useBusinessForm` hook to manage all form logic, state, and multi-step navigation.
*   **Verdict**: No refactoring is required. This component serves as a good example of the target architecture.

### `CategoryFormModal.tsx`

*   **Trace the Logic**: This component is currently "smart." It directly calls multiple TanStack Query mutation hooks (`useCreateMainCategory`, `useUpdateMainCategory`, etc.) and contains the `onSubmit` business logic for creating/updating categories.
*   **Check for "Dumbness"**: It fails the "dumbness" test due to the direct data mutations and complex submission handler.
*   **Refactoring Plan**:
    *   [ ] **Create `useCategoryForm` hook** in `hooks/features/categories/useCategoryForm.ts`.
    *   [ ] This hook will encapsulate all `useForm` logic from `react-hook-form`.
    *   [ ] It will also contain all TanStack Query mutation hooks (`useCreate...`, `useUpdate...`).
    *   [ ] The complex `onSubmit` function will be moved into this hook.
    *   [ ] The hook will expose the necessary form state (`control`, `handleSubmit`, `errors`) and submission status (`isSubmitting`, `isSaving`).
    *   [ ] **Refactor `CategoryFormModal`** to be a dumb component that calls `useCategoryForm` and is responsible only for rendering the UI based on the hook's return values.

### `CategoryTreeInterface.tsx`

*   **Analysis**: This component is a "dumb" UI component. It receives all data (`mainCategories`, `stats`) and event handlers (`onToggleExpansion`, `onSelectCategory`, etc.) as props. It successfully separates presentation from logic.
*   **Component Misplacement**: The `CategoryDetailPanel` is a distinct molecule defined within this organism's file.
*   **Refactoring Plan**:
    *   [ ] (Recommended) Extract `CategoryDetailPanel` into its own file at `components/molecules/CategoryDetailPanel.tsx` to improve modularity.

### `CMSPlaceholderPage.tsx`

*   **Analysis**: This is a well-designed, reusable "dumb" organism. It correctly uses other organisms (`CMSRouteGuard`, `CMSDashboardLayout`) and only contains presentational logic.
*   **Verdict**: No refactoring is required.

### `CMSRouteGuard.tsx`

*   **Analysis**: This component correctly uses hooks (`useAuth`, `useRouteGuard`) for its logic. However, it violates the navigation guideline by calling `router.push()` directly.
*   **Refactoring Plan**:
    *   [ ] Replace all instances of `router.push()` with the centralized `NavigationService`. For example, `router.push('/login')` becomes `NavigationService.navigate(RouteConstants.LOGIN)`.
    *   [ ] Verify that `constants/RouteConstants.ts` includes all necessary routes (`LOGIN`, `DASHBOARD`).

### `CMSSidebar.tsx`

*   **Analysis**: This is an excellent example of the "Smart Hook, Dumb Component" pattern. All logic is contained within the `useSidebarLogic` hook, and the component is purely presentational.
*   **Verdict**: No refactoring is required.

### `ModernStaffCard.tsx`

*   **Analysis**: This component is on the borderline between a large molecule and a small organism. It manages local UI state (`showEditModal`), which is acceptable. Its primary role is presentation. The main improvement would be to increase its modularity by extracting its sub-components.
*   **Component Misplacement**: Contains multiple sub-components defined in the same file.
*   **Refactoring Plan**:
    *   [ ] (Optional but Recommended) Extract `StaffAvatar`, `RoleBadge`, and `ActionButton` into their own files under `components/atoms/`.
    *   [ ] (Optional but Recommended) Extract `RoleEditingSection` into its own file under `components/molecules/`.

### `StaffGrid.tsx`

*   **Analysis**: This is a "dumb" component that correctly receives all its data and handlers via props. It assembles `ModernStaffCard` components into a grid.
*   **Component Misplacement**: Contains `EmptyState`, `StaffHeader`, and `PaginationControls` defined internally.
*   **Refactoring Plan**:
    *   [ ] (Optional but Recommended) Extract `EmptyState`, `StaffHeader`, and `PaginationControls` into their own files under `components/molecules/` to promote reusability.

### `StaffManagement.tsx`

*   **Trace the Logic**: This is a "smart" container component. It manages local state (`currentPage`, `editingUserId`, modals) and directly uses multiple data and mutation hooks (`useStaffListings`, `useUpdateStaffRole`, `useQuickDeleteUser`). This logic needs to be extracted.
*   **Check for "Dumbness"**: It is a smart component that orchestrates the entire staff management feature.
*   **Refactoring Plan**:
    *   [ ] **Create `useStaffManagement` hook** in `hooks/features/user/useStaffManagement.ts`.
    *   [ ] Move all `useState` calls (`currentPage`, `editingUserId`, `confirmDeleteModal`) into the new hook.
    *   [ ] Move all data-fetching and mutation hooks (`useStaffListings`, `useUpdateStaffRole`, etc.) into the hook.
    *   [ ] Move all event handlers (`handleRoleUpdate`, `handleDeleteUser`, `handleConfirmDelete`) into the hook.
    *   [ ] The hook will return a comprehensive API including data (`staffMembers`, `totalCount`, `isLoading`), state (`editingUserId`, `confirmDeleteModal`), and handlers (`onPageChange`, `onEdit`, `onDelete`, etc.).
    *   [ ] **Refactor `StaffManagement`** to be a dumb component that calls the `useStaffManagement` hook and passes the returned props down to its child organisms and molecules (`StaffStatistics`, `StaffFilterControls`, `StaffGrid`).

---

## 2. Molecule Component Analysis

This section analyzes components in `components/molecules` to identify refactoring opportunities based on the "Smart Hook, Dumb Component" pattern.

---

### AmenityInput.tsx

-   **Analysis**: This component manages its own input state, which is acceptable for local UI state. It correctly uses an `onAdd` prop to delegate the action.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### AmenitySelector.tsx

-   **Analysis**: This component is currently "smart" as it directly fetches the list of amenities using TanStack Query. This data-fetching logic should be extracted.
-   **Verdict**: 🔴 Needs refactoring.
-   **Refactoring Checklist**:
    -   [ ] Create a new hook `hooks/features/tourism/useAmenitySelector.ts`.
    -   [ ] Move the `useQuery` logic for fetching amenities from the component into the new hook.
    -   [ ] The hook should manage the selection state and return `{ amenities, isLoading, isError, selectedAmenities, toggleAmenity }`.
    -   [ ] Refactor `AmenitySelector` to be a "dumb" component that consumes the `useAmenitySelector` hook and only handles rendering.

---

### BusinessCategorySelector.tsx

-   **Analysis**: Similar to `AmenitySelector`, this component fetches its own data, making it "smart."
-   **Verdict**: 🔴 Needs refactoring.
-   **Refactoring Checklist**:
    -   [ ] Create a new hook `hooks/features/business/useBusinessCategorySelector.ts`.
    -   [ ] Move the `useQuery` logic for fetching business categories into the hook.
    -   [ ] The hook should return `{ categories, isLoading, isError, selectedCategoryId, setSelectedCategoryId }`.
    -   [ ] Refactor `BusinessCategorySelector` to be a "dumb" component that accepts props from the new hook.

---

### BusinessDataTable.tsx

-   **Analysis**: This is a highly "smart" component acting as a mini-application. It handles data fetching, pagination, sorting, delete mutations, navigation, and modal state. All of this logic must be extracted.
-   **Verdict**: 🔴 Critical refactoring needed.
-   **Refactoring Checklist**:
    -   [ ] Create a new hook `hooks/features/business/useBusinessDataTable.ts`.
    -   [ ] Move all logic into the hook: `useQuery` for fetching, `useMutation` for deleting, `useState` for modal confirmation, and navigation handlers.
    -   [ ] The hook should manage all table state (sorting, pagination, selection) and expose it along with data and action handlers.
    -   [ ] Refactor `BusinessDataTable` into a dumb component that renders `CustomDataTable` and passes the props received from the `useBusinessDataTable` hook.

---

### CategoryAssignment.tsx

-   **Analysis**: This component contains data-fetching (`useQuery`) and mutation (`useMutation`) logic.
-   **Verdict**: 🔴 Needs refactoring.
-   **Refactoring Checklist**:
    -   [ ] Create a new hook `hooks/features/categories/useCategoryAssignment.ts`.
    -   [ ] Move all TanStack Query logic into the hook.
    -   [ ] The hook should return `{ categories, assignCategory, isAssigning, ... }`.
    -   [ ] Refactor the component to be presentational, consuming the hook.

---

### CategoryNode.tsx & SubCategoryNode.tsx

-   **Analysis**: These components are presentational. They receive data and handlers as props and manage minimal local UI state (e.g., `isExpanded`), which is acceptable.
-   **Verdict**: ✅ Well-structured molecules. No refactoring needed.

---

### ConfirmationModal.tsx

-   **Analysis**: A perfect example of a reusable, "dumb" molecule. It is fully controlled by props.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### ControlledInput.tsx

-   **Analysis**: A wrapper for `react-hook-form`. Its logic is purely for form state integration, not business logic. This is a correct and reusable pattern.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### CustomDataTable.tsx, DataTable.tsx, Table.tsx

-   **Analysis**: This suite of components forms the data table UI. `CustomDataTable` and `DataTable` contain UI state and sorting logic that should be managed by a parent hook. The goal is to make `CustomDataTable` a completely dumb, configurable component.
-   **Verdict**: 🟡 Needs minor refactoring for purity.
-   **Refactoring Checklist**:
    -   [ ] Ensure any hook using `CustomDataTable` (e.g., `useBusinessDataTable`) handles all state: sorting, pagination, and search/filter query.
    -   [ ] Refactor `CustomDataTable` to remove its internal `useState` for search queries. It should receive the query and a handler from props.
    -   [ ] Refactor `DataTable` to remove its internal sorting logic. It should receive sorted data and an `onSort` handler from props.

---

### ImagePicker.tsx & ImageUpload.tsx

-   **Analysis**: These components handle image selection and uploading to Supabase Storage. The upload mutation and file handling logic should be extracted.
-   **Verdict**: 🔴 Needs refactoring.
-   **Refactoring Checklist**:
    -   [ ] Create a new hook `hooks/shared/useImageUpload.ts`.
    -   [ ] The hook will manage picking an image from the device and the `useMutation` logic for uploading it.
    -   [ ] The hook should return `{ uploadImage, isUploading, uploadedImageUrl, pickImage }`.
    -   [ ] Refactor `ImageUpload` to use the hook and only manage UI display (preview, button, loading state).

---

### LoadingIndicator.tsx

-   **Analysis**: A simple, presentational component. However, as a single, indivisible element, it fits the definition of an "Atom" better than a "Molecule".
-   **Verdict**: 🟡 Misplaced component.
-   **Refactoring Checklist**:
    -   [ ] Move `LoadingIndicator.tsx` from `components/molecules` to `components/atoms`.

---

### Modal.tsx

-   **Analysis**: A generic, presentational modal wrapper.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### MultiSelect.tsx

-   **Analysis**: A complex but self-contained and reusable form component. Its state is UI-specific and does not involve business logic.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### SearchBar.tsx

-   **Analysis**: A simple, "dumb" component that delegates its action via the `onSearch` prop.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### SidebarMenu.tsx & SidebarNav.tsx

-   **Analysis**: These components correctly use hooks (`usePathname`, `useRole`) to get data and render navigation items. The logic is related to routing and permissions, which is appropriate for these components within the sidebar organism.
-   **Verdict**: ✅ Well-structured molecules. No refactoring needed.

---

### SortableHeader.tsx

-   **Analysis**: A simple, "dumb" component that delegates its action via the `onSort` prop.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.

---

### StaffCard.tsx

-   **Analysis**: A presentational component that displays data passed via props.
-   **Verdict**: ✅ Well-structured molecule. No refactoring needed.
-   **Note**: This is the simpler version of `ModernStaffCard`. Its placement as a molecule is correct.

---

### StyledText.tsx

-   **Analysis**: A wrapper around the base `Text` component to apply consistent styling. This is a foundational, indivisible UI element.
-   **Verdict**: 🟡 Misplaced component.
-   **Refactoring Checklist**:
    -   [ ] Move `StyledText.tsx` from `components/molecules` to `components/atoms`.

---

### TableControls.tsx & TablePagination.tsx

-   **Analysis**: Both are excellent "dumb" components, fully controlled by props.
-   **Verdict**: ✅ Well-structured molecules. No refactoring needed.

---

### UserAvatar.tsx

-   **Analysis**: This component is not fully "dumb" because it fetches its own data from the `useAuth` Zustand store. It should receive user data via props to be truly presentational and reusable.
-   **Verdict**: 🟡 Needs minor refactoring for purity.
-   **Refactoring Checklist**:
    -   [ ] Refactor `UserAvatar` to accept a `user` object as a prop (e.g., `user: { full_name, avatar_url }`).
    -   [ ] Remove the direct use of the `useAuth` store from the component.
    -   [ ] Update the parent component (e.g., `CMSSidebar`) to fetch the user data and pass it down to `UserAvatar`.

---

## 3. Atom Component Analysis

This section analyzes components in `components/atoms` to ensure they are simple, presentational, and correctly placed.

---

### CMSButton.tsx

-   **Analysis**: A classic, reusable button component. Its internal state (`isHovered`) is for UI presentation only and is acceptable.
-   **Verdict**: ✅ Well-structured atom. No refactoring needed.

---

### CMSImagePicker.tsx

-   **Analysis**: This component contains significant logic for validating image files (size, type, count) and displaying alerts. This business logic makes it a "smart" component.
-   **Verdict**: 🔴 Needs refactoring.
-   **Refactoring Checklist**:
    -   [ ] Create a new hook `hooks/shared/useImagePicker.ts`.
    -   [ ] Move all validation logic (file size, type, count) and alert displays from the component into the hook.
    -   [ ] The hook should expose a function to trigger the picker and return the state (`{ pickImage, selectedImages, error }`).
    -   [ ] Refactor `CMSImagePicker` to be a "dumb" atom that simply triggers the `pickImage` function from the hook and displays a visual state based on props.

---

### CMSInput.tsx

-   **Analysis**: A perfect example of a presentational atom. It is a styled, controlled input component.
-   **Verdict**: ✅ Well-structured atom. No refactoring needed.

---

### CMSNavigationDropdownIndicator.tsx

-   **Analysis**: A simple, animated chevron. Its internal state is for animation purposes only.
-   **Verdict**: ✅ Well-structured atom. No refactoring needed.

---

### CMSNavigationItem.tsx

-   **Analysis**: This component violates the navigation guidelines by calling `router.push` directly. It should be made completely "dumb" by only delegating actions to its `onPress` prop.
-   **Verdict**: 🔴 Needs refactoring.
-   **Refactoring Checklist**:
    -   [ ] Remove the `expo-router` import and the `router.push` call.
    -   [ ] The `handlePress` function should *only* call the `onPress` prop if it exists.
    -   [ ] The parent component (e.g., `SidebarNav`) becomes responsible for providing the `onPress` handler, which will use the `NavigationService`.

---

### CMSText.tsx

-   **Analysis**: A foundational text component for consistent typography. This is a perfect atom.
-   **Verdict**: ✅ Well-structured atom. No refactoring needed.

---

### IconPicker.tsx

-   **Analysis**: This component is far too complex to be an atom. It includes a modal, search input, state management for the search query, and a categorized list of icons. It is a self-contained feature.
-   **Verdict**: 🔴 Misplaced component.
-   **Refactoring Checklist**:
    -   [ ] Move `IconPicker.tsx` from `components/atoms` to `components/molecules`.

---

### SkeletonLoader.tsx

-   **Analysis**: A simple, presentational component for displaying a loading state. Its internal state is for animation only.
-   **Verdict**: ✅ Well-structured atom. No refactoring needed.

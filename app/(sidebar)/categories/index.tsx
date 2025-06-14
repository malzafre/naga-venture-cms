/**
 * Categories Index Page
 *
 * Routes to the category management page
 */
import { Redirect } from 'expo-router';

export default function CategoriesIndex() {
  return <Redirect href="/(sidebar)/categories/category-management" />;
}

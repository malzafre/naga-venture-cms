# Google Maps Integration Setup Guide

## 🗺️ Complete Map Pinning Feature Implementation

Your database is **already perfect** for this integration! Here's everything you need to get the map pinning feature working.

## 📋 Prerequisites Checklist

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API (Legacy)** ⚠️ **Use the original Places API, NOT the "Places API (New)"**
   - **Places API (New)** ✅ **ALSO enable this for modern PlaceAutocompleteElement**
   - **Geocoding API**
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - **Important**: Restrict your API key for security

## 🚨 IMPORTANT: Enable BOTH Places APIs

**You need to enable BOTH Places APIs:**
- **Places API (Legacy)**: For backward compatibility and geocoding
- **Places API (New)**: For the modern PlaceAutocompleteElement widget

This ensures the modern implementation works while maintaining compatibility.

## ⚡ Fixing Deprecation Warnings

**The console warnings you saw indicate deprecated APIs. Here's what we've fixed:**

### 1. ✅ Fixed: "google.maps.Marker is deprecated"
- **Old**: `new google.maps.Marker()`
- **New**: `new google.maps.marker.AdvancedMarkerElement()`
- **Benefit**: Better performance, draggable markers, modern styling

### 2. ✅ Fixed: "google.maps.places.Autocomplete is deprecated"  
- **Old**: `new google.maps.places.Autocomplete()`
- **New**: `new google.maps.places.PlaceAutocompleteElement()`
- **Benefit**: Better accessibility, mobile support, localization

### 3. ✅ Fixed: "Direct script loading without loading=async"
- **Old**: `src="...api/js?key=...&libraries=places"`
- **New**: `src="...api/js?key=...&libraries=places,marker&loading=async"`
- **Benefit**: Better performance, non-blocking load

## 🔑 Detailed API Key Creation Guide

### Step 1: Navigate to Credentials
1. In Google Cloud Console, ensure you're in the correct project
2. In the left sidebar, click **"APIs & Services"**
3. Click **"Credentials"** from the submenu

### Step 2: Create the API Key
1. Click the **"+ CREATE CREDENTIALS"** button at the top
2. Select **"API key"** from the dropdown menu
3. Your new API key will be generated automatically
4. **Copy this key immediately** - you'll need it for your `.env` file

### Step 3: Secure Your API Key (CRITICAL!)
⚠️ **Never leave an API key unrestricted - this can lead to unexpected charges!**

1. In the API key creation dialog, click **"RESTRICT KEY"**
2. Or later: Go to Credentials → Click on your API key → Click "EDIT API KEY"

#### Option A: Application Restrictions (Recommended for Web)
1. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
2. Click **"ADD AN ITEM"** and add these referrers:
   ```
   localhost:*/*
   127.0.0.1:*/*
   *.expo.dev/*
   *.ngrok.io/*
   your-production-domain.com/*
   ```
3. This ensures only your websites can use the API key

#### Option B: IP Address Restrictions (For Server-side only)
- Only use this if you're calling APIs from a server
- Add your server's IP addresses

### Step 4: API Restrictions (Essential!)
1. Under **"API restrictions"**, select **"Restrict key"**
2. Check these APIs only:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API** 
   - ✅ **Geocoding API**
3. **Do NOT** select other APIs to minimize security risk

### Step 5: Save and Test
1. Click **"SAVE"** 
2. Copy your API key to your `.env` file:
   ```bash
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_your_actual_api_key_here
   ```
3. **Restart your development server** after adding the environment variable

## 💳 Billing & Quotas Setup

### Enable Billing (Required)
⚠️ **Google Maps APIs require a billing account, even for free usage**

1. In Google Cloud Console, go to **"Billing"**
2. If no billing account exists:
   - Click **"LINK A BILLING ACCOUNT"**
   - Follow the prompts to add a credit card
   - **Don't worry**: You get $200 free credits monthly for Maps APIs

### Set Up Budget Alerts (Recommended)
1. Go to **"Billing"** → **"Budgets & alerts"**
2. Click **"CREATE BUDGET"**
3. Set a budget (e.g., $50/month)
4. Add alert thresholds at 50%, 90%, and 100%
5. This will email you if usage approaches your limits

### Understanding Free Tier Limits
**You get these free each month:**
- **Maps JavaScript API**: 28,000 map loads
- **Places API**: 2,500 requests  
- **Geocoding API**: 2,500 requests

**For a tourism CMS, this typically covers:**
- ✅ Development and testing
- ✅ Small to medium production usage
- ✅ Most local business directories

### Cost Management Tips
1. **Use API restrictions** to prevent unauthorized usage
2. **Implement caching** in your app to reduce API calls
3. **Monitor usage** in Google Cloud Console regularly
4. **Consider Progressive Web App** caching for map tiles

## 🔍 API Key Validation

### Test Your API Key
1. Replace `YOUR_API_KEY` in this URL:
   ```
   https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
   ```
2. Open it in browser - should load without errors
3. Check browser console for any error messages

### Common Validation Issues
❌ **"This API project is not authorized"** → Enable the required APIs  
❌ **"RefererNotAllowedMapError"** → Fix HTTP referrer restrictions  
❌ **"REQUEST_DENIED"** → Check billing account is active  
❌ **"INVALID_REQUEST"** → Verify API key is correct

### 2. Environment Variables
Add to your `.env` file:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Package Installation
```bash
npm install @types/google.maps
```

## 🎯 Integration Examples

### Example 1: Business Creation Form Integration

```tsx
// In your BusinessCreateForm component
import { useMapLocationPicker } from '@/hooks/features/business/useMapLocationPicker';
import MapLocationPicker from '@/components/organisms/MapLocationPicker';

export default function BusinessCreateForm() {
  const {
    isMapVisible,
    selectedLocation,
    showMap,
    hideMap,
    handleLocationSelect,
    formatLocationForDatabase,
  } = useMapLocationPicker();

  const onSubmit = async (data: any) => {
    // Get formatted location data for database
    const locationData = formatLocationForDatabase();
    
    if (!locationData) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    const businessData = {
      ...data,
      ...locationData, // This includes: location, address, city, province, google_maps_place_id
    };

    // Submit to your API
    await createBusiness(businessData);
  };

  return (
    <View>
      {/* Your existing form fields */}
      
      {/* Location Selection Section */}
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Business Location</Text>
        
        {selectedLocation ? (
          <View style={styles.selectedLocationCard}>
            <Text style={styles.selectedAddress}>
              📍 {selectedLocation.address}
            </Text>
            <View style={styles.locationActions}>
              <TouchableOpacity onPress={showMap} style={styles.changeButton}>
                <Text>Change Location</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearLocation} style={styles.clearButton}>
                <Text>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={showMap} style={styles.selectLocationButton}>
            <Text style={styles.selectLocationText}>
              📍 Select Location on Map (Optional)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        isVisible={isMapVisible}
        onClose={hideMap}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation?.coordinates}
        initialAddress={selectedLocation?.address}
      />
    </View>
  );
}
```

### Example 2: Business Edit Form Integration

```tsx
// For editing existing businesses
export default function BusinessEditForm({ business }: { business: Business }) {
  const {
    isMapVisible,
    selectedLocation,
    showMap,
    hideMap,
    handleLocationSelect,
    formatLocationForDatabase,
  } = useMapLocationPicker();

  // Set initial location from database
  useEffect(() => {
    if (business.location) {
      // Parse existing location from database
      // business.location format: "POINT(123.1815 13.6218)"
      const coords = business.location.match(/POINT\(([^)]+)\)/)?.[1].split(' ');
      if (coords && coords.length === 2) {
        const initialLocation = {
          coordinates: {
            longitude: parseFloat(coords[0]),
            latitude: parseFloat(coords[1]),
          },
          address: business.address,
          city: business.city,
          province: business.province,
          placeId: business.google_maps_place_id || undefined,
        };
        
        handleLocationSelect(initialLocation);
      }
    }
  }, [business, handleLocationSelect]);

  // Rest of your edit form logic...
}
```

## 🔧 Database Integration

Your current database structure is **perfect**:

```sql
-- Your businesses table already has:
location              GEOGRAPHY(POINT)  -- PostGIS for coordinates  
address               TEXT              -- Street address
city                  TEXT              -- City name
province              TEXT              -- Province name  
google_maps_place_id  TEXT              -- Google Places ID (optional)
```

### How to Insert Location Data

```typescript
// The hook automatically formats data for Supabase:
const locationData = formatLocationForDatabase();

// Result:
{
  location: "POINT(123.1815 13.6218)",           // PostGIS format
  address: "123 Magsaysay Avenue, Naga City",    // Full address
  city: "Naga City",                             // Parsed city
  province: "Camarines Sur",                     // Parsed province
  google_maps_place_id: "ChIJX3W-3wQCYjIR..."   // Google Place ID
}
```

## 🎨 Styling the Location Section

```tsx
const styles = StyleSheet.create({
  locationSection: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  selectedLocationCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedAddress: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  selectLocationButton: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  selectLocationText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
});
```

## 🚀 Features You Get

✅ **Interactive Map**: Click to place pins  
✅ **Drag & Drop**: Drag pins to adjust location  
✅ **Address Search**: Google Places autocomplete  
✅ **Reverse Geocoding**: Get address from coordinates  
✅ **Naga City Focused**: Bounded to local area  
✅ **Database Ready**: Auto-formats for PostGIS  
✅ **Optional Feature**: Works without location too  
✅ **Mobile Responsive**: Works on all devices

## 🔧 Troubleshooting Common Issues

### Issue: "This API project is not authorized to use this API"
**Solution**: Make sure you've enabled all FOUR APIs in Google Cloud Console:
1. Go to "APIs & Services" > "Library"
2. Search for and enable each API:
   - Maps JavaScript API
   - Places API (the original one, not "New")
   - Places API (New) - also enable this one
   - Geocoding API

### Issue: Deprecation warnings in console
**Solution**: You're using the modern implementation, but make sure you have:
1. **Places API (New)** enabled in Google Cloud Console
2. Modern MapLocationPicker_Modern.tsx component imported
3. Latest API script loading with `libraries=places,marker&loading=async`

```typescript
// Check you're using the modern APIs:
const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');
```

### Issue: "RefererNotAllowedMapError"
**Solution**: Configure API key restrictions:
1. Go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domains:
     - `localhost:*/*` (for development)
     - `*.expo.dev/*` (for Expo development)
     - Your production domain

### Issue: Map not loading in development
**Solution**: Check environment variables:
1. Ensure `.env` file has `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key`
2. Restart development server after adding environment variables
3. Verify API key is not restricted to other domains

### Issue: Places autocomplete not working
**Solution**: Verify Places API (Legacy) is enabled:
1. In Google Cloud Console, go to "APIs & Services" > "Enabled APIs"
2. Look for "Places API" (not "Places API (New)")
3. If you see "Places API (New)", also enable the original "Places API"

### Issue: Geocoding not working (no address from coordinates)
**Solution**: 
1. Enable "Geocoding API" in Google Cloud Console
2. Check browser console for specific error messages
3. Verify your API key has access to Geocoding API

### Issue: "Google is not defined" error
**Solution**: 
1. Check that the Google Maps script loads successfully
2. Verify your API key is correct in environment variables
3. Check browser network tab for failed script loads

---

## 💡 Development Tips

- **Test with invalid coordinates** to see error handling
- **Test without internet** to verify graceful degradation  
- **Check browser console** for Google Maps API errors
- **Use Chrome DevTools** to debug map rendering issues
- **Test on mobile devices** to ensure touch interactions work

## 🔒 Security Notes

1. **Restrict your API key** to your domain only
2. **Set usage limits** to avoid unexpected charges  
3. **Monitor usage** in Google Cloud Console
4. **Never expose API keys** in client-side code (use environment variables)

## 💰 Pricing Considerations

Google Maps API has generous free tiers:
- **Maps JavaScript API**: 28,000 loads/month free
- **Places API**: 17,000 requests/month free  
- **Geocoding API**: 40,000 requests/month free

For a local business directory, you'll likely stay within free limits!

## 🎯 Next Steps

1. ✅ Set up Google Cloud Console & API key
2. ✅ Add environment variables  
3. ✅ Install the MapLocationPicker component (already created)
4. ✅ Use the useMapLocationPicker hook (already created)
5. ✅ Integrate into your business forms
6. ✅ Test with real business locations in Naga City

Your database is already perfectly set up for this feature! 🎉

## 🎯 Next Steps to Fix Your Deprecation Warnings

Based on the console warnings you shared, here's exactly what you need to do:

### Step 1: Enable Places API (New)
1. Go to [Google Cloud Console APIs Library](https://console.cloud.google.com/apis/library)
2. Search for **"Places API (New)"**
3. Click on it and press **"ENABLE"**
4. Keep the original "Places API" enabled too

### Step 2: Test the Updated Implementation
The BusinessForm now uses the consolidated MapLocationPicker:
```typescript
// ✅ Clean implementation (no more warnings)
import MapLocationPicker from '@/components/organisms/MapLocationPicker';
```

### Step 3: Test the Updated Implementation
1. Restart your development server: `npm run web`
2. Navigate to business creation/editing page
3. Click "📍 Pick Location on Map"
4. **Console warnings should be gone!**

### What Changed:

#### 🔧 Modern APIs Now Used:
- ✅ **AdvancedMarkerElement** (replaces deprecated Marker)
- ✅ **PlaceAutocompleteElement** (replaces deprecated Autocomplete)  
- ✅ **Async loading pattern** (fixes performance warning)
- ✅ **Promise-based geocoding** (better error handling)

#### 🎨 Enhanced Features:
- ✅ **Draggable markers** with smooth interaction
- ✅ **Better mobile support** and accessibility
- ✅ **Improved search autocomplete** with localization
- ✅ **Error handling** for network issues
- ✅ **Loading states** for better UX

### Expected Result:
- ❌ No more deprecation warnings in console
- ✅ Faster map loading performance  
- ✅ Better user experience with modern UI
- ✅ Future-proof implementation

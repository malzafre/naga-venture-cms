# Google Cloud Console API Setup Script

## Step 1: Enable Required APIs

Run these commands in Google Cloud Shell or CLI:

```bash
# Set your project ID
PROJECT_ID="your-project-id-here"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable maps-javascript-api.googleapis.com
gcloud services enable places-backend.googleapis.com  # Legacy Places API
gcloud services enable places.googleapis.com         # New Places API
gcloud services enable geocoding-backend.googleapis.com

echo "✅ All required APIs have been enabled!"
```

## Step 2: Verify API Status

```bash
# Check enabled services
gcloud services list --enabled --filter="name:maps OR name:places OR name:geocoding"
```

You should see:
- maps-javascript-api.googleapis.com
- places-backend.googleapis.com  
- places.googleapis.com
- geocoding-backend.googleapis.com

## Alternative: Manual Setup via Console

1. Go to [APIs & Services Library](https://console.cloud.google.com/apis/library)
2. Search and enable each API:
   - **Maps JavaScript API**
   - **Places API** (the original one)
   - **Places API (New)** 
   - **Geocoding API**

## Verify in Code

Your map should now load without deprecation warnings!

```typescript
// This modern code should work without warnings:
const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');
```

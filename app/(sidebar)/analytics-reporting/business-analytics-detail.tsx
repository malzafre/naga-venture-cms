import React from 'react';

import { CMSPlaceholderPage } from '@/components/organisms';

export default function BusinessAnalyticsDetailScreen() {
  const features = [
    'Detailed business performance analytics',
    'Individual business metrics and KPIs',
    'Comparative analysis and benchmarking',
    'Business ranking and popularity metrics',
    'Revenue analytics and financial performance',
    'Customer engagement and interaction tracking',
    'Seasonal performance analysis',
    'Business growth and trend forecasting',
  ];

  const phase = { number: 1, timeline: '2-3 weeks', priority: 'HIGH' as const };

  return (
    <CMSPlaceholderPage
      title="Business Performance"
      subtitle="Detailed analytics for individual business performance"
      routePath="/TourismCMS/(admin)/analytics-reporting/business-analytics-detail"
      status="under-development"
      features={features}
      phase={phase}
    />
  );
}

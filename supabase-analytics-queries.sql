-- Analytics Queries for Supabase
-- These queries can be run directly in Supabase SQL Editor

-- 1. Get total ad clicks (excluding admin pages)
SELECT COUNT(*) as total_ad_clicks
FROM analytics_events
WHERE event_name = 'ad_click'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '24 hours';

-- 2. Get total ad clicks for different time ranges
SELECT 
  COUNT(*) as total_ad_clicks,
  DATE_TRUNC('day', timestamp) as date
FROM analytics_events
WHERE event_name = 'ad_click'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- 3. Get ad clicks by page
SELECT 
  page_url,
  COUNT(*) as ad_clicks
FROM analytics_events
WHERE event_name = 'ad_click'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY page_url
ORDER BY ad_clicks DESC
LIMIT 20;

-- 4. Get total payments (excluding admin pages)
SELECT COUNT(*) as total_payments
FROM analytics_events
WHERE event_name = 'payment_success'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '24 hours';

-- 5. Get payment revenue (sum of amounts from payment events)
SELECT 
  COUNT(*) as total_payments,
  SUM(
    CASE 
      WHEN properties::jsonb->>'amount' IS NOT NULL 
      THEN (properties::jsonb->>'amount')::numeric 
      ELSE 0 
    END
  ) as total_revenue,
  COUNT(CASE WHEN properties::jsonb->>'payment_type' = 'subscription' THEN 1 END) as subscription_payments,
  COUNT(CASE WHEN properties::jsonb->>'payment_type' = 'one_time' THEN 1 END) as one_time_payments
FROM analytics_events
WHERE event_name = 'payment_success'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days';

-- 6. Get payments by day
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as payments,
  SUM(
    CASE 
      WHEN properties::jsonb->>'amount' IS NOT NULL 
      THEN (properties::jsonb->>'amount')::numeric 
      ELSE 0 
    END
  ) as daily_revenue
FROM analytics_events
WHERE event_name = 'payment_success'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- 7. Get ad clicks vs payments comparison
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  COUNT(CASE WHEN event_name = 'ad_click' THEN 1 END) as ad_clicks,
  COUNT(CASE WHEN event_name = 'payment_success' THEN 1 END) as payments
FROM analytics_events
WHERE (event_name = 'ad_click' OR event_name = 'payment_success')
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- 8. Get ad click to payment conversion rate
WITH ad_clicks AS (
  SELECT COUNT(*) as clicks
  FROM analytics_events
  WHERE event_name = 'ad_click'
    AND page_url NOT LIKE '%/admin/%'
    AND timestamp >= NOW() - INTERVAL '30 days'
),
payments AS (
  SELECT COUNT(*) as payments
  FROM analytics_events
  WHERE event_name = 'payment_success'
    AND page_url NOT LIKE '%/admin/%'
    AND timestamp >= NOW() - INTERVAL '30 days'
)
SELECT 
  ac.clicks as ad_clicks,
  p.payments as payments,
  CASE 
    WHEN ac.clicks > 0 
    THEN ROUND((p.payments::numeric / ac.clicks::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate_percent
FROM ad_clicks ac, payments p;

-- 9. Get top pages by ad clicks
SELECT 
  page_url,
  COUNT(*) as ad_clicks,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'ad_click' AND page_url NOT LIKE '%/admin/%' AND timestamp >= NOW() - INTERVAL '30 days'), 2) as percentage
FROM analytics_events
WHERE event_name = 'ad_click'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY page_url
ORDER BY ad_clicks DESC
LIMIT 10;

-- 10. Get payment details with amounts
SELECT 
  id,
  timestamp,
  page_url,
  properties::jsonb->>'amount' as amount,
  properties::jsonb->>'payment_type' as payment_type,
  properties::jsonb->>'item_name' as item_name,
  properties::jsonb->>'payment_id' as payment_id
FROM analytics_events
WHERE event_name = 'payment_success'
  AND page_url NOT LIKE '%/admin/%'
  AND timestamp >= NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC
LIMIT 100;


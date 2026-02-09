// Internal Analytics System - No 3rd Parties
// Stores all data in your own database through your existing API
// Updated: Fixed initialization order and timestamp format

interface AnalyticsEvent {
  id?: string;
  event_type: string;
  event_name: string;
  properties: Record<string, any>;
  user_id?: string;
  session_id: string;
  page_url: string;
  page_title: string;
  timestamp: number;
  user_agent: string;
  ip_address?: string;
  referrer?: string;
  device_type: string;
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

interface PageView {
  id?: string;
  session_id: string;
  page_url: string;
  page_title: string;
  timestamp: number;
  duration?: number;
  user_id?: string;
  referrer?: string;
  user_agent: string;
  device_type: string;
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

interface UserSession {
  id: string;
  user_id?: string;
  start_time: number;
  last_activity: number;
  page_views: number;
  events: number;
  device_type: string;
  browser: string;
  os: string;
  country?: string;
  city?: string;
  ip_address?: string;
  user_agent: string;
  referrer?: string;
  is_active: boolean;
}

class InternalAnalytics {
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: number;
  private lastActivity: number;
  private pageViews: number = 0;
  private events: number = 0;
  private isInitialized: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivity = Date.now();
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize() {
    if (typeof window === "undefined") return;

    // Get user info from localStorage if available
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        this.userId = user.id;
      }
    } catch (error) {}

    // Get device info
    const deviceInfo = this.getDeviceInfo();

    // Start batch processing
    this.startBatchProcessing();

    // Mark as initialized BEFORE tracking (so trackPageView works)
    this.isInitialized = true;

    // Track initial page view
    this.trackPageView();

    // Track session start
    this.trackSessionStart();
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent;

    // Detect device type
    let deviceType = "desktop";
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = "mobile";
    } else if (/Tablet|iPad/.test(userAgent)) {
      deviceType = "tablet";
    }

    // Detect browser
    let browser = "unknown";
    if (userAgent.includes("Chrome")) browser = "chrome";
    else if (userAgent.includes("Firefox")) browser = "firefox";
    else if (userAgent.includes("Safari")) browser = "safari";
    else if (userAgent.includes("Edge")) browser = "edge";

    // Detect OS
    let os = "unknown";
    if (userAgent.includes("Windows")) os = "windows";
    else if (userAgent.includes("Mac")) os = "macos";
    else if (userAgent.includes("Linux")) os = "linux";
    else if (userAgent.includes("Android")) os = "android";
    else if (userAgent.includes("iOS")) os = "ios";

    return { deviceType, browser, os, userAgent };
  }

  private async sendToBackend(endpoint: string, data: any) {
    try {
      const response = await fetch(`/api/analytics/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
      } else {
      }
    } catch (error) {}
  }

  private startBatchProcessing() {
    // Flush events every 30 seconds
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Flush events when page is about to unload
    window.addEventListener("beforeunload", () => {
      this.flushEvents();
    });
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    // Convert timestamps to ISO strings for backend
    const eventsForBackend = eventsToSend.map((event) => ({
      ...event,
      timestamp: new Date(event.timestamp).toISOString(),
    }));

    try {
      await this.sendToBackend("events", { events: eventsForBackend });
    } catch (error) {
      // Re-add events to queue if sending failed
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  private trackSessionStart() {
    const deviceInfo = this.getDeviceInfo();
    const sessionData: UserSession = {
      id: this.sessionId,
      user_id: this.userId,
      start_time: this.sessionStartTime,
      last_activity: this.lastActivity,
      page_views: this.pageViews,
      events: this.events,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      user_agent: deviceInfo.userAgent,
      referrer: document.referrer || undefined,
      is_active: true,
    };

    // Convert timestamps to ISO strings for backend
    const backendData = {
      ...sessionData,
      start_time: new Date(sessionData.start_time).toISOString(),
      last_activity: new Date(sessionData.last_activity).toISOString(),
    };

    this.sendToBackend("session", backendData);
  }

  // Track page views
  trackPageView(url?: string, title?: string) {
    if (typeof window === "undefined") return;
    if (!this.isInitialized) {
      // If not initialized yet, initialize now
      this.initialize();
      return;
    }

    const pageUrl = url || window.location.href;
    const pageTitle = title || document.title;
    const deviceInfo = this.getDeviceInfo();

    const pageViewData: PageView = {
      session_id: this.sessionId,
      page_url: pageUrl,
      page_title: pageTitle,
      timestamp: Date.now(),
      user_id: this.userId,
      referrer: document.referrer || undefined,
      user_agent: deviceInfo.userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    };

    this.pageViews++;
    this.lastActivity = Date.now();

    // Convert timestamp to ISO string for backend
    const backendData = {
      ...pageViewData,
      timestamp: new Date(pageViewData.timestamp).toISOString(),
    };

    this.sendToBackend("pageview", backendData);
  }

  // Track custom events
  track(eventName: string, properties: Record<string, any> = {}) {
    if (typeof window === "undefined") return;
    if (!this.isInitialized) {
      // If not initialized yet, initialize now
      this.initialize();
      return;
    }

    const deviceInfo = this.getDeviceInfo();

    const event: AnalyticsEvent = {
      event_type: "custom",
      event_name: eventName,
      properties,
      user_id: this.userId,
      session_id: this.sessionId,
      page_url: window.location.href,
      page_title: document.title,
      timestamp: Date.now(),
      user_agent: deviceInfo.userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      referrer: document.referrer || undefined,
    };

    this.events++;
    this.lastActivity = Date.now();
    this.eventQueue.push(event);

    // Flush immediately if batch is full
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Track user interactions
  trackClick(
    element: string,
    location: string,
    properties: Record<string, any> = {}
  ) {
    this.track("click", {
      element,
      location,
      ...properties,
    });
  }

  trackFormSubmit(
    formName: string,
    success: boolean,
    properties: Record<string, any> = {}
  ) {
    this.track("form_submit", {
      form_name: formName,
      success,
      ...properties,
    });
  }

  trackFileUpload(
    fileType: string,
    fileSize: number,
    properties: Record<string, any> = {}
  ) {
    this.track("file_upload", {
      file_type: fileType,
      file_size: fileSize,
      ...properties,
    });
  }

  trackConversion(
    conversionType: string,
    value?: number,
    properties: Record<string, any> = {}
  ) {
    this.track("conversion", {
      conversion_type: conversionType,
      value,
      ...properties,
    });
  }

  trackError(
    error: string,
    context?: string,
    properties: Record<string, any> = {}
  ) {
    this.track("error", {
      error_message: error,
      context,
      ...properties,
    });
  }

  trackToolUsage(
    toolName: string,
    action: string,
    properties: Record<string, any> = {}
  ) {
    this.track("tool_usage", {
      tool_name: toolName,
      action,
      ...properties,
    });
  }

  trackApiCall(
    url: string,
    method: string,
    status: number,
    duration: number,
    properties: Record<string, any> = {}
  ) {
    this.track("api_call", {
      url,
      method,
      status,
      duration,
      ...properties,
    });
  }

  trackScroll(depth: number, properties: Record<string, any> = {}) {
    this.track("scroll", {
      scroll_depth: depth,
      ...properties,
    });
  }

  trackTimeOnPage(timeSpent: number, properties: Record<string, any> = {}) {
    this.track("time_on_page", {
      time_spent: timeSpent,
      ...properties,
    });
  }

  trackSearch(
    query: string,
    results?: number,
    properties: Record<string, any> = {}
  ) {
    this.track("search", {
      search_query: query,
      results_count: results,
      ...properties,
    });
  }

  // Update user ID when user logs in
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      pageViews: this.pageViews,
      events: this.events,
      sessionDuration: Date.now() - this.sessionStartTime,
      lastActivity: this.lastActivity,
    };
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// Create singleton instance
export const internalAnalytics = new InternalAnalytics();

// Auto-track page views on route changes
if (typeof window !== "undefined") {
  let lastUrl = window.location.href;

  // Track route changes
  const observer = new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      internalAnalytics.trackPageView(url);
    }
  });

  observer.observe(document, { subtree: true, childList: true });

  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener("scroll", () => {
    const scrollDepth = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollDepth > maxScroll) {
      maxScroll = scrollDepth;
      internalAnalytics.trackScroll(scrollDepth);
    }
  });

  // Track time on page
  const startTime = Date.now();
  window.addEventListener("beforeunload", () => {
    const timeSpent = Date.now() - startTime;
    internalAnalytics.trackTimeOnPage(timeSpent);
  });

  // Track errors
  window.addEventListener("error", (event) => {
    internalAnalytics.trackError(event.message, event.filename);
  });

  // Track unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    internalAnalytics.trackError(
      event.reason?.toString() || "Unhandled promise rejection"
    );
  });
}

export default internalAnalytics;

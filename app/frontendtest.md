# Frontend Testing Plan - Trevnoctilla

## Overview

This document outlines comprehensive testing requirements for all frontend pages, components, and functionality in the Trevnoctilla application.

**Total Files to Test: 100+**

- 34 Page Files (app/\*/page.tsx)
- 25+ Component Pages (components/pages/\*)
- 15+ PDF Tool Components
- 10+ Dashboard Components
- 5+ Admin Components
- 10+ UI Components
- 5+ Context Providers
- 4+ Custom Hooks

---

## 1. PUBLIC PAGES (9 Pages)

### 1.1 `app/page.tsx` - Landing Page

**Component:** `components/pages/LandingPage.tsx` (597 lines)
**Priority:** High
**Test Coverage:**

- [ ] Hero section renders correctly
- [ ] Feature cards display with animations
- [ ] Tool navigation links work
- [ ] CTA buttons function properly
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] SEO metadata is correct
- [ ] Scroll to top on page load
- [ ] Card order randomization works
- [ ] Navigation context integration
- [ ] All external links open correctly

**Test Files:**

- `tests/unit/frontend/pages/public/LandingPage.test.tsx`
- `tests/e2e/pages/public/landing-page-journey.spec.ts`

---

### 1.2 `app/tools/page.tsx` - Tools Listing Page

**Component:** `components/pages/ToolsPage.tsx` (424 lines)
**Priority:** High
**Test Coverage:**

- [ ] All tool cards render
- [ ] Tool categories display correctly
- [ ] Navigation to individual tools works
- [ ] Search/filter functionality (if exists)
- [ ] Responsive grid layout
- [ ] Icon rendering
- [ ] Gradient colors display
- [ ] Feature lists display
- [ ] Hover effects work

**Test Files:**

- `tests/unit/frontend/pages/public/ToolsPage.test.tsx`
- `tests/e2e/pages/public/tools-page-journey.spec.ts`

---

### 1.3 `app/privacy/page.tsx` - Privacy Policy

**Priority:** Low
**Test Coverage:**

- [ ] Privacy policy content renders
- [ ] Legal text displays correctly
- [ ] Navigation works
- [ ] Mobile responsiveness
- [ ] Links within content work

**Test Files:**

- `tests/unit/frontend/pages/public/PrivacyPage.test.tsx`

---

### 1.4 `app/terms/page.tsx` - Terms of Service

**Priority:** Low
**Test Coverage:**

- [ ] Terms content renders
- [ ] Legal text displays correctly
- [ ] Navigation works
- [ ] Mobile responsiveness

**Test Files:**

- `tests/unit/frontend/pages/public/TermsPage.test.tsx`

---

### 1.5 `app/cookies/page.tsx` - Cookie Policy

**Priority:** Low
**Test Coverage:**

- [ ] Cookie policy content renders
- [ ] Cookie consent integration works
- [ ] Navigation works
- [ ] Mobile responsiveness

**Test Files:**

- `tests/unit/frontend/pages/public/CookiesPage.test.tsx`

---

### 1.6 `app/api-docs/page.tsx` - API Documentation (1000+ lines)

**Priority:** Critical
**Test Coverage:**

- [ ] API documentation displays correctly
- [ ] Code examples render properly
- [ ] Tab navigation works (PDF, Video, Audio, Image, QR)
- [ ] Subscription form displays
- [ ] Copy to clipboard functionality
- [ ] API endpoint examples are correct
- [ ] Authentication examples work
- [ ] Rate limiting information displays
- [ ] Error handling examples
- [ ] Currency conversion (USD to ZAR)
- [ ] PayFast form integration
- [ ] Code syntax highlighting
- [ ] External links work
- [ ] Responsive design

**Test Files:**

- `tests/unit/frontend/pages/public/ApiDocsPage.test.tsx`
- `tests/integration/pages/public/ApiDocsPageSubscription.test.ts`
- `tests/e2e/pages/public/api-docs-journey.spec.ts`

---

### 1.7 `app/api/docs/page.tsx` - Alternative API Docs

**Priority:** Medium
**Test Coverage:**

- [ ] Alternative API docs display
- [ ] Documentation structure
- [ ] Navigation works

**Test Files:**

- `tests/unit/frontend/pages/public/ApiDocsAltPage.test.tsx`

---

### 1.8 `components/pages/disclaimers/page.tsx` - Disclaimers

**Priority:** Low
**Test Coverage:**

- [ ] Disclaimer content renders
- [ ] Legal disclaimers display
- [ ] Navigation works

**Test Files:**

- `tests/unit/frontend/pages/public/DisclaimersPage.test.tsx`

---

### 1.9 `app/not-found.tsx` - 404 Page

**Priority:** Medium
**Test Coverage:**

- [ ] 404 page renders correctly
- [ ] Navigation back works
- [ ] Search functionality (if exists)
- [ ] Home link works

**Test Files:**

- `tests/unit/frontend/pages/public/NotFoundPage.test.tsx`

---

## 2. AUTHENTICATION PAGES (3 Pages)

### 2.1 `app/auth/login/page.tsx` - Login Page

**Priority:** Critical
**Test Coverage:**

- [ ] Login form renders
- [ ] Email input validation
- [ ] Password input validation
- [ ] Form submission works
- [ ] Error handling displays
- [ ] Success redirect works
- [ ] "Remember me" functionality
- [ ] Forgot password link works
- [ ] Redirect parameter handling
- [ ] Loading states
- [ ] Authentication context integration
- [ ] Session creation

**Test Files:**

- `tests/unit/frontend/pages/auth/LoginPage.test.tsx`
- `tests/integration/pages/auth/LoginToDashboard.test.ts`
- `tests/e2e/pages/auth/complete-login-journey.spec.ts`

---

### 2.2 `app/auth/register/page.tsx` - Registration Page

**Priority:** Critical
**Test Coverage:**

- [ ] Registration form renders
- [ ] Email validation
- [ ] Password strength validation
- [ ] Password confirmation matching
- [ ] Terms acceptance checkbox
- [ ] Form submission works
- [ ] Error handling (duplicate email, etc.)
- [ ] Success redirect
- [ ] Loading states
- [ ] Input field validation messages

**Test Files:**

- `tests/unit/frontend/pages/auth/RegisterPage.test.tsx`
- `tests/integration/pages/auth/RegisterToLogin.test.ts`
- `tests/e2e/pages/auth/complete-registration-journey.spec.ts`

---

### 2.3 `app/auth/reset-password/page.tsx` - Password Reset

**Priority:** High
**Test Coverage:**

- [ ] Password reset form renders
- [ ] Email input validation
- [ ] Reset link sending
- [ ] Success message display
- [ ] Error message display
- [ ] Loading states
- [ ] Email validation

**Test Files:**

- `tests/unit/frontend/pages/auth/ResetPasswordPage.test.tsx`
- `tests/integration/pages/auth/ResetPasswordFlow.test.ts`
- `tests/e2e/pages/auth/complete-password-reset-journey.spec.ts`

---

## 3. DASHBOARD PAGES (2 Pages)

### 3.1 `app/dashboard/page.tsx` - Main Dashboard (1808 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] Dashboard layout renders
- [ ] Statistics display correctly
- [ ] Activity table displays
- [ ] Tool cards render
- [ ] Command palette opens/closes
- [ ] Command palette search works
- [ ] Tab navigation works
- [ ] Subscription upgrade detection from PayFast
- [ ] URL parameter parsing
- [ ] Session management
- [ ] User data refresh after upgrade
- [ ] BillingSection integration
- [ ] Circular charts render
- [ ] Stats bar displays
- [ ] API key management integration
- [ ] Activity log fetching
- [ ] Reset history display
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/pages/dashboard/DashboardPage.test.tsx`
- `tests/integration/pages/dashboard/DashboardToTools.test.ts`
- `tests/integration/pages/dashboard/DashboardToBilling.test.ts`
- `tests/integration/pages/dashboard/DashboardApiKeyCreation.test.ts`
- `tests/e2e/pages/dashboard/dashboard-complete-journey.spec.ts`

---

### 3.2 `app/dashboard/api-keys/page.tsx` - API Keys Management

**Priority:** High
**Test Coverage:**

- [ ] API key list displays
- [ ] Create API key functionality
- [ ] Delete API key functionality
- [ ] Copy API key to clipboard
- [ ] Key usage stats display
- [ ] Key expiration handling
- [ ] Key activation/deactivation
- [ ] Error handling
- [ ] Loading states

**Test Files:**

- `tests/unit/frontend/pages/dashboard/DashboardApiKeysPage.test.tsx`
- `tests/e2e/pages/dashboard/api-keys-management-journey.spec.ts`

---

## 4. ADMIN PAGES (5 Pages)

### 4.1 `app/admin/page.tsx` - Admin Dashboard (680 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] Admin dashboard renders
- [ ] System stats display
- [ ] User activity log
- [ ] System alerts display
- [ ] Navigation to admin sections
- [ ] Role-based access control
- [ ] Super admin verification
- [ ] Redirect if not authorized
- [ ] Real-time data updates
- [ ] Charts and graphs render
- [ ] Responsive design

**Test Files:**

- `tests/unit/frontend/pages/admin/AdminDashboardPage.test.tsx`
- `tests/e2e/pages/admin/admin-dashboard-journey.spec.ts`

---

### 4.2 `app/admin/users/page.tsx` - User Management (1000+ lines)

**Priority:** Critical
**Test Coverage:**

- [ ] User list displays
- [ ] User search functionality
- [ ] User filter options
- [ ] User details view
- [ ] User actions (activate/deactivate)
- [ ] User statistics display
- [ ] Monthly usage display
- [ ] User deletion
- [ ] User editing
- [ ] Pagination (if exists)
- [ ] Sorting functionality
- [ ] Role management
- [ ] Subscription tier display
- [ ] API key count display
- [ ] Last login display
- [ ] Error handling
- [ ] Loading states

**Test Files:**

- `tests/unit/frontend/pages/admin/AdminUsersPage.test.tsx`
- `tests/integration/pages/admin/AdminUserManagement.test.ts`
- `tests/e2e/pages/admin/user-management-journey.spec.ts`

---

### 4.3 `app/admin/analytics/page.tsx` - Analytics Dashboard

**Priority:** High
**Test Coverage:**

- [ ] Analytics dashboard renders
- [ ] Charts and graphs display
- [ ] Data visualization works
- [ ] Date range selection
- [ ] Export functionality
- [ ] Real-time updates
- [ ] Filter options
- [ ] Responsive design

**Test Files:**

- `tests/unit/frontend/pages/admin/AdminAnalyticsPage.test.tsx`
- `tests/integration/pages/admin/AdminAnalyticsView.test.ts`
- `tests/e2e/pages/admin/analytics-view-journey.spec.ts`

---

### 4.4 `app/admin/notifications/page.tsx` - Notifications Management

**Priority:** Medium
**Test Coverage:**

- [ ] Notification list displays
- [ ] Notification creation
- [ ] Notification management
- [ ] Notification types
- [ ] Notification filtering
- [ ] Mark as read/unread
- [ ] Delete notifications

**Test Files:**

- `tests/unit/frontend/pages/admin/AdminNotificationsPage.test.tsx`
- `tests/integration/pages/admin/AdminNotificationManagement.test.ts`
- `tests/e2e/pages/admin/notifications-management-journey.spec.ts`

---

### 4.5 `app/admin/api-keys/page.tsx` - Admin API Keys View

**Priority:** Medium
**Test Coverage:**

- [ ] Admin view of all API keys
- [ ] Key management
- [ ] Usage tracking
- [ ] Key statistics
- [ ] User association
- [ ] Filter by user

**Test Files:**

- `tests/unit/frontend/pages/admin/AdminApiKeysPage.test.tsx`

---

## 5. PAYMENT PAGES (5 Pages)

### 5.1 `app/payment/page.tsx` - Payment Page (380 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] Payment form displays
- [ ] Plan selection works
- [ ] Currency conversion (USD to ZAR)
- [ ] PayFast form generation
- [ ] Form submission
- [ ] Error handling
- [ ] Loading states
- [ ] Authentication check
- [ ] Redirect if not authenticated
- [ ] Plan configuration display
- [ ] Amount calculation
- [ ] Form validation

**Test Files:**

- `tests/unit/frontend/pages/payment/PaymentPage.test.tsx`
- `tests/integration/pages/payment/PaymentToSuccess.test.ts`
- `tests/e2e/pages/payment/payment-page-journey.spec.ts`

---

### 5.2 `app/payment/success/page.tsx` - Payment Success (805 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] Payment status verification
- [ ] Download URL retrieval (localStorage, URL params, recent downloads)
- [ ] File download functionality
- [ ] Email modal display
- [ ] Email modal interaction
- [ ] Email sending with file + invoice
- [ ] Subscription upgrade handling
- [ ] Return path navigation
- [ ] Error handling for missing data
- [ ] PayFast parameter parsing
- [ ] Session storage for duplicate prevention
- [ ] User data refresh
- [ ] Success message display
- [ ] Loading states
- [ ] Data URL handling
- [ ] HTTP URL handling

**Test Files:**

- `tests/unit/frontend/pages/payment/PaymentSuccessPage.test.tsx`
- `tests/integration/pages/payment/PaymentSubscriptionUpgrade.test.ts`
- `tests/e2e/pages/payment/payment-success-journey.spec.ts`
- `tests/e2e/pages/payment/payment-email-journey.spec.ts`

---

### 5.3 `app/payment/cancel/page.tsx` - Payment Cancel

**Priority:** High
**Test Coverage:**

- [ ] Cancel page displays
- [ ] Return path handling
- [ ] Debug info display
- [ ] Error messages
- [ ] PayFast parameter logging
- [ ] Navigation back

**Test Files:**

- `tests/unit/frontend/pages/payment/PaymentCancelPage.test.tsx`
- `tests/integration/pages/payment/PaymentToCancel.test.ts`
- `tests/e2e/pages/payment/payment-cancel-journey.spec.ts`

---

### 5.4 `app/payment/debug/page.tsx` - Payment Debug

**Priority:** Low
**Test Coverage:**

- [ ] Payment debug info displays
- [ ] Parameter logging
- [ ] Debug data display
- [ ] Error information

**Test Files:**

- `tests/unit/frontend/pages/payment/PaymentDebugPage.test.tsx`

---

### 5.5 `app/payment/test-notify/page.tsx` - Test Notification

**Priority:** Low
**Test Coverage:**

- [ ] Test notification page displays
- [ ] Webhook testing
- [ ] Notification display

**Test Files:**

- `tests/unit/frontend/pages/payment/PaymentTestNotifyPage.test.tsx`

---

## 6. AD/MONETIZATION PAGES (1 Page)

### 6.1 `app/ad-success/page.tsx` - Ad Success Page (153 lines)

**Priority:** Medium
**Test Coverage:**

- [ ] Ad opened detection
- [ ] Download URL retrieval from localStorage
- [ ] File download functionality
- [ ] Return detection (focus/blur events)
- [ ] Success message display
- [ ] File name display
- [ ] Download button works
- [ ] Close button works
- [ ] Visibility change detection

**Test Files:**

- `tests/unit/frontend/pages/monetization/AdSuccessPage.test.tsx`
- `tests/e2e/pages/monetization/ad-success-journey.spec.ts`

---

## 7. ENTERPRISE PAGE (1 Page)

### 7.1 `app/enterprise/page.tsx` - Enterprise Dashboard (508 lines)

**Priority:** High
**Test Coverage:**

- [ ] Enterprise dashboard renders
- [ ] Enterprise stats display
- [ ] API usage display
- [ ] Activity log
- [ ] API key management
- [ ] Tier verification
- [ ] Redirect if not enterprise tier
- [ ] Real-time updates
- [ ] Charts render
- [ ] Responsive design

**Test Files:**

- `tests/unit/frontend/pages/enterprise/EnterprisePage.test.tsx`
- `tests/e2e/pages/enterprise/enterprise-dashboard-journey.spec.ts`

---

## 8. TOOL PAGES (8 Pages)

### 8.1 `app/tools/pdf-tools/page.tsx` - PDF Tools Main Page

**Component:** `components/pages/tools/pdf-tools/PDFTools.tsx` (339 lines)
**Priority:** High
**Test Coverage:**

- [ ] PDF tools page renders
- [ ] Tool categories display
- [ ] Tool selection works
- [ ] Navigation to specific tools
- [ ] Tab switching
- [ ] Mobile/desktop tool switching
- [ ] File upload integration
- [ ] Processing modal display

**Test Files:**

- `tests/unit/frontend/pages/tools/PDFToolsPage.test.tsx`
- `tests/e2e/pages/tools/pdf-tools-complete-journey.spec.ts`

---

### 8.2 `app/tools/video-converter/page.tsx` - Video Converter

**Component:** `components/pages/VideoConverterPage.tsx` (50 lines)
**Priority:** High
**Test Coverage:**

- [ ] Video converter page renders
- [ ] File upload works
- [ ] Conversion settings display
- [ ] Progress display
- [ ] Result display
- [ ] Download functionality
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/pages/tools/VideoConverterPage.test.tsx`
- `tests/e2e/pages/tools/video-converter-journey.spec.ts`

---

### 8.3 `app/tools/audio-converter/page.tsx` - Audio Converter

**Component:** `components/pages/AudioConverterPage.tsx`
**Priority:** High
**Test Coverage:**

- [ ] Audio converter page renders
- [ ] File upload works
- [ ] Conversion settings display
- [ ] Progress display
- [ ] Result display
- [ ] Download functionality

**Test Files:**

- `tests/unit/frontend/pages/tools/AudioConverterPage.test.tsx`
- `tests/e2e/pages/tools/audio-converter-journey.spec.ts`

---

### 8.4 `app/tools/image-converter/page.tsx` - Image Converter

**Component:** `components/pages/ImageConverterPage.tsx`
**Priority:** High
**Test Coverage:**

- [ ] Image converter page renders
- [ ] File upload works
- [ ] Conversion settings display
- [ ] Progress display
- [ ] Result display
- [ ] Download functionality

**Test Files:**

- `tests/unit/frontend/pages/tools/ImageConverterPage.test.tsx`
- `tests/e2e/pages/tools/image-converter-journey.spec.ts`

---

### 8.5 `app/tools/qr-generator/page.tsx` - QR Generator

**Component:** `components/pages/QRGeneratorPage.tsx`
**Priority:** High
**Test Coverage:**

- [ ] QR generator page renders
- [ ] QR code generation works
- [ ] QR code download
- [ ] Settings customization
- [ ] Preview display
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/pages/tools/QRGeneratorPage.test.tsx`
- `tests/e2e/pages/tools/qr-generator-journey.spec.ts`

---

### 8.6 `app/test-monetization/page.tsx` - Monetization Test

**Priority:** Low
**Test Coverage:**

- [ ] Monetization testing page renders
- [ ] Ad viewing test
- [ ] Payment test
- [ ] Modal testing

**Test Files:**

- `tests/unit/frontend/pages/tools/TestMonetizationPage.test.tsx`

---

### 8.7 `app/test-payfast/page.tsx` - PayFast Test

**Priority:** Low
**Test Coverage:**

- [ ] PayFast testing page renders
- [ ] Payment form test
- [ ] Signature test

**Test Files:**

- `tests/unit/frontend/pages/tools/TestPayFastPage.test.tsx`

---

### 8.8 `app/test-payment-flow/page.tsx` - Payment Flow Test

**Priority:** Low
**Test Coverage:**

- [ ] Payment flow testing page renders
- [ ] End-to-end payment test
- [ ] Flow validation

**Test Files:**

- `tests/unit/frontend/pages/tools/TestPaymentFlowPage.test.tsx`

---

## 9. PDF TOOL COMPONENTS (18 Components)

### 9.1 `components/pages/tools/pdf-tools/PDFTools.tsx` - Main PDF Tools

**Priority:** High
**Test Coverage:**

- [ ] Tool categories render
- [ ] Tool selection works
- [ ] Tab navigation
- [ ] Mobile/desktop switching
- [ ] File upload integration
- [ ] Processing modal

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/PDFTools.test.tsx`

---

### 9.2 `components/pages/tools/pdf-tools/split-pdf/SplitPdfTool.tsx` - Split PDF

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Page selection
- [ ] Split functionality
- [ ] Download individual pages
- [ ] Download all pages
- [ ] Preview functionality
- [ ] Monetization modal integration

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/SplitPdfTool.test.tsx`
- `tests/e2e/tools/split-pdf.spec.ts`

---

### 9.3 `components/pages/tools/pdf-tools/split-pdf/MobileSplitPdfTool.tsx` - Mobile Split PDF

**Priority:** High
**Test Coverage:**

- [ ] Mobile file upload
- [ ] Mobile page selection
- [ ] Mobile split functionality
- [ ] Mobile download
- [ ] Touch interactions

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileSplitPdfTool.test.tsx`

---

### 9.4 `components/pages/tools/pdf-tools/merge-pdfs/MergePdfsTool.tsx` - Merge PDFs

**Priority:** High
**Test Coverage:**

- [ ] Multiple file upload
- [ ] File reordering
- [ ] Merge functionality
- [ ] Download merged PDF
- [ ] Preview functionality

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MergePdfsTool.test.tsx`
- `tests/e2e/tools/merge-pdfs.spec.ts`

---

### 9.5 `components/pages/tools/pdf-tools/merge-pdfs/MobileMergePdfsTool.tsx` - Mobile Merge PDFs

**Priority:** High
**Test Coverage:**

- [ ] Mobile multiple file upload
- [ ] Mobile file reordering
- [ ] Mobile merge functionality

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileMergePdfsTool.test.tsx`

---

### 9.6 `components/pages/tools/pdf-tools/extract-text/ExtractTextTool.tsx` - Extract Text

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Text extraction
- [ ] Text display
- [ ] Copy to clipboard
- [ ] Download as text file

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/ExtractTextTool.test.tsx`
- `tests/e2e/tools/extract-text.spec.ts`

---

### 9.7 `components/pages/tools/pdf-tools/extract-images/ExtractImagesTool.tsx` - Extract Images

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Image extraction
- [ ] Image gallery display
- [ ] Individual image download
- [ ] Download all images

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/ExtractImagesTool.test.tsx`
- `tests/e2e/tools/extract-images.spec.ts`

---

### 9.8 `components/pages/tools/pdf-tools/add-signature/AddSignatureTool.tsx` - Add Signature

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Signature canvas
- [ ] Signature drawing
- [ ] Signature positioning
- [ ] Save signature
- [ ] Download signed PDF

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/AddSignatureTool.test.tsx`
- `tests/e2e/tools/add-signature.spec.ts`

---

### 9.9 `components/pages/tools/pdf-tools/add-signature/MobileAddSignatureTool.tsx` - Mobile Add Signature

**Priority:** High
**Test Coverage:**

- [ ] Mobile file upload
- [ ] Mobile signature canvas
- [ ] Touch signature drawing
- [ ] Mobile signature positioning

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileAddSignatureTool.test.tsx`

---

### 9.10 `components/pages/tools/pdf-tools/add-watermark/AddWatermarkTool.tsx` - Add Watermark

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Watermark image upload
- [ ] Watermark positioning
- [ ] Watermark opacity
- [ ] Download watermarked PDF

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/AddWatermarkTool.test.tsx`
- `tests/e2e/tools/add-watermark.spec.ts`

---

### 9.11 `components/pages/tools/pdf-tools/add-image/MobileAddImageTool.tsx` - Add Image

**Priority:** High
**Test Coverage:**

- [ ] Mobile file upload
- [ ] Image upload
- [ ] Image positioning
- [ ] Download PDF with image

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileAddImageTool.test.tsx`

---

### 9.12 `components/pages/tools/pdf-tools/edit-pdf/EditPdfTool.tsx` - Edit PDF

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] PDF editor opens
- [ ] Text editing
- [ ] Image editing
- [ ] Save edits
- [ ] Download edited PDF

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/EditPdfTool.test.tsx`
- `tests/e2e/tools/edit-pdf.spec.ts`

---

### 9.13 `components/pages/tools/pdf-tools/edit-pdf/MobileEditPdfTool.tsx` - Mobile Edit PDF

**Priority:** High
**Test Coverage:**

- [ ] Mobile file upload
- [ ] Mobile PDF editor
- [ ] Touch interactions
- [ ] Mobile editing

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileEditPdfTool.test.tsx`

---

### 9.14 `components/pages/tools/pdf-tools/edit-fill-sign/EditFillSignTool.tsx` - Edit Fill Sign

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Form filling
- [ ] Signature addition
- [ ] Text editing
- [ ] Download completed PDF

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/EditFillSignTool.test.tsx`

---

### 9.15 `components/pages/tools/pdf-tools/edit-fill-sign/MobileEditFillSignTool.tsx` - Mobile Edit Fill Sign

**Priority:** High
**Test Coverage:**

- [ ] Mobile file upload
- [ ] Mobile form filling
- [ ] Mobile signature

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileEditFillSignTool.test.tsx`

---

### 9.16 `components/pages/tools/pdf-tools/html-to-pdf/HtmlToPdfTool.tsx` - HTML to PDF

**Priority:** High
**Test Coverage:**

- [ ] HTML file upload
- [ ] HTML to PDF conversion
- [ ] Download converted PDF
- [ ] Preview functionality
- [ ] Monetization modal integration

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/HtmlToPdfTool.test.tsx`
- `tests/e2e/tools/html-to-pdf.spec.ts`

---

### 9.17 `components/pages/tools/pdf-tools/html-to-pdf/MobileHtmlToPdfTool.tsx` - Mobile HTML to PDF

**Priority:** High
**Test Coverage:**

- [ ] Mobile HTML file upload
- [ ] Mobile conversion
- [ ] Mobile download

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobileHtmlToPdfTool.test.tsx`

---

### 9.18 `components/pages/tools/pdf-tools/pdf-to-html/PdfToHtmlTool.tsx` - PDF to HTML

**Priority:** High
**Test Coverage:**

- [ ] PDF file upload
- [ ] PDF to HTML conversion
- [ ] HTML preview
- [ ] Download HTML
- [ ] Monetization modal integration

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/PdfToHtmlTool.test.tsx`
- `tests/e2e/tools/pdf-to-html.spec.ts`

---

### 9.19 `components/pages/tools/pdf-tools/pdf-to-html/MobilePdfToHtmlTool.tsx` - Mobile PDF to HTML

**Priority:** High
**Test Coverage:**

- [ ] Mobile PDF upload
- [ ] Mobile conversion
- [ ] Mobile preview

**Test Files:**

- `tests/unit/frontend/components/pdf-tools/MobilePdfToHtmlTool.test.tsx`

---

## 10. DASHBOARD COMPONENTS (10 Components)

### 10.1 `components/dashboard/BillingSection.tsx` (453 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] Plan tier display logic
- [ ] Plan greying out for lower tiers
- [ ] Checkmark display logic
- [ ] Subscribe button visibility
- [ ] Billing history display
- [ ] Currency conversion (USD to ZAR)
- [ ] User tier detection
- [ ] Plan state calculation
- [ ] Current plan badge
- [ ] "Included in" message display

**Test Files:**

- `tests/unit/frontend/components/dashboard/BillingSection.test.tsx`

---

### 10.2 `components/dashboard/ActivityTable.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Activity log display
- [ ] Activity filtering
- [ ] Activity sorting
- [ ] Pagination
- [ ] Date formatting
- [ ] Status indicators

**Test Files:**

- `tests/unit/frontend/components/dashboard/ActivityTable.test.tsx`

---

### 10.3 `components/dashboard/StatsBar.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Statistics display
- [ ] Number formatting
- [ ] Progress bars
- [ ] Icon rendering

**Test Files:**

- `tests/unit/frontend/components/dashboard/StatsBar.test.tsx`

---

### 10.4 `components/dashboard/CircularChart.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Circular chart rendering
- [ ] Percentage calculation
- [ ] Color coding
- [ ] Animation

**Test Files:**

- `tests/unit/frontend/components/dashboard/CircularChart.test.tsx`

---

### 10.5 `components/dashboard/ApiKeysSection.tsx`

**Priority:** High
**Test Coverage:**

- [ ] API key list display
- [ ] Create API key
- [ ] Delete API key
- [ ] Copy API key
- [ ] Key usage display
- [ ] Key expiration handling

**Test Files:**

- `tests/unit/frontend/components/dashboard/ApiKeysSection.test.tsx`

---

### 10.6 `components/dashboard/ApiTester.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] API testing interface
- [ ] Request building
- [ ] Response display
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/components/dashboard/ApiTester.test.tsx`

---

### 10.7 `components/dashboard/ApiReferenceContent.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] API reference display
- [ ] Code examples
- [ ] Copy to clipboard
- [ ] Tab navigation

**Test Files:**

- `tests/unit/frontend/components/dashboard/ApiReferenceContent.test.tsx`

---

### 10.8 `components/dashboard/ResetHistoryTable.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Reset history display
- [ ] Date formatting
- [ ] Filtering
- [ ] Sorting

**Test Files:**

- `tests/unit/frontend/components/dashboard/ResetHistoryTable.test.tsx`

---

### 10.9 `components/dashboard/ToolCard.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Tool card rendering
- [ ] Icon display
- [ ] Navigation
- [ ] Hover effects

**Test Files:**

- `tests/unit/frontend/components/dashboard/ToolCard.test.tsx`

---

### 10.10 `components/dashboard/DashboardTabs.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Tab navigation
- [ ] Tab switching
- [ ] Active tab indication
- [ ] Content switching

**Test Files:**

- `tests/unit/frontend/components/dashboard/DashboardTabs.test.tsx`

---

### 10.11 `components/dashboard/DashboardSidebar.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Sidebar navigation
- [ ] Menu items
- [ ] Active state
- [ ] Collapse/expand

**Test Files:**

- `tests/unit/frontend/components/dashboard/DashboardSidebar.test.tsx`

---

### 10.12 `components/dashboard/AnalyticsDashboard.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Analytics dashboard
- [ ] Charts rendering
- [ ] Data visualization
- [ ] Date range selection

**Test Files:**

- `tests/unit/frontend/components/dashboard/AnalyticsDashboard.test.tsx`

---

## 11. UI COMPONENTS (10+ Components)

### 11.1 `components/ui/MonetizationModal.tsx` (450 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] Modal opens/closes
- [ ] Ad viewing detection
- [ ] Payment form display
- [ ] Download URL storage
- [ ] Focus/blur event handling
- [ ] Currency conversion
- [ ] Modal state management
- [ ] Visibility change detection
- [ ] Return detection

**Test Files:**

- `tests/unit/frontend/components/ui/MonetizationModal.test.tsx`

---

### 11.2 `components/ui/PayFastForm.tsx`

**Priority:** Critical
**Test Coverage:**

- [ ] PayFast form generation
- [ ] Signature calculation
- [ ] Form submission
- [ ] Hidden fields
- [ ] Form validation

**Test Files:**

- `tests/unit/frontend/components/ui/PayFastForm.test.tsx`

---

### 11.3 `components/ui/PDFFileUpload.tsx`

**Priority:** High
**Test Coverage:**

- [ ] File upload
- [ ] Drag and drop
- [ ] File validation
- [ ] Progress display
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/components/ui/PDFFileUpload.test.tsx`

---

### 11.4 `components/ui/PDFProcessingModal.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Processing modal display
- [ ] Progress indication
- [ ] Loading states
- [ ] Error display

**Test Files:**

- `tests/unit/frontend/components/ui/PDFProcessingModal.test.tsx`

---

### 11.5 `components/ui/AlertModal.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Alert modal display
- [ ] Success/error/warning types
- [ ] Close functionality
- [ ] Button actions

**Test Files:**

- `tests/unit/frontend/components/ui/AlertModal.test.tsx`

---

### 11.6 `components/ui/Button.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Button rendering
- [ ] Click handling
- [ ] Disabled state
- [ ] Loading state
- [ ] Variants

**Test Files:**

- `tests/unit/frontend/components/ui/Button.test.tsx`

---

### 11.7 `components/ui/signature-canvas.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Canvas rendering
- [ ] Drawing functionality
- [ ] Clear functionality
- [ ] Save functionality
- [ ] Touch support

**Test Files:**

- `tests/unit/frontend/components/ui/signature-canvas.test.tsx`

---

### 11.8 `components/ui/UploadProgressModal.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Progress modal display
- [ ] Progress percentage
- [ ] Upload status
- [ ] Cancel functionality

**Test Files:**

- `tests/unit/frontend/components/ui/UploadProgressModal.test.tsx`

---

### 11.9 `components/ui/PDFEditorLayout.tsx`

**Priority:** High
**Test Coverage:**

- [ ] PDF editor layout
- [ ] Toolbar display
- [ ] Canvas area
- [ ] Sidebar

**Test Files:**

- `tests/unit/frontend/components/ui/PDFEditorLayout.test.tsx`

---

### 11.10 `components/ui/MobilePDFEditorLayout.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Mobile PDF editor layout
- [ ] Touch interactions
- [ ] Mobile toolbar
- [ ] Responsive design

**Test Files:**

- `tests/unit/frontend/components/ui/MobilePDFEditorLayout.test.tsx`

---

## 12. LAYOUT COMPONENTS (3 Components)

### 12.1 `components/layout/UniversalHeader.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Header rendering
- [ ] Navigation links
- [ ] User menu
- [ ] Logo display
- [ ] Mobile menu
- [ ] Authentication state

**Test Files:**

- `tests/unit/frontend/components/layout/UniversalHeader.test.tsx`

---

### 12.2 `components/layout/Footer.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Footer rendering
- [ ] Footer links
- [ ] Social links
- [ ] Legal links
- [ ] Responsive design

**Test Files:**

- `tests/unit/frontend/components/layout/Footer.test.tsx`

---

### 12.3 `components/layout/CookieConsent.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Cookie consent display
- [ ] Accept/decline functionality
- [ ] LocalStorage persistence
- [ ] Modal display

**Test Files:**

- `tests/unit/frontend/components/layout/CookieConsent.test.tsx`

---

## 13. CONTEXT PROVIDERS (5 Providers)

### 13.1 `contexts/UserContext.tsx`

**Priority:** Critical
**Test Coverage:**

- [ ] User state management
- [ ] User data fetching
- [ ] User data updates
- [ ] Loading states
- [ ] Error handling
- [ ] Authentication state

**Test Files:**

- `tests/unit/frontend/contexts/UserContext.test.tsx`

---

### 13.2 `contexts/AlertProvider.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Alert state management
- [ ] Show alert functionality
- [ ] Hide alert functionality
- [ ] Alert types (success/error/warning)
- [ ] Auto-dismiss

**Test Files:**

- `tests/unit/frontend/contexts/AlertProvider.test.tsx`

---

### 13.3 `contexts/MonetizationProvider.tsx`

**Priority:** High
**Test Coverage:**

- [ ] Monetization state
- [ ] Modal management
- [ ] Payment tracking
- [ ] Ad tracking

**Test Files:**

- `tests/unit/frontend/contexts/MonetizationProvider.test.tsx`

---

### 13.4 `contexts/NavigationContext.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] Navigation state
- [ ] Navigate function
- [ ] Route tracking

**Test Files:**

- `tests/unit/frontend/contexts/NavigationContext.test.tsx`

---

### 13.5 `contexts/ViewContext.tsx`

**Priority:** Medium
**Test Coverage:**

- [ ] View state management
- [ ] View switching
- [ ] View persistence

**Test Files:**

- `tests/unit/frontend/contexts/ViewContext.test.tsx`

---

## 14. CUSTOM HOOKS (4 Hooks)

### 14.1 `hooks/useAuth.ts`

**Priority:** Critical
**Test Coverage:**

- [ ] Authentication state
- [ ] Login functionality
- [ ] Logout functionality
- [ ] Session management
- [ ] Token refresh

**Test Files:**

- `tests/unit/frontend/hooks/useAuth.test.ts`

---

### 14.2 `hooks/useMonetizationModal.ts`

**Priority:** High
**Test Coverage:**

- [ ] Modal state
- [ ] Open/close functionality
- [ ] Payment handling
- [ ] Ad handling

**Test Files:**

- `tests/unit/frontend/hooks/useMonetizationModal.test.ts`

---

### 14.3 `hooks/useAlertModal.ts`

**Priority:** High
**Test Coverage:**

- [ ] Alert state
- [ ] Show alert
- [ ] Hide alert
- [ ] Alert types

**Test Files:**

- `tests/unit/frontend/hooks/useAlertModal.test.ts`

---

### 14.4 `hooks/useDraggableCanvas.ts`

**Priority:** Medium
**Test Coverage:**

- [ ] Canvas dragging
- [ ] Position tracking
- [ ] Touch support
- [ ] Mouse support

**Test Files:**

- `tests/unit/frontend/hooks/useDraggableCanvas.test.ts`

---

## 15. LIBRARY/UTILITY FILES

### 15.1 `lib/auth.ts` (134 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] NextAuth configuration
- [ ] Credentials provider
- [ ] JWT token handling
- [ ] Session callbacks
- [ ] User data mapping
- [ ] API base URL logic

**Test Files:**

- `tests/unit/frontend/lib/auth.test.ts`

---

### 15.2 `lib/pending-payments.ts` (78 lines)

**Priority:** High
**Test Coverage:**

- [ ] Pending payment storage
- [ ] Payment retrieval
- [ ] Payment cleanup
- [ ] Old payment cleanup
- [ ] Email-based lookup

**Test Files:**

- `tests/unit/frontend/lib/pending-payments.test.ts`

---

### 15.3 `lib/currency.ts`

**Priority:** Medium
**Test Coverage:**

- [ ] USD to ZAR conversion
- [ ] Currency formatting
- [ ] Rate fetching
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/lib/currency.test.ts`

---

### 15.4 `lib/apiEndpoints.ts`

**Priority:** Medium
**Test Coverage:**

- [ ] API endpoint configuration
- [ ] Endpoint URL generation
- [ ] Tool categories

**Test Files:**

- `tests/unit/frontend/lib/apiEndpoints.test.ts`

---

### 15.5 `lib/config.ts`

**Priority:** High
**Test Coverage:**

- [ ] API URL configuration
- [ ] Auth headers generation
- [ ] Environment variable handling

**Test Files:**

- `tests/unit/frontend/lib/config.test.ts`

---

## 16. API ROUTES (Next.js API Routes)

### 16.1 `app/api/auth/[...nextauth]/route.ts`

**Priority:** Critical
**Test Coverage:**

- [ ] NextAuth handler
- [ ] GET request handling
- [ ] POST request handling
- [ ] Session management

**Test Files:**

- `tests/unit/frontend/api/auth/nextauth-route.test.ts`

---

### 16.2 `app/api/payments/payfast/initiate/route.ts` (499 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] PayFast signature generation
- [ ] Payment data construction
- [ ] Subscription vs one-time payment
- [ ] Return URL construction
- [ ] Custom parameters
- [ ] Session validation
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/api/payments/payfast-initiate-route.test.ts`
- `tests/integration/api/payment/payfast-integration.test.ts`

---

### 16.3 `app/api/payment/send-file-invoice/route.ts` (280 lines)

**Priority:** Critical
**Test Coverage:**

- [ ] File download from data URLs
- [ ] File download from HTTP URLs
- [ ] Invoice PDF generation
- [ ] Email HTML template retrieval
- [ ] Email sending with attachments
- [ ] Error handling
- [ ] Fallback HTML

**Test Files:**

- `tests/unit/frontend/api/payment/send-file-invoice-route.test.ts`
- `tests/integration/api/payment/file-invoice-email.test.ts`

---

### 16.4 `app/api/email/send/route.ts` (127 lines)

**Priority:** High
**Test Coverage:**

- [ ] Resend API integration
- [ ] Attachment handling (base64 to Buffer)
- [ ] Email formatting
- [ ] Error handling
- [ ] Success response

**Test Files:**

- `tests/unit/frontend/api/email/send-route.test.ts`

---

### 16.5 `app/api/payments/check-pending/route.ts`

**Priority:** High
**Test Coverage:**

- [ ] Pending payment check
- [ ] Payment retrieval
- [ ] Subscription upgrade trigger
- [ ] Error handling

**Test Files:**

- `tests/unit/frontend/api/payments/check-pending-route.test.ts`

---

### 16.6 `app/api/analytics/events/route.ts`

**Priority:** Medium
**Test Coverage:**

- [ ] Event tracking
- [ ] Event data validation
- [ ] Event storage

**Test Files:**

- `tests/unit/frontend/api/analytics/events-route.test.ts`

---

### 16.7 `app/api/analytics/pageview/route.ts`

**Priority:** Medium
**Test Coverage:**

- [ ] Pageview tracking
- [ ] Pageview data validation
- [ ] Pageview storage

**Test Files:**

- `tests/unit/frontend/api/analytics/pageview-route.test.ts`

---

### 16.8 `app/api/analytics/session/route.ts`

**Priority:** Medium
**Test Coverage:**

- [ ] Session tracking
- [ ] Session data validation
- [ ] Session storage

**Test Files:**

- `tests/unit/frontend/api/analytics/session-route.test.ts`

---

## 17. MIDDLEWARE

### 17.1 `middleware.ts`

**Priority:** Critical
**Test Coverage:**

- [ ] Authentication middleware
- [ ] Public route handling
- [ ] Protected route handling
- [ ] Token validation
- [ ] Redirect logic

**Test Files:**

- `tests/unit/frontend/middleware.test.ts`

---

## 18. TESTING PRIORITY SUMMARY

### Phase 1: Critical (Week 1)

1. `app/dashboard/page.tsx` (1808 lines)
2. `app/payment/success/page.tsx` (805 lines)
3. `app/api/payments/payfast/initiate/route.ts` (499 lines)
4. `app/payment/page.tsx` (380 lines)
5. `app/api/payment/send-file-invoice/route.ts` (280 lines)
6. `components/dashboard/BillingSection.tsx` (453 lines)
7. `components/ui/MonetizationModal.tsx` (450 lines)
8. `lib/auth.ts` (134 lines)
9. `middleware.ts`
10. All authentication pages

### Phase 2: High Priority (Week 2)

11. `app/admin/users/page.tsx` (1000+ lines)
12. `app/api-docs/page.tsx` (1000+ lines)
13. `app/admin/page.tsx` (680 lines)
14. `app/enterprise/page.tsx` (508 lines)
15. All PDF tool components
16. All dashboard components
17. All UI components
18. All context providers

### Phase 3: Medium Priority (Week 3)

19. All tool pages
20. All admin sub-pages
21. All hooks
22. All library utilities
23. All API routes

### Phase 4: Lower Priority (Week 4)

24. Legal pages
25. Test pages
26. Static content pages
27. Layout components

---

## 19. TEST STATISTICS

**Total Files to Test: 100+**

- 34 Page Files
- 25+ Component Pages
- 18 PDF Tool Components
- 12 Dashboard Components
- 5 Admin Components
- 10+ UI Components
- 5 Context Providers
- 4 Custom Hooks
- 8+ API Routes
- 5+ Library Files
- 1 Middleware

**Estimated Test Count:**

- Unit Tests: 150+
- Integration Tests: 50+
- E2E Tests: 40+
- **Total: 240+ Tests**

---

## 20. TESTING TOOLS & SETUP

### Frontend Testing Stack

- **Jest/Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/user-event** - User interaction simulation

### Test Configuration Files Needed

- `jest.config.js` or `vitest.config.ts`
- `playwright.config.ts`
- `setupTests.ts` - Test setup file
- `.testutils.tsx` - Testing utilities

---

## 21. TESTING CHECKLIST

### For Each Page/Component:

- [ ] Renders without errors
- [ ] Displays correct content
- [ ] Handles user interactions
- [ ] Manages state correctly
- [ ] Handles errors gracefully
- [ ] Shows loading states
- [ ] Responsive design works
- [ ] Accessibility (a11y) compliance
- [ ] SEO metadata (for pages)
- [ ] Integration with APIs
- [ ] Integration with contexts
- [ ] Edge cases handled

---

## 22. NOTES

- All test files should follow naming convention: `*.test.tsx` or `*.spec.ts`
- Use TypeScript for all test files
- Mock external dependencies (PayFast, Resend, etc.)
- Use test fixtures for sample files
- Test both mobile and desktop views
- Test error scenarios
- Test loading states
- Test edge cases (empty data, null values, etc.)

---

**Last Updated:** [Current Date]
**Total Pages:** 34
**Total Components:** 60+
**Total Test Files Needed:** 240+

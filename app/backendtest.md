# Backend Testing Plan - Trevnoctilla

## Overview

This document outlines comprehensive testing requirements for all backend files, routes, services, and functionality in the Trevnoctilla Flask application.

**Total Files to Test: 50+**

- 1 Main Application File (app.py - 4964 lines)
- 4 API Blueprints (v1, admin, client, payment)
- 1 Auth Blueprint
- 1 Models File (models.py - 277 lines)
- 5 Service Files (email, notification, webhooks, rate_limiter, monitoring)
- 1 Database File (database.py - 136 lines)
- 1 Auth File (auth.py - 209 lines)
- 1 Celery App File
- 1 Tasks File
- 1 API Auth File (api_auth.py - 214 lines)
- 30+ Main App Routes
- 12 API v1 Routes
- 17 Admin Routes
- 8 Client Routes
- 3 Payment Routes
- 8 Auth Routes

---

## 1. MAIN APPLICATION FILE

### 1.1 `app.py` - Main Flask Application (4964 lines)

**Priority:** Critical
**Test Coverage:**

#### Core Routes:

- [ ] `GET /health` - Health check endpoint
- [ ] `POST /api/upload` - File upload endpoint
- [ ] `GET /test-ffmpeg` - FFmpeg test endpoint
- [ ] `POST /cleanup-file` - File cleanup endpoint
- [ ] `POST /cleanup-session` - Session cleanup endpoint
- [ ] `POST /cleanup-all` - Cleanup all files endpoint
- [ ] `GET, POST /` - Index route

#### PDF Processing Routes:

- [ ] `POST /get_page_count` - Get PDF page count
- [ ] `POST /pdf_preview` - PDF preview generation
- [ ] `GET /api/pdf_info/<filename>` - Get PDF information
- [ ] `GET /api/pdf_thumbnail/<filename>/<int:page_num>` - Get PDF thumbnail
- [ ] `POST /split_pdf` - Split PDF into pages
- [ ] `GET /download_split/<path:filename>` - Download split page
- [ ] `GET /view_split/<path:filename>` - View split page
- [ ] `GET /convert/<filename>` - Convert PDF to images
- [ ] `GET /editor/<filename>` - Convert PDF for editor
- [ ] `GET /convert_signature/<filename>` - Convert PDF for signature
- [ ] `POST /save_edits/<filename>` - Save PDF edits
- [ ] `POST /save_html/<filename>` - Save HTML from PDF
- [ ] `POST /cleanup_session/<session_id>` - Cleanup session files
- [ ] `GET /view_html/<html_filename>` - View HTML file
- [ ] `GET /download_pdf/<html_filename>` - Download PDF from HTML

#### PDF Extraction Routes:

- [ ] `POST /extract_text` - Extract text from PDF
- [ ] `POST /extract_images` - Extract images from PDF
- [ ] `POST /merge_pdfs` - Merge multiple PDFs
- [ ] `GET /download_merged/<merged_filename>` - Download merged PDF
- [ ] `GET /download_split/<split_folder>/<split_filename>` - Download split PDF

#### PDF Modification Routes:

- [ ] `POST /add_signature` - Add signature to PDF
- [ ] `POST /add_watermark` - Add watermark to PDF
- [ ] `GET /download_watermarked/<watermarked_filename>` - Download watermarked PDF
- [ ] `GET /download_signed/<signed_filename>` - Download signed PDF

#### Conversion Routes:

- [ ] `POST /convert_pdf_to_word` - Convert PDF to Word
- [ ] `POST /convert_word_to_pdf` - Convert Word to PDF
- [ ] `POST /convert_html_to_pdf` - Convert HTML to PDF
- [ ] `POST /convert_image_to_pdf` - Convert image to PDF
- [ ] `POST /convert_pdf_to_images` - Convert PDF to images
- [ ] `POST /convert_pdf_to_html` - Convert PDF to HTML
- [ ] `POST /compress_pdf` - Compress PDF
- [ ] `GET /download_compressed/<filename>` - Download compressed PDF
- [ ] `POST /save_edit_fill_sign/<filename>` - Save edit/fill/sign PDF
- [ ] `GET /download_edited/<filename>` - Download edited PDF
- [ ] `GET /download_converted/<filename>` - Download converted file
- [ ] `GET /preview_html/<filename>` - Preview HTML
- [ ] `GET /download_images/<filename>` - Download images

#### Video/Audio/Image Routes:

- [ ] `POST /convert-video` - Convert video format
- [ ] `GET /video-progress/<filename>` - Get video conversion progress
- [ ] `GET /download-video/<filename>` - Download converted video
- [ ] `POST /convert-audio` - Convert audio format
- [ ] `GET /download_converted_audio/<filename>` - Download converted audio
- [ ] `POST /convert-image` - Convert image format
- [ ] `GET /download/<filename>` - Download converted image

#### Helper Functions:

- [ ] `cleanup_old_files()` - Cleanup old files function
- [ ] `cleanup_specific_file(file_path)` - Cleanup specific file
- [ ] `cleanup_session_files(session_id)` - Cleanup session files
- [ ] `background_cleanup()` - Background cleanup thread
- [ ] `convert_html_to_pdf_playwright()` - HTML to PDF via Playwright
- [ ] `convert_html_to_pdf_xhtml2pdf()` - HTML to PDF via xhtml2pdf
- [ ] `convert_html_to_pdf_weasyprint()` - HTML to PDF via WeasyPrint
- [ ] `convert_html_to_pdf_pymupdf()` - HTML to PDF via PyMuPDF
- [ ] `convert_with_pymupdf()` - PDF to HTML via PyMuPDF
- [ ] `convert_with_pdf2htmlex()` - PDF to HTML via pdf2htmlex
- [ ] `convert_video_background()` - Background video conversion
- [ ] `convert_audio_file()` - Audio conversion function
- [ ] `allowed_audio_file()` - Audio file validation

**Test Files:**

- `tests/unit/backend/app/test_health_check.test.py`
- `tests/unit/backend/app/test_file_upload.test.py`
- `tests/unit/backend/app/test_pdf_processing.test.py`
- `tests/unit/backend/app/test_pdf_extraction.test.py`
- `tests/unit/backend/app/test_pdf_modification.test.py`
- `tests/unit/backend/app/test_conversion.test.py`
- `tests/unit/backend/app/test_video_audio_image.test.py`
- `tests/integration/backend/app/test_pdf_workflow.test.py`
- `tests/integration/backend/app/test_conversion_workflow.test.py`
- `tests/e2e/backend/app/test_complete_pdf_journey.test.py`

---

## 2. API V1 ROUTES

### 2.1 `api/v1/routes.py` - API v1 Blueprint

**Priority:** Critical
**Test Coverage:**

#### Video Conversion:

- [ ] `POST /api/v1/convert/video` - Convert video file
  - [ ] File upload validation
  - [ ] Format conversion (mp4, avi, mov, etc.)
  - [ ] Quality settings (95, 85, 75, 60, 40)
  - [ ] Compression settings (ultrafast, fast, medium, slow, veryslow)
  - [ ] Async mode handling
  - [ ] Large file handling (>50MB)
  - [ ] Job creation and tracking
  - [ ] Progress tracking
  - [ ] Error handling
  - [ ] Rate limiting
  - [ ] API key authentication

#### Audio Conversion:

- [ ] `POST /api/v1/convert/audio` - Convert audio file
  - [ ] File upload validation
  - [ ] Format conversion (mp3, wav, aac, etc.)
  - [ ] Bitrate settings
  - [ ] Sample rate settings
  - [ ] Channel settings (mono, stereo)
  - [ ] Quality settings
  - [ ] Async mode handling
  - [ ] Job creation and tracking
  - [ ] Error handling

#### PDF Text Extraction:

- [ ] `POST /api/v1/convert/pdf-extract-text` - Extract text from PDF
  - [ ] PDF file upload
  - [ ] Text extraction accuracy
  - [ ] Multi-page PDF handling
  - [ ] Error handling for corrupted PDFs
  - [ ] Response formatting

#### QR Code Generation:

- [ ] `POST /api/v1/convert/qr-generate` - Generate QR code
  - [ ] Text/URL input validation
  - [ ] Size customization
  - [ ] Error correction levels
  - [ ] Format output (PNG, SVG, etc.)
  - [ ] Color customization

#### Image Conversion:

- [ ] `POST /api/v1/convert/image` - Convert image format
  - [ ] File upload validation
  - [ ] Format conversion (jpg, png, webp, etc.)
  - [ ] Quality settings
  - [ ] Resize functionality
  - [ ] Aspect ratio maintenance
  - [ ] Compression settings

#### PDF Merge:

- [ ] `POST /api/v1/convert/pdf-merge` - Merge PDFs
  - [ ] Multiple file upload
  - [ ] File order preservation
  - [ ] Large file handling
  - [ ] Error handling for incompatible PDFs
  - [ ] Job creation for async processing

#### PDF Split:

- [ ] `POST /api/v1/convert/pdf-split` - Split PDF
  - [ ] PDF file upload
  - [ ] Page range selection
  - [ ] Individual page extraction
  - [ ] Multiple page ranges
  - [ ] Output format handling

#### PDF Watermark:

- [ ] `POST /api/v1/convert/pdf-watermark` - Add watermark to PDF
  - [ ] PDF file upload
  - [ ] Watermark image upload
  - [ ] Position settings
  - [ ] Opacity settings
  - [ ] Size settings

#### Job Management:

- [ ] `GET /api/v1/jobs/<job_id>/status` - Get job status

  - [ ] Job ID validation
  - [ ] Status retrieval (pending, processing, completed, failed)
  - [ ] Progress information
  - [ ] Error message retrieval
  - [ ] Authorization check

- [ ] `GET /api/v1/jobs/<job_id>/download` - Download job result
  - [ ] Job ID validation
  - [ ] File existence check
  - [ ] Authorization check
  - [ ] File download
  - [ ] Error handling

#### Health Check:

- [ ] `GET /api/v1/health` - API health check
  - [ ] Service status
  - [ ] Database connectivity
  - [ ] Response time

**Test Files:**

- `tests/unit/backend/api/v1/test_video_conversion.test.py`
- `tests/unit/backend/api/v1/test_audio_conversion.test.py`
- `tests/unit/backend/api/v1/test_pdf_extraction.test.py`
- `tests/unit/backend/api/v1/test_qr_generation.test.py`
- `tests/unit/backend/api/v1/test_image_conversion.test.py`
- `tests/unit/backend/api/v1/test_pdf_merge.test.py`
- `tests/unit/backend/api/v1/test_pdf_split.test.py`
- `tests/unit/backend/api/v1/test_pdf_watermark.test.py`
- `tests/unit/backend/api/v1/test_job_management.test.py`
- `tests/integration/backend/api/v1/test_api_workflow.test.py`
- `tests/e2e/backend/api/v1/test_complete_api_journey.test.py`

---

## 3. ADMIN API ROUTES

### 3.1 `api/admin/routes.py` - Admin API Blueprint

**Priority:** Critical
**Test Coverage:**

#### User Management:

- [ ] `GET /api/admin/users` - List all users

  - [ ] Pagination (page, per_page)
  - [ ] Search functionality (by email)
  - [ ] Filter by role (user, admin, super_admin)
  - [ ] Filter by is_active status
  - [ ] Filter by subscription_tier
  - [ ] Super admin vs regular admin permissions
  - [ ] Sorting (by creation date)
  - [ ] Response formatting

- [ ] `GET /api/admin/users/<int:user_id>` - Get user details

  - [ ] User ID validation
  - [ ] User existence check
  - [ ] Full user information retrieval
  - [ ] API keys count
  - [ ] Usage statistics
  - [ ] Authorization check

- [ ] `POST /api/admin/users/<int:user_id>/api-keys` - Create API key for user

  - [ ] User ID validation
  - [ ] API key generation
  - [ ] Rate limit setting
  - [ ] Authorization check

- [ ] `DELETE /api/admin/api-keys/<int:key_id>` - Delete API key

  - [ ] Key ID validation
  - [ ] Key existence check
  - [ ] Authorization check
  - [ ] Soft delete (is_active = False)

- [ ] `PUT /api/admin/api-keys/<int:key_id>` - Update API key

  - [ ] Key ID validation
  - [ ] Name update
  - [ ] Rate limit update
  - [ ] Authorization check

- [ ] `GET /api/admin/users/by-tier` - Get users by tier

  - [ ] Tier filtering
  - [ ] Count per tier
  - [ ] Statistics per tier

- [ ] `POST /api/admin/users/<int:user_id>/reset-calls` - Reset user API calls

  - [ ] User ID validation
  - [ ] Monthly used reset to 0
  - [ ] Reset history creation
  - [ ] Authorization check
  - [ ] Reason logging

- [ ] `POST /api/admin/users/<int:user_id>/toggle-status` - Toggle user status

  - [ ] User ID validation
  - [ ] is_active toggle
  - [ ] Authorization check
  - [ ] Status change logging

- [ ] `GET /api/admin/users/<int:user_id>/reset-history` - Get reset history
  - [ ] User ID validation
  - [ ] Reset history retrieval
  - [ ] Pagination
  - [ ] Sorting

#### Usage Statistics:

- [ ] `GET /api/admin/usage/stats` - Get usage statistics
  - [ ] Total API calls
  - [ ] Calls by endpoint
  - [ ] Calls by user
  - [ ] Calls by date range
  - [ ] Error rate
  - [ ] Average processing time
  - [ ] Top users
  - [ ] Date range filtering

#### Job Management:

- [ ] `GET /api/admin/jobs` - List all jobs
  - [ ] Pagination
  - [ ] Filter by status
  - [ ] Filter by user
  - [ ] Filter by endpoint
  - [ ] Sorting
  - [ ] Job details retrieval

#### System Health:

- [ ] `GET /api/admin/system/health` - Get system health
  - [ ] CPU usage
  - [ ] Memory usage
  - [ ] Disk usage
  - [ ] Database health
  - [ ] Error rate
  - [ ] Active jobs count
  - [ ] Response time

#### Notifications:

- [ ] `GET /api/admin/notifications` - List notifications

  - [ ] Pagination
  - [ ] Filter by type
  - [ ] Filter by category
  - [ ] Filter by read/unread
  - [ ] Sorting

- [ ] `POST /api/admin/notifications/<int:notification_id>/read` - Mark notification as read

  - [ ] Notification ID validation
  - [ ] Read status update
  - [ ] Read timestamp
  - [ ] Read by user tracking

- [ ] `DELETE /api/admin/notifications/<int:notification_id>` - Delete notification

  - [ ] Notification ID validation
  - [ ] Authorization check
  - [ ] Soft delete

- [ ] `POST /api/admin/notifications/read-all` - Mark all as read

  - [ ] Bulk update
  - [ ] Authorization check

- [ ] `GET /api/admin/notifications/stats` - Get notification statistics
  - [ ] Total notifications
  - [ ] Unread count
  - [ ] By type
  - [ ] By category

**Test Files:**

- `tests/unit/backend/api/admin/test_user_management.test.py`
- `tests/unit/backend/api/admin/test_api_key_management.test.py`
- `tests/unit/backend/api/admin/test_usage_stats.test.py`
- `tests/unit/backend/api/admin/test_job_management.test.py`
- `tests/unit/backend/api/admin/test_system_health.test.py`
- `tests/unit/backend/api/admin/test_notifications.test.py`
- `tests/integration/backend/api/admin/test_admin_workflow.test.py`
- `tests/e2e/backend/api/admin/test_admin_complete_journey.test.py`

---

## 4. CLIENT API ROUTES

### 4.1 `api/client/routes.py` - Client API Blueprint

**Priority:** High
**Test Coverage:**

#### API Key Management:

- [ ] `GET /api/client/keys` - Get user's API keys

  - [ ] JWT authentication
  - [ ] User's keys retrieval
  - [ ] Active keys only
  - [ ] Full key value return
  - [ ] Sorting by creation date

- [ ] `POST /api/client/keys` - Create API key

  - [ ] JWT authentication
  - [ ] Key name validation
  - [ ] Rate limit setting
  - [ ] Maximum keys limit (5 per user)
  - [ ] Key generation
  - [ ] Full key value return

- [ ] `PUT /api/client/keys/<int:key_id>` - Update API key

  - [ ] JWT authentication
  - [ ] Key ID validation
  - [ ] Ownership verification
  - [ ] Name update
  - [ ] Rate limit update
  - [ ] Expiration date update

- [ ] `DELETE /api/client/keys/<int:key_id>` - Delete API key
  - [ ] JWT authentication
  - [ ] Key ID validation
  - [ ] Ownership verification
  - [ ] Soft delete (is_active = False)

#### Usage Tracking:

- [ ] `GET /api/client/usage` - Get user's usage statistics

  - [ ] JWT authentication
  - [ ] Total API calls
  - [ ] Calls by endpoint
  - [ ] Calls by date range
  - [ ] Monthly usage
  - [ ] Remaining calls
  - [ ] Usage limits
  - [ ] Date range filtering

- [ ] `GET /api/client/reset-history` - Get reset history
  - [ ] JWT authentication
  - [ ] User's reset history
  - [ ] Pagination
  - [ ] Sorting

#### Job Management:

- [ ] `GET /api/client/jobs` - Get user's jobs
  - [ ] JWT authentication
  - [ ] User's jobs retrieval
  - [ ] Filter by status
  - [ ] Filter by endpoint
  - [ ] Pagination
  - [ ] Sorting

#### Profile Management:

- [ ] `GET /api/client/profile` - Get user profile

  - [ ] JWT authentication
  - [ ] User information retrieval
  - [ ] Subscription tier
  - [ ] Usage statistics

- [ ] `PUT /api/client/profile` - Update user profile
  - [ ] JWT authentication
  - [ ] Email update (if allowed)
  - [ ] Profile information update
  - [ ] Validation

**Test Files:**

- `tests/unit/backend/api/client/test_api_key_management.test.py`
- `tests/unit/backend/api/client/test_usage_tracking.test.py`
- `tests/unit/backend/api/client/test_job_management.test.py`
- `tests/unit/backend/api/client/test_profile_management.test.py`
- `tests/integration/backend/api/client/test_client_workflow.test.py`
- `tests/e2e/backend/api/client/test_client_complete_journey.test.py`

---

## 5. PAYMENT API ROUTES

### 5.1 `api/payment/routes.py` - Payment API Blueprint

**Priority:** Critical
**Test Coverage:**

#### Subscription Upgrade:

- [ ] `POST /api/payment/upgrade-subscription` - Upgrade user subscription
  - [ ] User ID validation
  - [ ] User email validation
  - [ ] Plan ID validation (testing, production, enterprise)
  - [ ] Plan name validation
  - [ ] Amount validation
  - [ ] Payment ID validation
  - [ ] Old tier retrieval
  - [ ] New tier assignment
  - [ ] Monthly call limit update
  - [ ] Database update
  - [ ] Upgrade email sending
  - [ ] Notification creation
  - [ ] Error handling
  - [ ] Duplicate payment prevention

#### Invoice PDF Generation:

- [ ] `POST /api/payment/generate-invoice-pdf` - Generate invoice PDF
  - [ ] Tier validation
  - [ ] Amount validation
  - [ ] User email validation
  - [ ] Payment ID validation
  - [ ] Payment date handling
  - [ ] Item description handling
  - [ ] PDF generation
  - [ ] Base64 encoding
  - [ ] Error handling

#### File Invoice Email HTML:

- [ ] `POST /api/payment/get-file-invoice-email-html` - Get file invoice email HTML
  - [ ] Item name validation
  - [ ] Amount validation
  - [ ] Payment ID handling
  - [ ] Template rendering
  - [ ] HTML content generation
  - [ ] Error handling

**Test Files:**

- `tests/unit/backend/api/payment/test_subscription_upgrade.test.py`
- `tests/unit/backend/api/payment/test_invoice_pdf.test.py`
- `tests/unit/backend/api/payment/test_file_invoice_email.test.py`
- `tests/integration/backend/api/payment/test_payment_workflow.test.py`
- `tests/e2e/backend/api/payment/test_payment_complete_journey.test.py`

---

## 6. AUTH ROUTES

### 6.1 `auth_routes.py` - Authentication Blueprint

**Priority:** Critical
**Test Coverage:**

#### Registration:

- [ ] `POST /auth/register` - Register new user
  - [ ] Email validation
  - [ ] Password validation
  - [ ] Duplicate email check
  - [ ] Deactivated user reactivation
  - [ ] User creation
  - [ ] Welcome email sending (async)
  - [ ] Error handling
  - [ ] Response formatting

#### Login:

- [ ] `POST /auth/login` - Login user
  - [ ] Email validation
  - [ ] Password validation
  - [ ] User existence check
  - [ ] Active status check
  - [ ] Password verification
  - [ ] JWT token generation
  - [ ] Last login update
  - [ ] Error handling
  - [ ] Response formatting

#### Password Reset:

- [ ] `POST /auth/reset-password` - Reset password
  - [ ] Email validation
  - [ ] User existence check
  - [ ] Reset token generation
  - [ ] Reset email sending
  - [ ] Error handling

#### Change Password:

- [ ] `POST /auth/change-password` - Change password
  - [ ] JWT authentication
  - [ ] Current password verification
  - [ ] New password validation
  - [ ] Password update
  - [ ] Error handling

#### Profile Management:

- [ ] `GET /auth/profile` - Get user profile

  - [ ] JWT authentication
  - [ ] User information retrieval
  - [ ] Response formatting

- [ ] `PUT /auth/profile` - Update user profile
  - [ ] JWT authentication
  - [ ] Profile update
  - [ ] Validation
  - [ ] Error handling

#### Admin Password Update:

- [ ] `POST /auth/admin/update-password` - Admin update user password
  - [ ] JWT authentication
  - [ ] Admin role check
  - [ ] User ID validation
  - [ ] Password update
  - [ ] Authorization check

#### Token from Session:

- [ ] `POST /auth/get-token-from-session` - Get token from session
  - [ ] Session validation
  - [ ] Token generation
  - [ ] Error handling

**Test Files:**

- `tests/unit/backend/auth/test_registration.test.py`
- `tests/unit/backend/auth/test_login.test.py`
- `tests/unit/backend/auth/test_password_reset.test.py`
- `tests/unit/backend/auth/test_password_change.test.py`
- `tests/unit/backend/auth/test_profile_management.test.py`
- `tests/integration/backend/auth/test_auth_workflow.test.py`
- `tests/e2e/backend/auth/test_auth_complete_journey.test.py`

---

## 7. AUTH MODULE

### 7.1 `auth.py` - Authentication Functions

**Priority:** Critical
**Test Coverage:**

#### Validation Functions:

- [ ] `validate_email(email)` - Email validation

  - [ ] Valid email formats
  - [ ] Invalid email formats
  - [ ] Edge cases

- [ ] `validate_password(password)` - Password validation
  - [ ] Minimum length (8 characters)
  - [ ] Uppercase letter requirement
  - [ ] Lowercase letter requirement
  - [ ] Number requirement
  - [ ] Special character handling
  - [ ] Error messages

#### User Management:

- [ ] `register_user(email, password, role)` - Register user

  - [ ] Email validation
  - [ ] Password validation
  - [ ] Duplicate email handling
  - [ ] Deactivated user reactivation
  - [ ] User creation
  - [ ] Database commit
  - [ ] Error handling
  - [ ] Rollback on error

- [ ] `login_user(email, password)` - Login user

  - [ ] User lookup
  - [ ] Active status check
  - [ ] Password verification
  - [ ] Last login update
  - [ ] JWT token generation
  - [ ] Token expiration (24 hours)
  - [ ] Error handling

- [ ] `reset_password(email)` - Reset password

  - [ ] User lookup
  - [ ] Reset token generation
  - [ ] Token storage
  - [ ] Reset email sending
  - [ ] Error handling

- [ ] `change_password(user_id, current_password, new_password)` - Change password

  - [ ] User lookup
  - [ ] Current password verification
  - [ ] New password validation
  - [ ] Password update
  - [ ] Error handling

- [ ] `require_auth(f)` - Authentication decorator
  - [ ] JWT token validation
  - [ ] User extraction
  - [ ] Error handling
  - [ ] Unauthorized response

**Test Files:**

- `tests/unit/backend/auth_module/test_validation.test.py`
- `tests/unit/backend/auth_module/test_user_management.test.py`
- `tests/unit/backend/auth_module/test_password_management.test.py`
- `tests/unit/backend/auth_module/test_decorators.test.py`

---

## 8. MODELS

### 8.1 `models.py` - Database Models (277 lines)

**Priority:** Critical
**Test Coverage:**

#### User Model:

- [ ] User creation
- [ ] Email uniqueness
- [ ] Password hashing (bcrypt)
- [ ] Password verification
- [ ] Role assignment (user, admin, super_admin)
- [ ] is_active flag
- [ ] Subscription tier (free, premium, enterprise, client)
- [ ] Monthly call limit
- [ ] Monthly used tracking
- [ ] Monthly reset date
- [ ] Relationships (api_keys, usage_logs, reset_history)
- [ ] to_dict() method
- [ ] Timestamps (created_at, last_login)

#### APIKey Model:

- [ ] API key generation (secrets.token_urlsafe)
- [ ] Key uniqueness
- [ ] User association
- [ ] is_active flag
- [ ] Rate limit setting
- [ ] Expiration date handling
- [ ] Last used tracking
- [ ] Relationships (usage_logs, rate_limits)
- [ ] to_dict() method (with/without key)
- [ ] Timestamps

#### UsageLog Model:

- [ ] Log creation
- [ ] API key association
- [ ] User association
- [ ] Endpoint tracking
- [ ] Method tracking
- [ ] Status code tracking
- [ ] File size tracking
- [ ] Processing time tracking
- [ ] IP address tracking
- [ ] User agent tracking
- [ ] Error message tracking
- [ ] Timestamp indexing
- [ ] to_dict() method

#### RateLimit Model:

- [ ] Rate limit creation
- [ ] API key association
- [ ] Request count tracking
- [ ] Window start tracking
- [ ] Window duration (1 hour default)
- [ ] is_exceeded() method
- [ ] reset_window() method
- [ ] increment() method

#### Job Model:

- [ ] Job creation
- [ ] Job ID uniqueness
- [ ] API key association
- [ ] User association
- [ ] Endpoint tracking
- [ ] Status tracking (pending, processing, completed, failed)
- [ ] File path tracking (input/output)
- [ ] Error message tracking
- [ ] Timestamps (created_at, started_at, completed_at)
- [ ] Processing time tracking
- [ ] Relationships (api_key, user)
- [ ] to_dict() method
- [ ] Download URL generation

#### Webhook Model:

- [ ] Webhook creation
- [ ] API key association
- [ ] URL validation
- [ ] Events list (JSON)
- [ ] Secret generation
- [ ] is_active flag
- [ ] Last triggered tracking
- [ ] Failure count tracking
- [ ] Auto-deactivation (5 failures)
- [ ] Relationships (api_key)
- [ ] to_dict() method

#### ResetHistory Model:

- [ ] Reset history creation
- [ ] User association
- [ ] Reset by (admin) association
- [ ] Calls before tracking
- [ ] Calls after tracking (should be 0)
- [ ] Reset reason
- [ ] Reset timestamp
- [ ] Relationships (user, reset_by_user)
- [ ] to_dict() method

#### Notification Model:

- [ ] Notification creation
- [ ] Title validation
- [ ] Message validation
- [ ] Type (info, warning, error, success, payment, subscription)
- [ ] Category (system, payment, subscription, user, api)
- [ ] is_read flag
- [ ] Read timestamp
- [ ] Read by (admin) tracking
- [ ] Metadata (JSON)
- [ ] Timestamp
- [ ] Relationships (read_by_user)
- [ ] to_dict() method

**Test Files:**

- `tests/unit/backend/models/test_user_model.test.py`
- `tests/unit/backend/models/test_api_key_model.test.py`
- `tests/unit/backend/models/test_usage_log_model.test.py`
- `tests/unit/backend/models/test_rate_limit_model.test.py`
- `tests/unit/backend/models/test_job_model.test.py`
- `tests/unit/backend/models/test_webhook_model.test.py`
- `tests/unit/backend/models/test_reset_history_model.test.py`
- `tests/unit/backend/models/test_notification_model.test.py`
- `tests/integration/backend/models/test_model_relationships.test.py`

---

## 9. DATABASE

### 9.1 `database.py` - Database Configuration

**Priority:** Critical
**Test Coverage:**

#### Database Initialization:

- [ ] `init_db(app)` - Initialize database
  - [ ] Database URL configuration
  - [ ] PostgreSQL URL format handling
  - [ ] SQLAlchemy initialization
  - [ ] Flask-Migrate initialization
  - [ ] Table creation
  - [ ] Missing column migration
  - [ ] Timeout protection (30 seconds)
  - [ ] Default admin user creation
  - [ ] Error handling

#### Database Migrations:

- [ ] Subscription tier column migration
- [ ] Monthly call limit column migration
- [ ] Monthly used column migration
- [ ] Monthly reset date column migration
- [ ] Notifications table creation
- [ ] Existing data preservation

**Test Files:**

- `tests/unit/backend/database/test_database_init.test.py`
- `tests/unit/backend/database/test_migrations.test.py`
- `tests/integration/backend/database/test_database_operations.test.py`

---

## 10. EMAIL SERVICE

### 10.1 `email_service.py` - Email Service

**Priority:** High
**Test Coverage:**

#### PDF Generation:

- [ ] `generate_subscription_pdf()` - Generate subscription PDF

  - [ ] Tier validation
  - [ ] Amount formatting
  - [ ] User email validation
  - [ ] Subscription ID handling
  - [ ] Payment ID handling
  - [ ] Payment date handling
  - [ ] Billing cycle handling
  - [ ] Payment method handling
  - [ ] Template rendering
  - [ ] PDF generation
  - [ ] Error handling

- [ ] `generate_invoice_pdf()` - Generate invoice PDF
  - [ ] Tier validation
  - [ ] Amount formatting
  - [ ] User email validation
  - [ ] Payment ID handling
  - [ ] Payment date handling
  - [ ] Item description handling
  - [ ] Template rendering
  - [ ] PDF generation
  - [ ] Error handling

#### Email Sending:

- [ ] `send_email()` - Send email via Resend
  - [ ] Recipient email validation
  - [ ] Subject validation
  - [ ] HTML content validation
  - [ ] Text content (optional)
  - [ ] Attachments handling (base64 to bytes)
  - [ ] Resend API integration
  - [ ] Error handling
  - [ ] Success/failure logging

#### Email Templates:

- [ ] `get_welcome_email_html()` - Get welcome email HTML

  - [ ] User email validation
  - [ ] Tier validation
  - [ ] Template rendering
  - [ ] HTML content generation
  - [ ] Text content generation

- [ ] `get_upgrade_email_html()` - Get upgrade email HTML

  - [ ] User email validation
  - [ ] Old tier validation
  - [ ] New tier validation
  - [ ] Template rendering
  - [ ] HTML content generation
  - [ ] Text content generation

- [ ] `get_file_invoice_email_html()` - Get file invoice email HTML
  - [ ] Item name validation
  - [ ] Amount validation
  - [ ] Payment ID handling
  - [ ] Template rendering
  - [ ] HTML content generation

#### Email Functions:

- [ ] `send_welcome_email()` - Send welcome email

  - [ ] User email validation
  - [ ] Tier validation
  - [ ] Amount handling
  - [ ] Payment ID handling
  - [ ] Payment date handling
  - [ ] Welcome email HTML generation
  - [ ] Subscription PDF generation
  - [ ] Email sending
  - [ ] Error handling

- [ ] `send_upgrade_email()` - Send upgrade email
  - [ ] User email validation
  - [ ] Old tier validation
  - [ ] New tier validation
  - [ ] Amount handling
  - [ ] Payment ID handling
  - [ ] Payment date handling
  - [ ] Upgrade email HTML generation
  - [ ] Subscription PDF generation (only subscription PDF, not invoice)
  - [ ] Email sending
  - [ ] Error handling

**Test Files:**

- `tests/unit/backend/email/test_pdf_generation.test.py`
- `tests/unit/backend/email/test_email_sending.test.py`
- `tests/unit/backend/email/test_email_templates.test.py`
- `tests/unit/backend/email/test_email_functions.test.py`
- `tests/integration/backend/email/test_email_workflow.test.py`

---

## 11. NOTIFICATION SERVICE

### 11.1 `notification_service.py` - Notification Service

**Priority:** High
**Test Coverage:**

#### Notification Creation:

- [ ] `create_notification()` - Create notification
  - [ ] Title validation
  - [ ] Message validation
  - [ ] Type validation (info, warning, error, success, payment, subscription)
  - [ ] Category validation (system, payment, subscription, user, api)
  - [ ] Metadata handling (JSON)
  - [ ] Database commit
  - [ ] Error handling
  - [ ] Rollback on error

#### Specialized Notifications:

- [ ] `create_payment_notification()` - Create payment notification

  - [ ] Title validation
  - [ ] Message validation
  - [ ] Payment ID handling
  - [ ] User ID handling
  - [ ] User email handling
  - [ ] Amount handling
  - [ ] Metadata construction
  - [ ] Notification creation

- [ ] `create_subscription_notification()` - Create subscription notification
  - [ ] Title validation
  - [ ] Message validation
  - [ ] User ID handling
  - [ ] User email handling
  - [ ] Plan ID handling
  - [ ] Old tier handling
  - [ ] New tier handling
  - [ ] Metadata construction
  - [ ] Notification creation

**Test Files:**

- `tests/unit/backend/notification/test_notification_creation.test.py`
- `tests/unit/backend/notification/test_specialized_notifications.test.py`
- `tests/integration/backend/notification/test_notification_workflow.test.py`

---

## 12. WEBHOOKS

### 12.1 `webhooks.py` - Webhook Service

**Priority:** Medium
**Test Coverage:**

#### Webhook Security:

- [ ] `generate_webhook_secret()` - Generate webhook secret

  - [ ] Secret generation (secrets.token_urlsafe)
  - [ ] Length validation (32 bytes)

- [ ] `create_webhook_signature()` - Create webhook signature

  - [ ] HMAC-SHA256 signature
  - [ ] Payload encoding
  - [ ] Secret encoding

- [ ] `verify_webhook_signature()` - Verify webhook signature
  - [ ] Signature comparison (hmac.compare_digest)
  - [ ] Security against timing attacks

#### Webhook Sending:

- [ ] `send_webhook()` - Send webhook (Celery task)

  - [ ] Webhook lookup
  - [ ] Active status check
  - [ ] Event type filtering
  - [ ] Header construction
  - [ ] Signature generation
  - [ ] HTTP POST request
  - [ ] Timeout handling (30 seconds)
  - [ ] Success/failure tracking
  - [ ] Failure count increment
  - [ ] Auto-deactivation (5 failures)
  - [ ] Retry logic (exponential backoff)
  - [ ] Error handling

- [ ] `trigger_webhooks()` - Trigger webhooks for job event
  - [ ] Job lookup
  - [ ] Webhook lookup (by API key)
  - [ ] Event type validation
  - [ ] Payload construction
  - [ ] Celery task dispatch
  - [ ] Error handling

**Test Files:**

- `tests/unit/backend/webhooks/test_webhook_security.test.py`
- `tests/unit/backend/webhooks/test_webhook_sending.test.py`
- `tests/integration/backend/webhooks/test_webhook_workflow.test.py`

---

## 13. RATE LIMITER

### 13.1 `rate_limiter.py` - Rate Limiting Service

**Priority:** High
**Test Coverage:**

#### Redis Connection:

- [ ] `_connect_redis()` - Connect to Redis
  - [ ] Redis URL configuration
  - [ ] Connection establishment
  - [ ] Connection test (ping)
  - [ ] Fallback to in-memory on failure
  - [ ] Error handling

#### Rate Limiting:

- [ ] `is_allowed(key, limit, window_seconds)` - Check rate limit

  - [ ] Redis-based rate limiting
  - [ ] In-memory fallback
  - [ ] Window calculation
  - [ ] Counter increment
  - [ ] TTL setting
  - [ ] Remaining requests calculation
  - [ ] Reset time calculation
  - [ ] Return tuple (is_allowed, remaining, reset_time)

- [ ] `_memory_fallback()` - In-memory rate limiting
  - [ ] Dictionary-based storage
  - [ ] Window calculation
  - [ ] Counter increment
  - [ ] Cleanup of old entries
  - [ ] Remaining requests calculation

**Test Files:**

- `tests/unit/backend/rate_limiter/test_redis_connection.test.py`
- `tests/unit/backend/rate_limiter/test_rate_limiting.test.py`
- `tests/integration/backend/rate_limiter/test_rate_limiter_workflow.test.py`

---

## 14. API AUTH

### 14.1 `api_auth.py` - API Authentication

**Priority:** Critical
**Test Coverage:**

#### API Key Management:

- [ ] `generate_api_key()` - Generate API key

  - [ ] Key generation (APIKey.generate_key)
  - [ ] Uniqueness

- [ ] `verify_api_key(api_key_string)` - Verify API key

  - [ ] Key string validation
  - [ ] Key lookup
  - [ ] Active status check
  - [ ] Expiration check
  - [ ] Last used update
  - [ ] User return
  - [ ] Error handling

- [ ] `require_api_key(f)` - API key decorator
  - [ ] OPTIONS request handling (CORS)
  - [ ] API key extraction (X-API-Key or Authorization header)
  - [ ] Key verification
  - [ ] User storage in g
  - [ ] API key storage in g
  - [ ] Unauthorized response
  - [ ] Error handling

#### Usage Logging:

- [ ] `log_api_usage()` - Log API usage
  - [ ] API key check
  - [ ] UsageLog creation
  - [ ] Endpoint tracking
  - [ ] Method tracking
  - [ ] Status code tracking
  - [ ] File size tracking
  - [ ] Processing time tracking
  - [ ] IP address tracking
  - [ ] User agent tracking
  - [ ] Error message tracking
  - [ ] Database commit
  - [ ] Error handling (non-blocking)

#### Rate Limiting:

- [ ] `check_rate_limit(api_key_id)` - Check rate limit

  - [ ] API key lookup
  - [ ] Rate limit record lookup/creation
  - [ ] Window calculation (hourly)
  - [ ] Request count check
  - [ ] Rate limit exceeded check
  - [ ] Window reset
  - [ ] Counter increment
  - [ ] Database commit
  - [ ] Error handling

- [ ] `require_rate_limit(f)` - Rate limit decorator
  - [ ] API key check
  - [ ] Rate limit check
  - [ ] Rate limit exceeded response (429)
  - [ ] Headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
  - [ ] Error handling

#### User Stats:

- [ ] `get_user_stats(user_id)` - Get user statistics
  - [ ] User lookup
  - [ ] Monthly usage calculation
  - [ ] Remaining calls calculation
  - [ ] Reset date check
  - [ ] Monthly reset logic
  - [ ] Statistics return

**Test Files:**

- `tests/unit/backend/api_auth/test_api_key_management.test.py`
- `tests/unit/backend/api_auth/test_usage_logging.test.py`
- `tests/unit/backend/api_auth/test_rate_limiting.test.py`
- `tests/unit/backend/api_auth/test_user_stats.test.py`
- `tests/integration/backend/api_auth/test_api_auth_workflow.test.py`

---

## 15. MONITORING

### 15.1 `monitoring.py` - System Monitoring

**Priority:** Medium
**Test Coverage:**

#### System Health:

- [ ] `get_system_health()` - Get system health metrics
  - [ ] CPU usage (psutil)
  - [ ] Memory usage (psutil)
  - [ ] Disk usage (psutil)
  - [ ] Database health check
  - [ ] Recent error rate calculation
  - [ ] Active jobs count
  - [ ] Response formatting
  - [ ] Error handling

#### System Metrics:

- [ ] CPU monitoring
- [ ] Memory monitoring
- [ ] Disk monitoring
- [ ] Database connectivity
- [ ] Error rate calculation
- [ ] Job status tracking

**Test Files:**

- `tests/unit/backend/monitoring/test_system_health.test.py`
- `tests/unit/backend/monitoring/test_system_metrics.test.py`

---

## 16. CELERY TASKS

### 16.1 `celery_app.py` - Celery Configuration

**Priority:** Medium
**Test Coverage:**

#### Celery Configuration:

- [ ] Celery app initialization
- [ ] Broker URL configuration (Redis)
- [ ] Result backend configuration (Redis)
- [ ] Task serialization (JSON)
- [ ] Timezone configuration (UTC)
- [ ] Task time limits (30 minutes hard, 25 minutes soft)
- [ ] Worker configuration
- [ ] Task routes configuration
- [ ] Queue configuration

**Test Files:**

- `tests/unit/backend/celery/test_celery_config.test.py`

---

### 16.2 `tasks.py` - Celery Tasks

**Priority:** High
**Test Coverage:**

#### Async Video Conversion:

- [ ] `convert_video_async()` - Async video conversion task
  - [ ] Job lookup
  - [ ] Job status update (processing)
  - [ ] Output path generation
  - [ ] FFmpeg command construction
  - [ ] FFmpeg execution
  - [ ] Progress tracking
  - [ ] Job status update (completed/failed)
  - [ ] Processing time calculation
  - [ ] Error handling
  - [ ] Retry logic

#### Async Audio Conversion:

- [ ] `convert_audio_async()` - Async audio conversion task
  - [ ] Job lookup
  - [ ] Job status update
  - [ ] Output path generation
  - [ ] FFmpeg command construction
  - [ ] FFmpeg execution
  - [ ] Job status update
  - [ ] Error handling

#### Async Image Conversion:

- [ ] `convert_image_async()` - Async image conversion task
  - [ ] Job lookup
  - [ ] Job status update
  - [ ] Output path generation
  - [ ] Image processing
  - [ ] Job status update
  - [ ] Error handling

#### Async PDF Processing:

- [ ] `process_pdf_async()` - Async PDF processing task
  - [ ] Job lookup
  - [ ] Job status update
  - [ ] PDF processing
  - [ ] Job status update
  - [ ] Error handling

**Test Files:**

- `tests/unit/backend/tasks/test_video_conversion_task.test.py`
- `tests/unit/backend/tasks/test_audio_conversion_task.test.py`
- `tests/unit/backend/tasks/test_image_conversion_task.test.py`
- `tests/unit/backend/tasks/test_pdf_processing_task.test.py`
- `tests/integration/backend/tasks/test_async_workflow.test.py`

---

## 17. TESTING PRIORITY SUMMARY

### Phase 1: Critical (Week 1)

1. `app.py` - Main application routes (4964 lines)
2. `api/payment/routes.py` - Payment endpoints
3. `auth_routes.py` - Authentication endpoints
4. `auth.py` - Authentication functions
5. `models.py` - Database models
6. `database.py` - Database initialization
7. `api_auth.py` - API authentication

### Phase 2: High Priority (Week 2)

8. `api/v1/routes.py` - API v1 endpoints
9. `api/admin/routes.py` - Admin endpoints
10. `api/client/routes.py` - Client endpoints
11. `email_service.py` - Email service
12. `notification_service.py` - Notification service
13. `rate_limiter.py` - Rate limiting
14. `tasks.py` - Celery tasks

### Phase 3: Medium Priority (Week 3)

15. `webhooks.py` - Webhook service
16. `monitoring.py` - System monitoring
17. `celery_app.py` - Celery configuration

---

## 18. TEST STATISTICS

**Total Files to Test: 50+**

- 1 Main Application File (4964 lines)
- 4 API Blueprints
- 1 Auth Blueprint
- 1 Models File (277 lines)
- 5 Service Files
- 1 Database File
- 1 Auth File
- 1 Celery App File
- 1 Tasks File
- 1 API Auth File

**Estimated Test Count:**

- Unit Tests: 200+
- Integration Tests: 80+
- E2E Tests: 30+
- **Total: 310+ Tests**

---

## 19. TESTING TOOLS & SETUP

### Backend Testing Stack

- **pytest** - Testing framework
- **pytest-flask** - Flask testing utilities
- **pytest-cov** - Code coverage
- **pytest-mock** - Mocking utilities
- **factory-boy** - Test data factories
- **faker** - Fake data generation
- **responses** - HTTP mocking
- **freezegun** - Time mocking

### Test Configuration Files Needed

- `pytest.ini` - Pytest configuration
- `conftest.py` - Pytest fixtures
- `tests/factories.py` - Test data factories
- `.coveragerc` - Coverage configuration

---

## 20. TESTING CHECKLIST

### For Each Route/Function:

- [ ] Input validation
- [ ] Authentication/authorization
- [ ] Rate limiting
- [ ] Error handling
- [ ] Database operations
- [ ] Response formatting
- [ ] Status codes
- [ ] Edge cases
- [ ] Boundary conditions
- [ ] Error messages
- [ ] Logging
- [ ] Performance (if applicable)

---

## 21. NOTES

- All test files should follow naming convention: `test_*.py`
- Use pytest fixtures for database setup/teardown
- Mock external services (Resend, Redis, etc.)
- Use test database (separate from production)
- Test both success and failure scenarios
- Test edge cases (empty data, null values, etc.)
- Test authentication and authorization
- Test rate limiting
- Test error handling
- Test database transactions (rollback on error)
- Test async operations
- Test file uploads/downloads
- Test PDF processing
- Test email sending (mocked)
- Test webhook sending (mocked)

---

**Last Updated:** [Current Date]
**Total Routes:** 80+
**Total Functions:** 150+
**Total Test Files Needed:** 310+

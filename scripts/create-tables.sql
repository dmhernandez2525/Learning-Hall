-- Learning Hall Database Schema
-- Auto-generated migration to create missing tables
-- Run with: psql -f scripts/create-tables.sql

-- Create enum types first
DO $$ BEGIN
    CREATE TYPE enum_enrollments_status AS ENUM ('active', 'completed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_course_progress_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_certificates_status AS ENUM ('pending', 'issued', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_quizzes_type AS ENUM ('practice', 'graded', 'survey');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_questions_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_quiz_attempts_status AS ENUM ('in_progress', 'completed', 'timed_out');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_discussion_threads_status AS ENUM ('open', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_course_reviews_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_badges_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_badges_category AS ENUM ('course', 'streak', 'quiz', 'community', 'milestone', 'special');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_payments_type AS ENUM ('course_purchase', 'bundle_purchase', 'subscription', 'subscription_renewal', 'refund', 'dispute', 'payout');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_payments_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'disputed', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_subscriptions_status AS ENUM ('active', 'past_due', 'canceled', 'unpaid', 'trialing', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_coupons_type AS ENUM ('percentage', 'fixed_amount', 'free_trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_affiliates_status AS ENUM ('pending', 'active', 'suspended', 'terminated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_affiliate_payouts_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_instructor_payouts_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_live_sessions_status AS ENUM ('scheduled', 'live', 'ended', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_live_sessions_platform AS ENUM ('zoom', 'meet', 'teams', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_session_attendance_status AS ENUM ('registered', 'attended', 'missed', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status enum_enrollments_status NOT NULL DEFAULT 'active',
    enrolled_at TIMESTAMP(3) WITH TIME ZONE,
    completed_at TIMESTAMP(3) WITH TIME ZONE,
    expires_at TIMESTAMP(3) WITH TIME ZONE,
    progress NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enrollments_user_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_idx ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS enrollments_created_at_idx ON enrollments(created_at);
CREATE INDEX IF NOT EXISTS enrollments_updated_at_idx ON enrollments(updated_at);

-- Course Progress
CREATE TABLE IF NOT EXISTS course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    status enum_course_progress_status NOT NULL DEFAULT 'not_started',
    progress_percentage NUMERIC DEFAULT 0,
    completed_lessons JSONB,
    time_spent_seconds NUMERIC DEFAULT 0,
    last_accessed_at TIMESTAMP(3) WITH TIME ZONE,
    completed_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_progress_user_idx ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS course_progress_course_idx ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS course_progress_created_at_idx ON course_progress(created_at);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR UNIQUE,
    status enum_certificates_status NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMP(3) WITH TIME ZONE,
    revoked_at TIMESTAMP(3) WITH TIME ZONE,
    revoked_reason VARCHAR,
    metadata JSONB,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS certificates_user_idx ON certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_course_idx ON certificates(course_id);
CREATE INDEX IF NOT EXISTS certificates_number_idx ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS certificates_created_at_idx ON certificates(created_at);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE,
    description JSONB,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    type enum_quizzes_type NOT NULL DEFAULT 'graded',
    passing_score NUMERIC DEFAULT 70,
    time_limit_minutes NUMERIC,
    max_attempts NUMERIC,
    shuffle_questions BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quizzes_course_idx ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS quizzes_lesson_idx ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS quizzes_slug_idx ON quizzes(slug);
CREATE INDEX IF NOT EXISTS quizzes_created_at_idx ON quizzes(created_at);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text VARCHAR NOT NULL,
    type enum_questions_type NOT NULL DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer JSONB,
    explanation VARCHAR,
    points NUMERIC DEFAULT 1,
    order_index NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS questions_quiz_idx ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS questions_created_at_idx ON questions(created_at);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    status enum_quiz_attempts_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP(3) WITH TIME ZONE,
    completed_at TIMESTAMP(3) WITH TIME ZONE,
    score NUMERIC,
    percentage NUMERIC,
    passed BOOLEAN,
    answers JSONB,
    time_taken_seconds NUMERIC,
    attempt_number NUMERIC DEFAULT 1,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_idx ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_created_at_idx ON quiz_attempts(created_at);

-- Discussion Threads
CREATE TABLE IF NOT EXISTS discussion_threads (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    content JSONB,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    status enum_discussion_threads_status NOT NULL DEFAULT 'open',
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count NUMERIC DEFAULT 0,
    reply_count NUMERIC DEFAULT 0,
    last_activity_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discussion_threads_author_idx ON discussion_threads(author_id);
CREATE INDEX IF NOT EXISTS discussion_threads_course_idx ON discussion_threads(course_id);
CREATE INDEX IF NOT EXISTS discussion_threads_lesson_idx ON discussion_threads(lesson_id);
CREATE INDEX IF NOT EXISTS discussion_threads_created_at_idx ON discussion_threads(created_at);

-- Discussion Posts
CREATE TABLE IF NOT EXISTS discussion_posts (
    id SERIAL PRIMARY KEY,
    content JSONB NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_id INTEGER NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES discussion_posts(id) ON DELETE SET NULL,
    is_solution BOOLEAN DEFAULT false,
    upvotes NUMERIC DEFAULT 0,
    downvotes NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discussion_posts_author_idx ON discussion_posts(author_id);
CREATE INDEX IF NOT EXISTS discussion_posts_thread_idx ON discussion_posts(thread_id);
CREATE INDEX IF NOT EXISTS discussion_posts_parent_idx ON discussion_posts(parent_id);
CREATE INDEX IF NOT EXISTS discussion_posts_created_at_idx ON discussion_posts(created_at);

-- Lesson Notes
CREATE TABLE IF NOT EXISTS lesson_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content JSONB,
    plain_text VARCHAR,
    timestamp_seconds NUMERIC,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lesson_notes_user_idx ON lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS lesson_notes_lesson_idx ON lesson_notes(lesson_id);
CREATE INDEX IF NOT EXISTS lesson_notes_created_at_idx ON lesson_notes(created_at);

-- Course Favorites
CREATE TABLE IF NOT EXISTS course_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);
CREATE INDEX IF NOT EXISTS course_favorites_user_idx ON course_favorites(user_id);
CREATE INDEX IF NOT EXISTS course_favorites_course_idx ON course_favorites(course_id);

-- Lesson Bookmarks
CREATE TABLE IF NOT EXISTS lesson_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    timestamp_seconds NUMERIC,
    note VARCHAR,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lesson_bookmarks_user_idx ON lesson_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS lesson_bookmarks_lesson_idx ON lesson_bookmarks(lesson_id);

-- Lesson Activity
CREATE TABLE IF NOT EXISTS lesson_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    last_position_seconds NUMERIC DEFAULT 0,
    time_spent_seconds NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lesson_activity_user_idx ON lesson_activity(user_id);
CREATE INDEX IF NOT EXISTS lesson_activity_lesson_idx ON lesson_activity(lesson_id);

-- Course Reviews
CREATE TABLE IF NOT EXISTS course_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating NUMERIC NOT NULL,
    title VARCHAR,
    content VARCHAR,
    status enum_course_reviews_status NOT NULL DEFAULT 'pending',
    helpful_votes NUMERIC DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    instructor_response VARCHAR,
    responded_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_reviews_user_idx ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS course_reviews_course_idx ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS course_reviews_status_idx ON course_reviews(status);
CREATE INDEX IF NOT EXISTS course_reviews_created_at_idx ON course_reviews(created_at);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    slug VARCHAR NOT NULL UNIQUE,
    description VARCHAR NOT NULL,
    icon_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    rarity enum_badges_rarity NOT NULL DEFAULT 'common',
    points NUMERIC DEFAULT 10,
    category enum_badges_category NOT NULL,
    criteria_type VARCHAR,
    criteria_threshold NUMERIC,
    criteria_specific_course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    criteria_action_type VARCHAR,
    is_active BOOLEAN DEFAULT true,
    is_secret BOOLEAN DEFAULT false,
    display_order NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS badges_slug_idx ON badges(slug);
CREATE INDEX IF NOT EXISTS badges_created_at_idx ON badges(created_at);

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP(3) WITH TIME ZONE,
    progress NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_id)
);
CREATE INDEX IF NOT EXISTS user_badges_user_idx ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_idx ON user_badges(badge_id);

-- User Points
CREATE TABLE IF NOT EXISTS user_points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points NUMERIC DEFAULT 0,
    current_streak NUMERIC DEFAULT 0,
    longest_streak NUMERIC DEFAULT 0,
    level NUMERIC DEFAULT 1,
    last_activity_date DATE,
    streak_start_date DATE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_points_user_idx ON user_points(user_id);
CREATE INDEX IF NOT EXISTS user_points_level_idx ON user_points(level);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type enum_payments_type NOT NULL,
    status enum_payments_status NOT NULL DEFAULT 'pending',
    amount NUMERIC NOT NULL,
    currency VARCHAR NOT NULL DEFAULT 'usd',
    net_amount NUMERIC,
    fees_stripe NUMERIC,
    fees_platform NUMERIC,
    fees_total NUMERIC,
    stripe_payment_intent_id VARCHAR,
    stripe_charge_id VARCHAR,
    stripe_session_id VARCHAR,
    stripe_subscription_id VARCHAR,
    stripe_invoice_id VARCHAR,
    stripe_customer_id VARCHAR,
    stripe_payment_method VARCHAR,
    stripe_receipt_url VARCHAR,
    stripe_refund_id VARCHAR,
    stripe_dispute_id VARCHAR,
    items JSONB,
    coupon_code VARCHAR,
    coupon_discount_amount NUMERIC,
    coupon_discount_percent NUMERIC,
    affiliate_id VARCHAR,
    affiliate_commission NUMERIC,
    affiliate_commission_rate NUMERIC,
    metadata JSONB,
    refund_amount NUMERIC,
    refund_reason VARCHAR,
    refund_notes VARCHAR,
    refund_processed_at TIMESTAMP(3) WITH TIME ZONE,
    dispute_reason VARCHAR,
    dispute_status VARCHAR,
    dispute_amount NUMERIC,
    dispute_evidence VARCHAR,
    dispute_due_by TIMESTAMP(3) WITH TIME ZONE,
    dispute_resolved_at TIMESTAMP(3) WITH TIME ZONE,
    billing_name VARCHAR,
    billing_email VARCHAR,
    billing_phone VARCHAR,
    billing_line1 VARCHAR,
    billing_line2 VARCHAR,
    billing_city VARCHAR,
    billing_state VARCHAR,
    billing_postal_code VARCHAR,
    billing_country VARCHAR,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_type_idx ON payments(type);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS payments_stripe_payment_intent_idx ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS payments_tenant_idx ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    description VARCHAR,
    stripe_price_id VARCHAR,
    price_amount NUMERIC NOT NULL,
    price_currency VARCHAR NOT NULL DEFAULT 'usd',
    interval VARCHAR NOT NULL DEFAULT 'month',
    interval_count NUMERIC DEFAULT 1,
    trial_period_days NUMERIC,
    features JSONB,
    course_access_type VARCHAR DEFAULT 'all',
    course_access_specific JSONB,
    is_active BOOLEAN DEFAULT true,
    display_order NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscription_plans_slug_idx ON subscription_plans(slug);
CREATE INDEX IF NOT EXISTS subscription_plans_stripe_price_idx ON subscription_plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS subscription_plans_created_at_idx ON subscription_plans(created_at);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR,
    stripe_customer_id VARCHAR,
    status enum_subscriptions_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP(3) WITH TIME ZONE,
    current_period_end TIMESTAMP(3) WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP(3) WITH TIME ZONE,
    ended_at TIMESTAMP(3) WITH TIME ZONE,
    trial_start TIMESTAMP(3) WITH TIME ZONE,
    trial_end TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_idx ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_created_at_idx ON subscriptions(created_at);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR NOT NULL UNIQUE,
    type enum_coupons_type NOT NULL DEFAULT 'percentage',
    value NUMERIC NOT NULL,
    applies_to_type VARCHAR DEFAULT 'all',
    applies_to_courses JSONB,
    applies_to_bundles JSONB,
    max_redemptions NUMERIC,
    redemption_count NUMERIC DEFAULT 0,
    max_per_user NUMERIC DEFAULT 1,
    min_purchase_amount NUMERIC,
    starts_at TIMESTAMP(3) WITH TIME ZONE,
    expires_at TIMESTAMP(3) WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code);
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON coupons(is_active);
CREATE INDEX IF NOT EXISTS coupons_created_at_idx ON coupons(created_at);

-- Course Bundles
CREATE TABLE IF NOT EXISTS course_bundles (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    description JSONB,
    courses JSONB,
    price_amount NUMERIC NOT NULL,
    price_currency VARCHAR NOT NULL DEFAULT 'usd',
    compare_at_price NUMERIC,
    valid_from TIMESTAMP(3) WITH TIME ZONE,
    valid_until TIMESTAMP(3) WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_bundles_slug_idx ON course_bundles(slug);
CREATE INDEX IF NOT EXISTS course_bundles_is_active_idx ON course_bundles(is_active);
CREATE INDEX IF NOT EXISTS course_bundles_created_at_idx ON course_bundles(created_at);

-- Affiliates
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    code VARCHAR NOT NULL UNIQUE,
    commission_rate NUMERIC NOT NULL DEFAULT 20,
    tier VARCHAR DEFAULT 'standard',
    status enum_affiliates_status NOT NULL DEFAULT 'pending',
    payout_method VARCHAR,
    payout_details JSONB,
    total_earnings NUMERIC DEFAULT 0,
    pending_balance NUMERIC DEFAULT 0,
    paid_balance NUMERIC DEFAULT 0,
    lifetime_referrals NUMERIC DEFAULT 0,
    lifetime_conversions NUMERIC DEFAULT 0,
    approved_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliates_user_idx ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS affiliates_code_idx ON affiliates(code);
CREATE INDEX IF NOT EXISTS affiliates_status_idx ON affiliates(status);
CREATE INDEX IF NOT EXISTS affiliates_created_at_idx ON affiliates(created_at);

-- Affiliate Referrals
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    cookie_id VARCHAR,
    landing_page VARCHAR,
    referrer_url VARCHAR,
    ip_address VARCHAR,
    user_agent VARCHAR,
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP(3) WITH TIME ZONE,
    commission_amount NUMERIC,
    commission_paid BOOLEAN DEFAULT false,
    commission_paid_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliate_referrals_affiliate_idx ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_referred_user_idx ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_payment_idx ON affiliate_referrals(payment_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_created_at_idx ON affiliate_referrals(created_at);

-- Affiliate Payouts
CREATE TABLE IF NOT EXISTS affiliate_payouts (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency VARCHAR NOT NULL DEFAULT 'usd',
    status enum_affiliate_payouts_status NOT NULL DEFAULT 'pending',
    payout_method VARCHAR,
    transaction_id VARCHAR,
    notes VARCHAR,
    processed_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliate_payouts_affiliate_idx ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_payouts_status_idx ON affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS affiliate_payouts_created_at_idx ON affiliate_payouts(created_at);

-- Instructor Payouts
CREATE TABLE IF NOT EXISTS instructor_payouts (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    courses JSONB,
    period_start TIMESTAMP(3) WITH TIME ZONE,
    period_end TIMESTAMP(3) WITH TIME ZONE,
    gross_amount NUMERIC NOT NULL,
    platform_fee NUMERIC,
    net_payout NUMERIC NOT NULL,
    currency VARCHAR NOT NULL DEFAULT 'usd',
    status enum_instructor_payouts_status NOT NULL DEFAULT 'pending',
    payout_method VARCHAR,
    transaction_id VARCHAR,
    notes VARCHAR,
    processed_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS instructor_payouts_instructor_idx ON instructor_payouts(instructor_id);
CREATE INDEX IF NOT EXISTS instructor_payouts_status_idx ON instructor_payouts(status);
CREATE INDEX IF NOT EXISTS instructor_payouts_created_at_idx ON instructor_payouts(created_at);

-- Live Sessions
CREATE TABLE IF NOT EXISTS live_sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description JSONB,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform enum_live_sessions_platform NOT NULL DEFAULT 'zoom',
    status enum_live_sessions_status NOT NULL DEFAULT 'scheduled',
    scheduled_start TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP(3) WITH TIME ZONE,
    actual_start TIMESTAMP(3) WITH TIME ZONE,
    actual_end TIMESTAMP(3) WITH TIME ZONE,
    join_url VARCHAR,
    host_url VARCHAR,
    meeting_id VARCHAR,
    meeting_password VARCHAR,
    recording_url VARCHAR,
    recording_available BOOLEAN DEFAULT false,
    max_attendees NUMERIC,
    settings JSONB,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_sessions_course_idx ON live_sessions(course_id);
CREATE INDEX IF NOT EXISTS live_sessions_host_idx ON live_sessions(host_id);
CREATE INDEX IF NOT EXISTS live_sessions_status_idx ON live_sessions(status);
CREATE INDEX IF NOT EXISTS live_sessions_scheduled_start_idx ON live_sessions(scheduled_start);
CREATE INDEX IF NOT EXISTS live_sessions_created_at_idx ON live_sessions(created_at);

-- Session Attendance
CREATE TABLE IF NOT EXISTS session_attendance (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status enum_session_attendance_status NOT NULL DEFAULT 'registered',
    joined_at TIMESTAMP(3) WITH TIME ZONE,
    left_at TIMESTAMP(3) WITH TIME ZONE,
    duration_minutes NUMERIC,
    attention_score NUMERIC,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(session_id, user_id)
);
CREATE INDEX IF NOT EXISTS session_attendance_session_idx ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS session_attendance_user_idx ON session_attendance(user_id);
CREATE INDEX IF NOT EXISTS session_attendance_status_idx ON session_attendance(status);

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    messages JSONB,
    provider VARCHAR DEFAULT 'openai',
    model VARCHAR,
    tokens_used NUMERIC DEFAULT 0,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_conversations_user_idx ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_conversations_course_idx ON ai_conversations(course_id);
CREATE INDEX IF NOT EXISTS ai_conversations_lesson_idx ON ai_conversations(lesson_id);
CREATE INDEX IF NOT EXISTS ai_conversations_created_at_idx ON ai_conversations(created_at);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    key_prefix VARCHAR NOT NULL,
    key_hash VARCHAR NOT NULL,
    permissions JSONB,
    rate_limit NUMERIC DEFAULT 1000,
    last_used_at TIMESTAMP(3) WITH TIME ZONE,
    expires_at TIMESTAMP(3) WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS api_keys_tenant_idx ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS api_keys_key_prefix_idx ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS api_keys_is_active_idx ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS api_keys_created_at_idx ON api_keys(created_at);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    url VARCHAR NOT NULL,
    events JSONB,
    secret VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT true,
    failure_count NUMERIC DEFAULT 0,
    last_triggered_at TIMESTAMP(3) WITH TIME ZONE,
    last_success_at TIMESTAMP(3) WITH TIME ZONE,
    last_failure_at TIMESTAMP(3) WITH TIME ZONE,
    last_failure_reason VARCHAR,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS webhook_endpoints_tenant_idx ON webhook_endpoints(tenant_id);
CREATE INDEX IF NOT EXISTS webhook_endpoints_is_active_idx ON webhook_endpoints(is_active);
CREATE INDEX IF NOT EXISTS webhook_endpoints_created_at_idx ON webhook_endpoints(created_at);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    session_id VARCHAR,
    metadata JSONB,
    ip_address VARCHAR,
    user_agent VARCHAR,
    referrer VARCHAR,
    timestamp TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_course_idx ON analytics_events(course_id);
CREATE INDEX IF NOT EXISTS analytics_events_lesson_idx ON analytics_events(lesson_id);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at);

-- SCORM Packages
CREATE TABLE IF NOT EXISTS scorm_packages (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    version VARCHAR DEFAULT '1.2',
    package_file_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    launch_url VARCHAR,
    manifest_data JSONB,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scorm_packages_course_idx ON scorm_packages(course_id);
CREATE INDEX IF NOT EXISTS scorm_packages_is_active_idx ON scorm_packages(is_active);
CREATE INDEX IF NOT EXISTS scorm_packages_created_at_idx ON scorm_packages(created_at);

-- SCORM Attempts
CREATE TABLE IF NOT EXISTS scorm_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER NOT NULL REFERENCES scorm_packages(id) ON DELETE CASCADE,
    cmi_data JSONB,
    status VARCHAR DEFAULT 'not_attempted',
    score_raw NUMERIC,
    score_min NUMERIC,
    score_max NUMERIC,
    score_scaled NUMERIC,
    total_time VARCHAR,
    session_time VARCHAR,
    suspend_data TEXT,
    location VARCHAR,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scorm_attempts_user_idx ON scorm_attempts(user_id);
CREATE INDEX IF NOT EXISTS scorm_attempts_package_idx ON scorm_attempts(package_id);
CREATE INDEX IF NOT EXISTS scorm_attempts_status_idx ON scorm_attempts(status);
CREATE INDEX IF NOT EXISTS scorm_attempts_created_at_idx ON scorm_attempts(created_at);

-- xAPI Config
CREATE TABLE IF NOT EXISTS xapi_config (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    endpoint VARCHAR NOT NULL,
    auth_type VARCHAR DEFAULT 'basic',
    username VARCHAR,
    password VARCHAR,
    client_id VARCHAR,
    client_secret VARCHAR,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS xapi_config_tenant_idx ON xapi_config(tenant_id);
CREATE INDEX IF NOT EXISTS xapi_config_is_active_idx ON xapi_config(is_active);

-- Content Versions
CREATE TABLE IF NOT EXISTS content_versions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    version_number NUMERIC NOT NULL,
    content JSONB,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    change_summary VARCHAR,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP(3) WITH TIME ZONE,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_versions_lesson_idx ON content_versions(lesson_id);
CREATE INDEX IF NOT EXISTS content_versions_author_idx ON content_versions(author_id);
CREATE INDEX IF NOT EXISTS content_versions_is_published_idx ON content_versions(is_published);
CREATE INDEX IF NOT EXISTS content_versions_created_at_idx ON content_versions(created_at);

-- Course Templates
CREATE TABLE IF NOT EXISTS course_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    description VARCHAR,
    category VARCHAR,
    structure JSONB,
    thumbnail_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    use_count NUMERIC DEFAULT 0,
    created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_templates_slug_idx ON course_templates(slug);
CREATE INDEX IF NOT EXISTS course_templates_category_idx ON course_templates(category);
CREATE INDEX IF NOT EXISTS course_templates_is_public_idx ON course_templates(is_public);
CREATE INDEX IF NOT EXISTS course_templates_created_by_idx ON course_templates(created_by_id);
CREATE INDEX IF NOT EXISTS course_templates_created_at_idx ON course_templates(created_at);

-- Translations
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    key VARCHAR NOT NULL,
    locale VARCHAR NOT NULL,
    value VARCHAR NOT NULL,
    namespace VARCHAR DEFAULT 'common',
    context VARCHAR,
    is_verified BOOLEAN DEFAULT false,
    verified_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(key, locale, namespace)
);
CREATE INDEX IF NOT EXISTS translations_key_idx ON translations(key);
CREATE INDEX IF NOT EXISTS translations_locale_idx ON translations(locale);
CREATE INDEX IF NOT EXISTS translations_namespace_idx ON translations(namespace);
CREATE INDEX IF NOT EXISTS translations_created_at_idx ON translations(created_at);

-- Search Index
CREATE TABLE IF NOT EXISTS search_index (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR NOT NULL,
    content_id INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    description VARCHAR,
    content TEXT,
    tags JSONB,
    metadata JSONB,
    is_searchable BOOLEAN DEFAULT true,
    search_vector TSVECTOR,
    updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS search_index_content_type_idx ON search_index(content_type);
CREATE INDEX IF NOT EXISTS search_index_content_id_idx ON search_index(content_id);
CREATE INDEX IF NOT EXISTS search_index_is_searchable_idx ON search_index(is_searchable);
CREATE INDEX IF NOT EXISTS search_index_search_vector_idx ON search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS search_index_created_at_idx ON search_index(created_at);

-- Done
SELECT 'Migration completed successfully' AS status;

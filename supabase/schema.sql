-- Supabase Database Schema for Azolik
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS ====================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
  business_id UUID,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{
    "notifications": {"email": true, "push": true, "sms": false},
    "theme": "dark",
    "language": "en",
    "timezone": "Asia/Kolkata"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== BUSINESSES ====================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  place_id TEXT,
  currency TEXT DEFAULT 'INR',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  gstin TEXT,
  website TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{
    "auto_reply": true,
    "business_hours": {
      "enabled": true,
      "timezone": "Asia/Kolkata",
      "schedule": {
        "monday": {"open": "09:00", "close": "18:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
        "thursday": {"open": "09:00", "close": "18:00", "closed": false},
        "friday": {"open": "09:00", "close": "18:00", "closed": false},
        "saturday": {"open": "09:00", "close": "14:00", "closed": false},
        "sunday": {"open": "10:00", "close": "14:00", "closed": true}
      }
    },
    "auto_invoice": true,
    "tax_rate": 18,
    "currency_format": "₹"
  }',
  integrations JSONB DEFAULT '{}',
  departments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== DEPARTMENTS ====================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('support', 'sales', 'marketing', 'finance', 'operations', 'hr')),
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  agents JSONB DEFAULT '[]',
  tools TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"tasks_today": 0, "completed_today": 0, "pending": 0, "avg_response_time": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CONVERSATIONS ====================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'instagram', 'sms', 'web')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'assigned')),
  assigned_to UUID,
  department TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== MESSAGES ====================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'ai', 'system')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'document', 'audio', 'location', 'contact', 'template')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TASKS ====================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'waiting_approval', 'completed', 'failed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID,
  created_by UUID,
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TASK STEPS ====================
CREATE TABLE task_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tool_call', 'handoff', 'approval', 'notification', 'data_fetch', 'data_write')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INVENTORY ====================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL,
  category TEXT,
  unit TEXT DEFAULT 'pcs',
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER,
  supplier TEXT,
  barcode TEXT,
  images TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== LEADS ====================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('whatsapp', 'email', 'phone', 'web', 'referral', 'walkin', 'social')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  next_follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CUSTOMERS ====================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  address TEXT,
  gstin TEXT,
  tags TEXT[] DEFAULT '{}',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INVOICES ====================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'approval', 'task', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- ==================== WEBHOOK EVENTS ====================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('razorpay', 'stripe', 'shopify', 'woocommerce', 'zoho', 'hubspot', 'slack', 'whatsapp', 'gmail')),
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ANALYTICS ====================
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue_assisted NUMERIC DEFAULT 0,
  customers_helped INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  orders_closed INTEGER DEFAULT 0,
  hours_saved NUMERIC DEFAULT 0,
  messages_answered INTEGER DEFAULT 0,
  avg_response_time NUMERIC DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  automations_completed INTEGER DEFAULT 0,
  department_stats JSONB DEFAULT '{}',
  top_agents JSONB DEFAULT '[]',
  UNIQUE(business_id, date)
);

-- ==================== KNOWLEDGE BASE ====================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('products', 'services', 'faqs', 'inventory', 'payments', 'policies', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== AI WORKFLOW EXECUTIONS ====================
CREATE TABLE ai_workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('message', 'schedule', 'webhook', 'manual')),
  trigger_data JSONB NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  steps JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT
);

-- ==================== INDEXES ====================
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_business_id ON user_profiles(business_id);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_departments_business_id ON departments(business_id);
CREATE INDEX idx_conversations_business_id ON conversations(business_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_tasks_business_id ON tasks(business_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_inventory_business_id ON inventory(business_id);
CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_webhook_events_business_id ON webhook_events(business_id);
CREATE INDEX idx_analytics_daily_business_id_date ON analytics_daily(business_id, date);
CREATE INDEX idx_knowledge_base_business_id ON knowledge_base(business_id);
CREATE INDEX idx_ai_workflow_executions_business_id ON ai_workflow_executions(business_id);

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflow_executions ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth_user_id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth_user_id = auth.uid()::text);

-- Businesses: owners can see their businesses
CREATE POLICY "Owners can view their businesses" ON businesses
  FOR SELECT USING (owner_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

CREATE POLICY "Owners can insert businesses" ON businesses
  FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

CREATE POLICY "Owners can update their businesses" ON businesses
  FOR UPDATE USING (owner_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

-- Departments: accessible via business ownership
CREATE POLICY "Business departments access" ON departments
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

-- Similar policies for other tables...
CREATE POLICY "Business conversations access" ON conversations
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business messages access" ON messages
  FOR ALL USING (conversation_id IN (
    SELECT id FROM conversations WHERE business_id IN (
      SELECT id FROM businesses WHERE owner_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
      )
    )
  ));

CREATE POLICY "Business tasks access" ON tasks
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business inventory access" ON inventory
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business leads access" ON leads
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business customers access" ON customers
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business invoices access" ON invoices
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business notifications access" ON notifications
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business analytics access" ON analytics_daily
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business knowledge access" ON knowledge_base
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Business workflows access" ON ai_workflow_executions
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    )
  ));

-- ==================== TRIGGERS ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
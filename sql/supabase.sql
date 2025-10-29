-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  merchant_id uuid,
  action character varying NOT NULL,
  entity_type character varying NOT NULL,
  entity_id uuid NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address character varying,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT audit_logs_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.branches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL,
  name character varying NOT NULL,
  address text,
  city character varying,
  state character varying,
  postal_code character varying,
  phone character varying,
  qr_code character varying NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT branches_pkey PRIMARY KEY (id),
  CONSTRAINT branches_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  points integer NOT NULL,
  challenge_type character varying NOT NULL,
  target_value integer,
  is_repeatable boolean DEFAULT true,
  max_completions_per_day integer DEFAULT 1,
  max_completions_total integer,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.checkins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  challenge_id uuid,
  points_earned integer DEFAULT 0,
  checkin_method character varying DEFAULT 'qr_code'::character varying,
  metadata jsonb,
  is_validated boolean DEFAULT true,
  validated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT checkins_pkey PRIMARY KEY (id),
  CONSTRAINT checkins_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT checkins_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT checkins_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT checkins_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT checkins_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.users(id)
);
CREATE TABLE public.customer_merchants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  points_balance integer DEFAULT 0,
  visits_count integer DEFAULT 0,
  first_visit_at timestamp with time zone,
  last_visit_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_merchants_pkey PRIMARY KEY (id),
  CONSTRAINT customer_merchants_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT customer_merchants_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  phone character varying NOT NULL UNIQUE,
  name character varying,
  email character varying,
  birth_date date,
  gender character varying,
  total_points integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  visits_count integer DEFAULT 0,
  first_visit_at timestamp with time zone,
  last_visit_at timestamp with time zone,
  engagement_score integer DEFAULT 0,
  opt_in_marketing boolean DEFAULT false,
  is_active boolean DEFAULT true,
  blocked_reason character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gift_card_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL,
  name character varying NOT NULL,
  points_required integer NOT NULL,
  reward_value numeric NOT NULL,
  reward_description text,
  max_per_customer integer,
  expiration_days integer DEFAULT 365,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gift_card_rules_pkey PRIMARY KEY (id),
  CONSTRAINT gift_card_rules_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.gift_cards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  gift_card_rule_id uuid,
  code character varying NOT NULL UNIQUE,
  points_cost integer NOT NULL,
  reward_value numeric NOT NULL,
  status character varying DEFAULT 'available'::character varying,
  expires_at timestamp with time zone NOT NULL,
  redeemed_at timestamp with time zone,
  redeemed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gift_cards_pkey PRIMARY KEY (id),
  CONSTRAINT gift_cards_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT gift_cards_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT gift_cards_gift_card_rule_id_fkey FOREIGN KEY (gift_card_rule_id) REFERENCES public.gift_card_rules(id),
  CONSTRAINT gift_cards_redeemed_by_fkey FOREIGN KEY (redeemed_by) REFERENCES public.users(id)
);
CREATE TABLE public.merchants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying,
  phone character varying,
  category character varying NOT NULL,
  business_hours jsonb,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  gift_card_config jsonb,
  CONSTRAINT merchants_pkey PRIMARY KEY (id)
);
CREATE TABLE public.point_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  transaction_type character varying NOT NULL,
  points integer NOT NULL,
  reference_id uuid,
  reference_type character varying,
  description text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT point_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT point_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT point_transactions_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT point_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.roles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  merchant_id uuid,
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  auth uuid,
  role bigint,
  first_time boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT users_auth_fkey FOREIGN KEY (auth) REFERENCES auth.users(id),
  CONSTRAINT users_role_fkey FOREIGN KEY (role) REFERENCES public.roles(id)
);
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid,
  merchant_id uuid,
  phone_number character varying NOT NULL,
  message_type character varying NOT NULL,
  content text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  whatsapp_message_id character varying,
  error_message text,
  retry_count integer DEFAULT 0,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id),
  CONSTRAINT whatsapp_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT whatsapp_messages_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
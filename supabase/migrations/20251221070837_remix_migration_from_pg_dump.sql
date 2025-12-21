CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.request_status AS ENUM (
    'pending',
    'site_verified',
    'saplings_arranged',
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: generate_tracking_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_tracking_id() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'HMS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.tree_plantation_requests WHERE tracking_id = new_id) INTO id_exists;
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$;


--
-- Name: generate_waste_tracking_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_waste_tracking_id() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'WMS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.waste_management_requests WHERE tracking_id = new_id) INTO id_exists;
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL,
    tree_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_price numeric(10,2) NOT NULL,
    status public.request_status DEFAULT 'pending'::public.request_status,
    delivery_location text NOT NULL,
    notes text,
    district text,
    state text,
    CONSTRAINT quantity_positive CHECK ((quantity > 0))
);


--
-- Name: plantation_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plantation_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    request_id uuid,
    order_id uuid,
    photo_url text NOT NULL,
    caption text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    uploaded_by uuid NOT NULL,
    CONSTRAINT check_request_or_order CHECK ((((request_id IS NOT NULL) AND (order_id IS NULL)) OR ((request_id IS NULL) AND (order_id IS NOT NULL))))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: tree_plantation_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tree_plantation_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tracking_id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    location text NOT NULL,
    tree_type text NOT NULL,
    quantity integer NOT NULL,
    message text,
    status public.request_status DEFAULT 'pending'::public.request_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    latitude numeric(10,8),
    longitude numeric(11,8)
);


--
-- Name: trees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    scientific_name text,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    image_url text,
    stock_quantity integer DEFAULT 0 NOT NULL,
    category text NOT NULL,
    growth_rate text,
    max_height text,
    is_active boolean DEFAULT true,
    name_hi text,
    description_hi text,
    category_hi text
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    district text,
    state text
);


--
-- Name: waste_management_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waste_management_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tracking_id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    pickup_date date NOT NULL,
    waste_type text NOT NULL,
    estimated_quantity text,
    message text,
    status public.request_status DEFAULT 'pending'::public.request_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    district text,
    state text
);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: plantation_photos plantation_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantation_photos
    ADD CONSTRAINT plantation_photos_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: tree_plantation_requests tree_plantation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tree_plantation_requests
    ADD CONSTRAINT tree_plantation_requests_pkey PRIMARY KEY (id);


--
-- Name: tree_plantation_requests tree_plantation_requests_tracking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tree_plantation_requests
    ADD CONSTRAINT tree_plantation_requests_tracking_id_key UNIQUE (tracking_id);


--
-- Name: trees trees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trees
    ADD CONSTRAINT trees_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: waste_management_requests waste_management_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_management_requests
    ADD CONSTRAINT waste_management_requests_pkey PRIMARY KEY (id);


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tree_plantation_requests update_tree_plantation_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tree_plantation_requests_updated_at BEFORE UPDATE ON public.tree_plantation_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: trees update_trees_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_trees_updated_at BEFORE UPDATE ON public.trees FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: waste_management_requests update_waste_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_waste_requests_updated_at BEFORE UPDATE ON public.waste_management_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: orders orders_tree_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tree_id_fkey FOREIGN KEY (tree_id) REFERENCES public.trees(id) ON DELETE RESTRICT;


--
-- Name: plantation_photos plantation_photos_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantation_photos
    ADD CONSTRAINT plantation_photos_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: plantation_photos plantation_photos_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantation_photos
    ADD CONSTRAINT plantation_photos_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.tree_plantation_requests(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tree_plantation_requests tree_plantation_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tree_plantation_requests
    ADD CONSTRAINT tree_plantation_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: plantation_photos Admins can manage all photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all photos" ON public.plantation_photos USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: trees Admins can manage trees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage trees" ON public.trees USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tree_plantation_requests Admins can update any request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any request" ON public.tree_plantation_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: waste_management_requests Admins can update any request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any request" ON public.waste_management_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can update orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins can view all contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all contact messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can view all orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tree_plantation_requests Admins can view all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all requests" ON public.tree_plantation_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: waste_management_requests Admins can view all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all requests" ON public.waste_management_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Anyone can create contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: trees Anyone can view active trees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active trees" ON public.trees FOR SELECT USING ((is_active = true));


--
-- Name: plantation_photos Anyone can view plantation photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view plantation photos" ON public.plantation_photos FOR SELECT USING (true);


--
-- Name: plantation_photos Authenticated users can upload photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can upload photos" ON public.plantation_photos FOR INSERT WITH CHECK ((auth.uid() = uploaded_by));


--
-- Name: tree_plantation_requests Users can create requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create requests" ON public.tree_plantation_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: orders Users can create their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: waste_management_requests Users can create their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own requests" ON public.waste_management_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: orders Users can view their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: tree_plantation_requests Users can view their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own requests" ON public.tree_plantation_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: waste_management_requests Users can view their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own requests" ON public.waste_management_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: plantation_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plantation_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tree_plantation_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tree_plantation_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: trees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: waste_management_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waste_management_requests ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;
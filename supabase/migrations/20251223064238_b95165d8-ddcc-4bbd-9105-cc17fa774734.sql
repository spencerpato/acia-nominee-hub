-- Create role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'creator');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

-- Creators table (public profiles for nominees)
CREATE TABLE public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  alias TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  category_id UUID REFERENCES public.categories(id),
  profile_photo_url TEXT,
  bio TEXT,
  is_approved BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved creators are publicly readable"
  ON public.creators FOR SELECT
  USING (is_approved = true AND is_active = true);

CREATE POLICY "Creators can view their own profile"
  ON public.creators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can update their own profile"
  ON public.creators FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their profile"
  ON public.creators FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all creators"
  ON public.creators FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

-- Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  voter_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are publicly insertable"
  ON public.votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Votes are publicly readable"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage votes"
  ON public.votes FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

-- Gallery table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery is publicly readable"
  ON public.gallery FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

-- Function to increment vote count
CREATE OR REPLACE FUNCTION public.increment_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.creators
  SET vote_count = vote_count + 1
  WHERE id = NEW.creator_id;
  RETURN NEW;
END;
$$;

-- Trigger for vote count
CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_vote_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for creators updated_at
CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to assign creator role on signup
CREATE OR REPLACE FUNCTION public.handle_new_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'creator');
  RETURN NEW;
END;
$$;

-- Trigger to assign creator role
CREATE TRIGGER on_creator_created
  AFTER INSERT ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_creator();

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Music', 'Artists and musicians making impact through their sound'),
  ('Comedy', 'Comedians bringing joy and laughter to Africa'),
  ('Fashion', 'Fashion influencers shaping African style'),
  ('Tech', 'Tech creators and innovators'),
  ('Lifestyle', 'Lifestyle and wellness influencers'),
  ('Education', 'Educators and knowledge sharers'),
  ('Sports', 'Sports personalities and athletes'),
  ('Business', 'Business and entrepreneurship influencers');
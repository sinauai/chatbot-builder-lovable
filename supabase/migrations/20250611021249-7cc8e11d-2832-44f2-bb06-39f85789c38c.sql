
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username TEXT,
  github_avatar_url TEXT,
  github_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create repositories table for template repositories
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_repo_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_repositories table for copied repositories
CREATE TABLE public.user_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_repo_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_repo_url TEXT NOT NULL,
  chatbot_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot_config table for title and subtitle
CREATE TABLE public.chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_repo_id UUID REFERENCES public.user_repositories(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Halo, Sahabat Kompas',
  subtitle TEXT DEFAULT 'Silakan ajukan pertanyaan terkait artikel yang Anda baca. Jawaban dibuat berdasarkan berita di Kompas.id.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_repo_id)
);

-- Create news table for knowledge base
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_repo_id UUID REFERENCES public.user_repositories(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  published_at TEXT NOT NULL, -- Format dd/mm/yyyy
  title TEXT NOT NULL,
  full_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table for example questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_repo_id UUID REFERENCES public.user_repositories(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for repositories (admin only can manage)
CREATE POLICY "Admins can manage repositories"
  ON public.repositories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active repositories"
  ON public.repositories FOR SELECT
  USING (is_active = TRUE);

-- RLS Policies for user_repositories
CREATE POLICY "Users can manage their own repositories"
  ON public.user_repositories FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for chatbot_config
CREATE POLICY "Users can manage their chatbot config"
  ON public.chatbot_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_repositories ur 
      WHERE ur.id = user_repo_id AND ur.user_id = auth.uid()
    )
  );

-- RLS Policies for news
CREATE POLICY "Users can manage their news"
  ON public.news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_repositories ur 
      WHERE ur.id = user_repo_id AND ur.user_id = auth.uid()
    )
  );

-- RLS Policies for questions
CREATE POLICY "Users can manage their questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_repositories ur 
      WHERE ur.id = user_repo_id AND ur.user_id = auth.uid()
    )
  );

-- Create trigger function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, github_username, github_avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

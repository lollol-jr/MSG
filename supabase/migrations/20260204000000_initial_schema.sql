-- MSG AI Messenger - Initial Database Schema
-- Created: 2026-02-04

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Profiles Table
-- ============================================
-- 사용자 프로필 및 설정 (Supabase auth.users 확장)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  anthropic_api_key text, -- 암호화된 API 키
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.profiles enable row level security;

-- RLS 정책: 사용자는 자신의 프로필만 읽기/수정 가능
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- Conversations Table
-- ============================================
-- 대화 세션
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'New Conversation',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스
create index conversations_user_id_idx on public.conversations(user_id);
create index conversations_created_at_idx on public.conversations(created_at desc);

-- RLS 활성화
alter table public.conversations enable row level security;

-- RLS 정책: 사용자는 자신의 대화만 접근 가능
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- ============================================
-- Messages Table
-- ============================================
-- 메시지 히스토리
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스
create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_created_at_idx on public.messages(created_at);

-- RLS 활성화
alter table public.messages enable row level security;

-- RLS 정책: 사용자는 자신의 대화 메시지만 접근 가능
create policy "Users can view own messages"
  on public.messages for select
  using (
    auth.uid() = (
      select user_id from public.conversations
      where id = messages.conversation_id
    )
  );

create policy "Users can create own messages"
  on public.messages for insert
  with check (
    auth.uid() = (
      select user_id from public.conversations
      where id = messages.conversation_id
    )
  );

create policy "Users can delete own messages"
  on public.messages for delete
  using (
    auth.uid() = (
      select user_id from public.conversations
      where id = messages.conversation_id
    )
  );

-- ============================================
-- Files Table
-- ============================================
-- 파일 업로드 메타데이터
create table public.files (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.messages on delete cascade not null,
  file_name text not null,
  file_path text not null, -- Supabase Storage 경로
  file_size integer not null,
  mime_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스
create index files_message_id_idx on public.files(message_id);

-- RLS 활성화
alter table public.files enable row level security;

-- RLS 정책: 사용자는 자신의 파일만 접근 가능
create policy "Users can view own files"
  on public.files for select
  using (
    auth.uid() = (
      select c.user_id
      from public.conversations c
      join public.messages m on m.conversation_id = c.id
      where m.id = files.message_id
    )
  );

create policy "Users can create own files"
  on public.files for insert
  with check (
    auth.uid() = (
      select c.user_id
      from public.conversations c
      join public.messages m on m.conversation_id = c.id
      where m.id = files.message_id
    )
  );

create policy "Users can delete own files"
  on public.files for delete
  using (
    auth.uid() = (
      select c.user_id
      from public.conversations c
      join public.messages m on m.conversation_id = c.id
      where m.id = files.message_id
    )
  );

-- ============================================
-- Functions & Triggers
-- ============================================

-- 자동 updated_at 갱신 함수
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles updated_at 트리거
create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Conversations updated_at 트리거
create trigger on_conversations_updated
  before update on public.conversations
  for each row
  execute function public.handle_updated_at();

-- 신규 사용자 자동 프로필 생성 함수
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Auth 사용자 생성 시 자동 프로필 생성 트리거
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- Storage Buckets
-- ============================================

-- 파일 업로드용 버킷 생성 (Supabase Dashboard 또는 별도 실행)
-- insert into storage.buckets (id, name, public)
-- values ('chat-files', 'chat-files', false);

-- Storage 정책은 Supabase Dashboard에서 설정하거나 별도 마이그레이션 필요

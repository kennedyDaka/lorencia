# Lorencia Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and keys:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: Found in Settings > API
   - **Service Role Key**: Found in Settings > API (keep secret!)

## Step 2: Run Migration

1. Go to SQL Editor in Supabase Dashboard
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration

## Step 3: Create Your First User

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add user"
3. Enter email and password
4. The trigger will auto-create a profile and assign "owner" role

## Step 4: Configure Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Frontend (.env)
```
VITE_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
VITE_API_URL=http://localhost:3000
```

## Step 5: Seed Database

```bash
cd backend
npx prisma db push
npx prisma db seed
```

## Step 6: Assign Business IDs

After seeding, get your business IDs:
```bash
npx prisma studio
```

Copy the business IDs and add them to frontend `.env`:
```
VITE_CAFE_BUSINESS_ID=<cafe-uuid>
VITE_GIFT_SHOP_BUSINESS_ID=<gift-shop-uuid>
```

## Step 7: Assign User Roles

In Prisma Studio, add a user_role entry:
- user_id: your auth user UUID
- role: "owner"
- business_id: null (for global access) or specific business ID

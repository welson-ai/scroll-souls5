-- Create therapists table for self-registration
CREATE TABLE IF NOT EXISTS therapists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    license_number TEXT NOT NULL,
    specialization TEXT NOT NULL,
    years_of_experience INTEGER NOT NULL,
    bio TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    approach TEXT,
    availability TEXT,
    session_rate TEXT,
    profile_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Create therapist_bookings table
CREATE TABLE IF NOT EXISTS therapist_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('video', 'audio', 'chat', 'in-person')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapist_messages table for chat
CREATE TABLE IF NOT EXISTS therapist_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('therapist', 'user')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapists table
CREATE POLICY "Anyone can view approved therapists" ON therapists
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own therapist application" ON therapists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own therapist application" ON therapists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending application" ON therapists
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for therapist_bookings
CREATE POLICY "Users can view their own bookings" ON therapist_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Therapists can view their bookings" ON therapist_bookings
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM therapists WHERE id = therapist_id));

CREATE POLICY "Users can create bookings" ON therapist_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON therapist_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for therapist_messages
CREATE POLICY "Users can view their own messages" ON therapist_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Therapists can view their messages" ON therapist_messages
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM therapists WHERE id = therapist_id));

CREATE POLICY "Users can send messages" ON therapist_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

CREATE POLICY "Therapists can send messages" ON therapist_messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM therapists WHERE id = therapist_id) 
        AND sender_type = 'therapist'
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapists_status ON therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapists_user_id ON therapists(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON therapist_bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON therapist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_therapist_user ON therapist_messages(therapist_id, user_id);

-- Add course_id to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES course(id);

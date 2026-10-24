-- Runs only the FIRST time the named volume is empty
CREATE TABLE IF NOT EXISTS volume_demo (
    id SERIAL PRIMARY KEY,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO volume_demo (note) VALUES ('Created on first start');

-- 議論に前提を追加
ALTER TABLE discussions ADD COLUMN premise TEXT NOT NULL AFTER theme;

-- プロジェクトに前提を追加
ALTER TABLE projects ADD COLUMN premise TEXT NOT NULL AFTER name;

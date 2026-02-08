-- 議論に前提を追加
ALTER TABLE discussions ADD COLUMN preconditions TEXT NOT NULL AFTER theme;

-- プロジェクトに前提を追加
ALTER TABLE projects ADD COLUMN preconditions TEXT NOT NULL AFTER name;

-- 議論の前提を削除
ALTER TABLE discussions DROP COLUMN premise;

-- プロジェクトの前提を削除
ALTER TABLE projects DROP COLUMN premise;

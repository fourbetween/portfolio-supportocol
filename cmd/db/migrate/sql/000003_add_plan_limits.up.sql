-- 料金プランに制限項目を追加
ALTER TABLE plans ADD COLUMN max_projects INT NOT NULL DEFAULT 20 AFTER monthly_ai_limit;
ALTER TABLE plans ADD COLUMN max_favorites INT NOT NULL DEFAULT 100 AFTER max_projects;

-- 料金プランの制限項目を削除
ALTER TABLE plans DROP COLUMN max_favorites;
ALTER TABLE plans DROP COLUMN max_projects;

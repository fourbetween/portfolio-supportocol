CREATE TABLE workbooks (
	id VARCHAR NOT NULL,
	title VARCHAR NOT NULL,
	status VARCHAR NOT NULL,
	owner_id VARCHAR NOT NULL,
	CONSTRAINT workbooks_pk PRIMARY KEY (id)
);

-- プロジェクト
CREATE TABLE projects (
	id VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	created_by VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT projects_pk PRIMARY KEY (id)
);

CREATE INDEX projects_created_by_idx ON projects(created_by);

-- ルール
CREATE TABLE rules (
	id VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	description TEXT NOT NULL,
	created_by VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT rules_pk PRIMARY KEY (id)
);

-- 議論
CREATE TABLE discussions (
	id VARCHAR NOT NULL,
	project_id VARCHAR,
	theme VARCHAR NOT NULL,
	background TEXT NOT NULL,
	conclusion TEXT NOT NULL,
	rule_id VARCHAR NOT NULL,
	visibility_level VARCHAR NOT NULL, -- 'everyone', 'authenticated', 'owner'
	comment_permission_level VARCHAR NOT NULL, -- 'everyone', 'authenticated', 'owner'
	created_by VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	status VARCHAR NOT NULL, -- 'open', 'closed', 'archived'
	CONSTRAINT discussions_pk PRIMARY KEY (id),
	CONSTRAINT discussions_projects_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
	CONSTRAINT discussions_rules_fk FOREIGN KEY (rule_id) REFERENCES rules(id)
);

-- コメント種類
CREATE TABLE comment_types (
	id VARCHAR NOT NULL,
	rule_id VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	description TEXT NOT NULL,
	color VARCHAR NOT NULL,
	CONSTRAINT comment_types_pk PRIMARY KEY (id),
	CONSTRAINT comment_types_rules_fk FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE
);

-- コメント種類間の経路
CREATE TABLE comment_type_paths (
	id VARCHAR NOT NULL,
	rule_id VARCHAR NOT NULL,
	from_comment_type_id VARCHAR NOT NULL,
	to_comment_type_id VARCHAR NOT NULL,
	CONSTRAINT comment_type_paths_pk PRIMARY KEY (id),
	CONSTRAINT comment_type_paths_rules_fk FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
	CONSTRAINT comment_type_paths_from_fk FOREIGN KEY (from_comment_type_id) REFERENCES comment_types(id) ON DELETE CASCADE,
	CONSTRAINT comment_type_paths_to_fk FOREIGN KEY (to_comment_type_id) REFERENCES comment_types(id) ON DELETE CASCADE
);

-- コメント
CREATE TABLE comments (
	id VARCHAR NOT NULL,
	discussion_id VARCHAR NOT NULL,
	parent_comment_id VARCHAR,
	comment_type_id VARCHAR NOT NULL,
	content TEXT NOT NULL,
	posted_by VARCHAR NOT NULL,
	posted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	status VARCHAR NOT NULL, -- 'unassigned', 'assigned', 'archived', 'deleted'
	CONSTRAINT comments_pk PRIMARY KEY (id),
	CONSTRAINT comments_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
	CONSTRAINT comments_parent_fk FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	CONSTRAINT comments_comment_types_fk FOREIGN KEY (comment_type_id) REFERENCES comment_types(id)
);

-- ノート
CREATE TABLE notes (
	id VARCHAR NOT NULL,
	discussion_id VARCHAR NOT NULL,
	content TEXT NOT NULL,
	posted_by VARCHAR NOT NULL,
	posted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT notes_pk PRIMARY KEY (id),
	CONSTRAINT notes_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
);

-- 指摘
CREATE TABLE issues (
	id VARCHAR NOT NULL,
	comment_id VARCHAR NOT NULL,
	issue_type VARCHAR NOT NULL,
	description TEXT NOT NULL,
	created_by VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT issues_pk PRIMARY KEY (id),
	CONSTRAINT issues_comments_fk FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);
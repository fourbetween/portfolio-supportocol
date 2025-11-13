CREATE TABLE workbooks (
	id VARCHAR NOT NULL,
	title VARCHAR NOT NULL,
	status VARCHAR NOT NULL,
	owner_id VARCHAR NOT NULL,
	CONSTRAINT workbooks_pk PRIMARY KEY (id)
);

-- グループ
CREATE TABLE groups (
	id VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	description TEXT NOT NULL,
	created_by VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT groups_pk PRIMARY KEY (id)
);

-- グループメンバー
CREATE TABLE group_members (
	group_id VARCHAR NOT NULL,
	user_id VARCHAR NOT NULL,
	joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT group_members_pk PRIMARY KEY (group_id, user_id),
	CONSTRAINT group_members_groups_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- 議論
CREATE TABLE discussions (
	id VARCHAR NOT NULL,
	theme VARCHAR NOT NULL,
	background TEXT NOT NULL,
	visibility_level VARCHAR NOT NULL, -- 'everyone', 'authenticated', 'owner', 'group'
	comment_permission_level VARCHAR NOT NULL, -- 'everyone', 'authenticated', 'owner', 'group'
	group_id VARCHAR,
	created_by VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT discussions_pk PRIMARY KEY (id),
	CONSTRAINT discussions_groups_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

-- コメント種類
CREATE TABLE comment_types (
	id VARCHAR NOT NULL,
	discussion_id VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	description TEXT NOT NULL,
	CONSTRAINT comment_types_pk PRIMARY KEY (id),
	CONSTRAINT comment_types_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
);

-- コメント種類間の経路
CREATE TABLE comment_type_paths (
	id VARCHAR NOT NULL,
	discussion_id VARCHAR NOT NULL,
	from_comment_type_id VARCHAR NOT NULL,
	to_comment_type_id VARCHAR NOT NULL,
	CONSTRAINT comment_type_paths_pk PRIMARY KEY (id),
	CONSTRAINT comment_type_paths_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
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
CREATE TABLE users (
	id CHAR(36) NOT NULL,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255),
	google_sub VARCHAR(255),
	email_verified_at DATETIME,
	email_verify_token_hash VARCHAR(64),
	email_verify_token_expires_at DATETIME,
	password_reset_token_hash VARCHAR(64),
	password_reset_token_expires_at DATETIME,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE KEY (email),
	UNIQUE KEY (google_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- プロジェクト
CREATE TABLE projects (
	id CHAR(36) NOT NULL,
	name VARCHAR(255) NOT NULL,
	created_by CHAR(36) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	INDEX projects_created_by_idx (created_by),
	CONSTRAINT projects_users_fk FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ルール
CREATE TABLE rules (
	id CHAR(36) NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	created_by CHAR(36) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT rules_users_fk FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 議論
CREATE TABLE discussions (
	id CHAR(36) NOT NULL,
	theme VARCHAR(255) NOT NULL,
	background TEXT NOT NULL,
	conclusion TEXT NOT NULL,
	rule_id CHAR(36) NOT NULL,
	visibility_level VARCHAR(20) NOT NULL, -- 'everyone', 'authenticated', 'owner'
	comment_permission_level VARCHAR(20) NOT NULL, -- 'everyone', 'authenticated', 'owner'
	created_by CHAR(36) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	status VARCHAR(20) NOT NULL, -- 'open', 'closed', 'archived'
	PRIMARY KEY (id),
	CONSTRAINT discussions_rules_fk FOREIGN KEY (rule_id) REFERENCES rules(id),
	CONSTRAINT discussions_users_fk FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- プロジェクトと議論の関係
CREATE TABLE project_discussions (
	project_id CHAR(36) NOT NULL,
	discussion_id CHAR(36) NOT NULL,
	added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (project_id, discussion_id),
	CONSTRAINT project_discussions_projects_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
	CONSTRAINT project_discussions_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- コメント種類
CREATE TABLE comment_types (
	id CHAR(36) NOT NULL,
	rule_id CHAR(36) NOT NULL,
	no INT NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	color VARCHAR(20) NOT NULL,
	root TINYINT(1) NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT comment_types_rules_fk FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- コメント種類間の経路
CREATE TABLE comment_type_paths (
	rule_id CHAR(36) NOT NULL,
	child_comment_type_id CHAR(36) NOT NULL,
	parent_comment_type_id CHAR(36) NOT NULL,
	PRIMARY KEY (rule_id, child_comment_type_id, parent_comment_type_id),
	CONSTRAINT comment_type_paths_rules_fk FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
	CONSTRAINT comment_type_paths_child_fk FOREIGN KEY (child_comment_type_id) REFERENCES comment_types(id) ON DELETE CASCADE,
	CONSTRAINT comment_type_paths_parent_fk FOREIGN KEY (parent_comment_type_id) REFERENCES comment_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- コメント
CREATE TABLE comments (
	id CHAR(36) NOT NULL,
	discussion_id CHAR(36) NOT NULL,
	parent_comment_id CHAR(36),
	comment_type_id CHAR(36) NOT NULL,
	content TEXT NOT NULL,
	posted_by CHAR(36) NOT NULL,
	posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	status VARCHAR(20) NOT NULL, -- 'unassigned', 'assigned', 'archived', 'deleted'
	PRIMARY KEY (id),
	CONSTRAINT comments_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
	CONSTRAINT comments_parent_fk FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	CONSTRAINT comments_comment_types_fk FOREIGN KEY (comment_type_id) REFERENCES comment_types(id),
	CONSTRAINT comments_users_fk FOREIGN KEY (posted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ノート
CREATE TABLE notes (
	id CHAR(36) NOT NULL,
	discussion_id CHAR(36) NOT NULL,
	content TEXT NOT NULL,
	posted_by CHAR(36) NOT NULL,
	posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT notes_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
	CONSTRAINT notes_users_fk FOREIGN KEY (posted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 指摘
CREATE TABLE issues (
	id CHAR(36) NOT NULL,
	comment_id CHAR(36) NOT NULL,
	issue_type VARCHAR(20) NOT NULL,
	description TEXT NOT NULL,
	created_by CHAR(36) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT issues_comments_fk FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	CONSTRAINT issues_users_fk FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
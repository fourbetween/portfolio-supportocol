-- ユーザー
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
	UNIQUE KEY (google_sub),
	UNIQUE KEY (email_verify_token_hash),
	UNIQUE KEY (password_reset_token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ワークスペース
CREATE TABLE workspaces (
	id CHAR(36) NOT NULL,
	slug VARCHAR(64) NOT NULL,
	name VARCHAR(255) NOT NULL,
	type VARCHAR(20) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE KEY (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ワークスペースメンバー
CREATE TABLE members (
	workspace_id CHAR(36) NOT NULL,
	user_id CHAR(36) NOT NULL,
	role VARCHAR(20) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (workspace_id, user_id),
	CONSTRAINT members_workspaces_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT members_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- プロジェクト
CREATE TABLE projects (
	id CHAR(36) NOT NULL,
	workspace_id CHAR(36) NOT NULL,
	name VARCHAR(255) NOT NULL,
	is_default BOOLEAN NOT NULL DEFAULT FALSE,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT projects_workspaces_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 議論
CREATE TABLE discussions (
	id CHAR(36) NOT NULL,
	workspace_id CHAR(36) NOT NULL,
	project_id CHAR(36) NOT NULL,
	theme VARCHAR(255) NOT NULL,
	conclusion TEXT NOT NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'private',
	comments_count INT NOT NULL DEFAULT 0,
	proposed_comments_count INT NOT NULL DEFAULT 0,
	issues_count INT NOT NULL DEFAULT 0,
	last_commented_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	archived_at DATETIME,
	created_by CHAR(36) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT discussions_workspaces_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT discussions_projects_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
	CONSTRAINT discussions_users_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
	INDEX idx_discussions_workspace_project_activity (workspace_id, project_id, last_commented_at DESC),
	INDEX idx_discussions_public_feed (status, last_commented_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- コメント
CREATE TABLE comments (
	id CHAR(36) NOT NULL,
	discussion_id CHAR(36) NOT NULL,
	parent_comment_id CHAR(36),
	type VARCHAR(20) NOT NULL,
	content TEXT NOT NULL,
	status VARCHAR(20) NOT NULL,
	archived_at DATETIME,
	created_by CHAR(36),
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT comments_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
	CONSTRAINT comments_parent_fk FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	CONSTRAINT comments_users_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- コメントへの指摘
CREATE TABLE comment_issues (
	id CHAR(36) NOT NULL,
	comment_id CHAR(36) NOT NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	created_by CHAR(36),
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT comment_issues_comments_fk FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	CONSTRAINT comment_issues_users_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 対話設定
CREATE TABLE dialogue_settings (
	discussion_id CHAR(36) NOT NULL,
	comment_frame JSON NOT NULL,
	comment_permission VARCHAR(20) NOT NULL,
	issue_permission VARCHAR(20) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (discussion_id),
	CONSTRAINT dialogue_settings_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
	UNIQUE KEY (google_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 議論
CREATE TABLE discussions (
	id CHAR(36) NOT NULL,
	theme VARCHAR(255) NOT NULL,
	conclusion TEXT NOT NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'private',
	comments_count INT NOT NULL DEFAULT 0,
	last_commented_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	archived_at DATETIME,
	created_by CHAR(36) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT discussions_users_fk FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- コメント
CREATE TABLE comments (
	id CHAR(36) NOT NULL,
	discussion_id CHAR(36) NOT NULL,
	parent_comment_id CHAR(36),
	comment_type VARCHAR(20) NOT NULL,
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

-- 対話設定
CREATE TABLE dialogue_settings (
	discussion_id CHAR(36) NOT NULL,
	comment_frame JSON NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (discussion_id),
	CONSTRAINT dialogue_settings_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
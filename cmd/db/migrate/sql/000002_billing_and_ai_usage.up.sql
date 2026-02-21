-- 料金プラン
CREATE TABLE plans (
	id CHAR(36) NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	monthly_ai_limit INT NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ワークスペースの購読
CREATE TABLE subscriptions (
	workspace_id CHAR(36) NOT NULL,
	plan_id CHAR(36) NOT NULL,
	status VARCHAR(20) NOT NULL,
	current_period_start DATETIME NOT NULL,
	current_period_end DATETIME NOT NULL,
    stripe_subscription_id VARCHAR(255),
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (workspace_id),
	CONSTRAINT subscriptions_workspaces_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT subscriptions_plans_fk FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI利用ログ
CREATE TABLE ai_usage_logs (
	id CHAR(36) NOT NULL,
	workspace_id CHAR(36) NOT NULL,
	discussion_id CHAR(36),
	tokens INT NOT NULL DEFAULT 0,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	INDEX idx_ai_usage_workspace_created (workspace_id, created_at),
	CONSTRAINT ai_usage_workspaces_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT ai_usage_discussions_fk FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

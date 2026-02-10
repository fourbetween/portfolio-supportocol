package usecase

import (
	"context"
	"strings"
	"testing"
)

type mockPermissionService struct {
	canAccess  bool
	isPersonal bool
	err        error
}

func (m *mockPermissionService) CanAccessWorkspace(ctx context.Context, userID, workspaceID string) (bool, error) {
	return m.canAccess, m.err
}

func (m *mockPermissionService) CanAccessProject(ctx context.Context, userID, workspaceID, projectID string) (bool, error) {
	return false, nil
}

func (m *mockPermissionService) IsPersonalWorkspace(ctx context.Context, workspaceID string) (bool, error) {
	return m.isPersonal, m.err
}

type mockTxManager struct{}

func (m *mockTxManager) RunInTx(ctx context.Context, fn func(ctx context.Context) error) error {
	// For validation tests, we don't need to run the inner function.
	return nil
}

func TestUpdateDiscussionStatusUsecase_Execute_Validation(t *testing.T) {
	tests := []struct {
		name        string
		isPersonal  bool
		status      string
		wantErr     bool
		errContains string
	}{
		{
			name:       "個人ワークスペースで public に変更できること",
			isPersonal: true,
			status:     "public",
			wantErr:    false,
		},
		{
			name:        "団体ワークスペースで public に変更できないこと",
			isPersonal:  false,
			status:      "public",
			wantErr:     true,
			errContains: "public status is only allowed for personal workspace",
		},
		{
			name:       "団体ワークスペースで internal に変更できること",
			isPersonal: false,
			status:     "internal",
			wantErr:    false,
		},
		{
			name:        "個人ワークスペースで internal に変更できないこと",
			isPersonal:  true,
			status:      "internal",
			wantErr:     true,
			errContains: "internal status is only allowed for organization workspace",
		},
		{
			name:       "個人ワークスペースで private に変更できること",
			isPersonal: true,
			status:     "private",
			wantErr:    false,
		},
		{
			name:       "団体ワークスペースで private に変更できること",
			isPersonal: false,
			status:     "private",
			wantErr:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			permSv := &mockPermissionService{
				canAccess:  true,
				isPersonal: tt.isPersonal,
			}
			u := NewUpdateDiscussionStatusUsecase(nil, nil, permSv, &mockTxManager{})

			_, err := u.Execute(context.Background(), UpdateDiscussionStatusInput{
				Status: tt.status,
			})

			if (err != nil) != tt.wantErr {
				t.Errorf("Execute() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr && tt.errContains != "" {
				if err == nil || !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("Execute() error = %v, want error containing %v", err, tt.errContains)
				}
			}
		})
	}
}

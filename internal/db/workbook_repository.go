package db

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/model"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/table"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
)

type (
	WorkbookRepository struct {
		db  qrm.DB
		fac *workbook.Factory
	}
)

func NewWorkbookRepository(
	db qrm.DB,
) *WorkbookRepository {
	return &WorkbookRepository{db: db}
}

func (r *WorkbookRepository) SetFactory(fac *workbook.Factory) {
	r.fac = fac
}

func (r *WorkbookRepository) Save(w workbook.Workbook) error {
	workbookRecord := model.Workbooks{
		ID:      w.ID(),
		Title:   w.Title(),
		Status:  string(w.Status()),
		OwnerID: w.OwnerID(),
	}

	workbookStmt := table.Workbooks.
		INSERT(table.Workbooks.AllColumns).
		MODEL(workbookRecord).
		ON_CONFLICT(table.Workbooks.ID).
		DO_UPDATE(
			postgres.SET(
				table.Workbooks.Title.SET(table.Workbooks.EXCLUDED.Title),
				table.Workbooks.Status.SET(table.Workbooks.EXCLUDED.Status),
				table.Workbooks.OwnerID.SET(table.Workbooks.EXCLUDED.OwnerID),
			),
		)

	if _, err := workbookStmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save workbook: %w", err)
	}

	return nil
}

func (r *WorkbookRepository) Load(params workbook.LoadParams) (workbook.Workbook, error) {
	cond := table.Workbooks.ID.EQ(postgres.String(params.ID))
	if params.OwnerID != "" {
		cond = cond.AND(table.Workbooks.OwnerID.EQ(postgres.String(params.OwnerID)))
	}

	workbooks, err := r.searchByCondition(cond)
	if err != nil {
		return workbook.Workbook{}, err
	}
	if len(workbooks) == 0 {
		return workbook.Workbook{}, fmt.Errorf(
			"workbook id=%s, owner_id=%s not found: %w",
			params.ID,
			params.OwnerID,
			internal.ErrNotFound,
		)
	}
	return workbooks[0], nil
}

func (r *WorkbookRepository) Search(params workbook.SearchParams) ([]workbook.Workbook, error) {
	cond := postgres.Bool(true)
	if params.OwnerID != "" {
		cond = cond.AND(table.Workbooks.OwnerID.EQ(postgres.String(params.OwnerID)))
	}
	return r.searchByCondition(cond)
}

func (r *WorkbookRepository) searchByCondition(cond postgres.BoolExpression) ([]workbook.Workbook, error) {
	stmt := postgres.
		SELECT(table.Workbooks.AllColumns).
		FROM(table.Workbooks).
		WHERE(cond)

	var dest []model.Workbooks
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to query workbooks: %w", err)
	}

	if len(dest) == 0 {
		return []workbook.Workbook{}, nil
	}

	workbooks := make([]workbook.Workbook, len(dest))
	for i, row := range dest {
		workbooks[i] = r.fac.BuildWorkbook(workbook.BuildWorkbookParams{
			ID: row.ID,
			NewWorkbookParams: workbook.NewWorkbookParams{
				Title:   row.Title,
				Status:  workbook.Status(row.Status),
				OwnerID: row.OwnerID,
			},
		})
	}

	return workbooks, nil
}

package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/app"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	workspaceusecase "github.com/fourbetween/app-supportocol/internal/workspace/usecase"
	"github.com/fourbetween/pkg-conf/conf"
)

const seedWorkspaceID = "019c8fab-a633-7e0a-9861-f5c68ef05020"
const seedUserID = "019c8fab-a62c-7203-8210-633df0a30bed"

type discussionSeed struct {
	Theme    string
	Premise  string
	Comments []usecase.ReplaceCommentItem
}

var seeds = []discussionSeed{
	{
		Theme:   "毎日15分の振り返りは学習効率を上げるか",
		Premise: "短時間でも継続的な振り返りがあると、理解の抜け漏れを発見しやすくなる。",
		Comments: []usecase.ReplaceCommentItem{
			{ParentIndex: nil, CommentType: "主張", Content: "毎日15分の振り返りを取り入れるべき。"},
			{ParentIndex: new(0), CommentType: "根拠", Content: "学習ログを見返すことで、つまずきの傾向が見える。"},
			{ParentIndex: new(1), CommentType: "具体例", Content: "1週間単位で苦手分野を再学習すると、次週の正答率が上がった。"},
			{ParentIndex: new(0), CommentType: "懸念", Content: "毎日だと負担になり、継続できない人もいる。"},
			{ParentIndex: new(3), CommentType: "提案", Content: "最初は週3回から始め、習慣化したら毎日に増やす。"},
		},
	},
	{
		Theme:   "仕様レビューは実装前に全員参加で行うべきか",
		Premise: "実装前レビューで認識齟齬を減らせる一方、参加人数が多いと意思決定が遅くなる可能性がある。",
		Comments: []usecase.ReplaceCommentItem{
			{ParentIndex: nil, CommentType: "主張", Content: "全員参加は必須ではなく、責任範囲に応じた参加で十分。"},
			{ParentIndex: new(0), CommentType: "根拠", Content: "主要な影響範囲の担当者が揃えば品質は担保できる。"},
			{ParentIndex: new(0), CommentType: "反論", Content: "非参加者の視点が欠けると、運用時の課題が見落とされる。"},
			{ParentIndex: new(2), CommentType: "提案", Content: "レビュー後に要点を公開し、非参加者のコメント期間を設ける。"},
		},
	},
	{
		Theme:   "新機能リリース時にチュートリアルを必須化すべきか",
		Premise: "初回体験を改善するためにチュートリアルを導入するが、熟練ユーザーの体験阻害も考慮する必要がある。",
		Comments: []usecase.ReplaceCommentItem{
			{ParentIndex: nil, CommentType: "主張", Content: "初回のみスキップ可能なチュートリアルを表示するべき。"},
			{ParentIndex: new(0), CommentType: "根拠", Content: "新規ユーザーは導線があると主要機能の到達率が上がる。"},
			{ParentIndex: new(0), CommentType: "補足", Content: "スキップを残すことで熟練ユーザーの不満を抑えられる。"},
			{ParentIndex: new(2), CommentType: "提案", Content: "設定画面から再表示できるようにして自己学習を支援する。"},
		},
	},
}

func main() {
	ctx := context.Background()

	dbCon, err := dbcon.NewConnection()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer dbCon.Close()

	awscfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithUseDualStackEndpoint(aws.DualStackEndpointStateEnabled),
	)
	if err != nil {
		log.Fatalf("failed to load aws config: %v", err)
	}

	appConf, err := conf.NewSSMService(env.AppName(), awscfg)
	if err != nil {
		log.Fatalf("failed to load app config: %v", err)
	}

	containers, err := app.NewContainers(dbCon, appConf, awscfg, nil)
	if err != nil {
		log.Fatalf("failed to create containers: %v", err)
	}

	projectName := fmt.Sprintf("Seed Project %s", time.Now().Format("20060102150405"))
	project, err := containers.Workspace.CreateProject.Execute(ctx, workspaceusecase.CreateProjectInput{
		WorkspaceID: seedWorkspaceID,
		UserID:      seedUserID,
		Name:        projectName,
	})
	if err != nil {
		log.Fatalf("failed to create project: %v", err)
	}

	for i, seed := range seeds {
		discussion, err := containers.Learning.CreateDiscussion.Execute(ctx, usecase.CreateDiscussionInput{
			WorkspaceID: seedWorkspaceID,
			ProjectID:   project.ID(),
			Theme:       seed.Theme,
			Premise:     seed.Premise,
			Status:      domain.DiscussionStatusPrivate,
			UserID:      seedUserID,
		})
		if err != nil {
			log.Fatalf("failed to create discussion %d: %v", i+1, err)
		}

		comments, err := containers.Learning.ReplaceComments.Execute(ctx, usecase.ReplaceCommentsInput{
			DiscussionID: discussion.ID(),
			WorkspaceID:  seedWorkspaceID,
			UserID:       seedUserID,
			Comments:     seed.Comments,
		})
		if err != nil {
			log.Fatalf("failed to replace comments for discussion %s: %v", discussion.ID(), err)
		}

		fmt.Printf("seeded discussion %d: %s (comments=%d)\n", i+1, discussion.ID(), len(comments))
	}

	fmt.Printf("seed completed successfully (workspace=%s, project=%s)\n", seedWorkspaceID, project.ID())
}

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
	Comments []CommentItem
}

type CommentItem usecase.ReplaceCommentItem

var seeds = []discussionSeed{
	{
		Theme:   "映画やアニメを倍速で視聴する行為は、作品に対するリスペクトに欠ける悪習か？",
		Premise: "近年、動画配信サービスにおいて倍速視聴機能が一般化し、日常的に利用する視聴者が増加している。",
		Comments: []CommentItem{
			{
				ParentIndex: nil,
				CommentType: "主張",
				Content:     "悪習である。",
			},
			// [1] 第2階層：根拠
			{
				ParentIndex: new(0),
				CommentType: "根拠",
				Content:     "クリエイターが意図した「間」や「テンポ」といった映像芸術としての表現が破壊されてしまうからだ。",
			},
			// [2] 第3階層：懸念
			{
				ParentIndex: new(1),
				CommentType: "懸念",
				Content:     "しかし現代の視聴者は可処分時間が限られている。等倍速を強制すると「全く見ない」という選択になり、かえって作品に触れる機会が失われるのではないか。",
			},
			// [3] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(2),
				CommentType: "応答",
				Content:     "見る機会が増えたとしても、あらすじを追うだけの作業になってしまうのであれば、それは本来の鑑賞とは呼べず本末転倒である。",
			},
			// [4] 第3階層：懸念（別の角度から）
			{
				ParentIndex: new(1),
				CommentType: "懸念",
				Content:     "全ての作品が「間」を重視する芸術作品というわけではない。情報収集や暇つぶしが目的のコンテンツもあるのではないか。",
			},
			// [5] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(4),
				CommentType: "応答",
				Content:     "確かに情報収集目的の動画であれば倍速でも問題ないが、感情を伴う映画やアニメにおいてはやはり等倍速が望ましい。",
			},

			// ----------------------------------------------------
			// ツリー2：「悪習ではない」という立場
			// ----------------------------------------------------
			// [6] 第1階層：主張 (ルート)
			{
				ParentIndex: nil,
				CommentType: "主張",
				Content:     "悪習ではない。",
			},
			// [7] 第2階層：根拠
			{
				ParentIndex: new(6),
				CommentType: "根拠",
				Content:     "視聴方法の選択権は視聴者にあり、本を自分のペースで読むように、映像も自分のペースで楽しむ自由があるからだ。",
			},
			// [8] 第3階層：懸念
			{
				ParentIndex: new(7),
				CommentType: "懸念",
				Content:     "本とは異なり、映像や音楽は「時間軸」そのものが作品を構成する重要な要素であるため、ペースを変えるのは作品の改変にあたるのではないか。",
			},
			// [9] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(8),
				CommentType: "応答",
				Content:     "時間芸術であることは事実だが、プラットフォーム側が機能として提供している以上、ユーザーが快適な速度に調節して楽しむ権利は保証されるべきだ。",
			},
			//[10] 第2階層：根拠（別の理由）
			{
				ParentIndex: new(6),
				CommentType: "根拠",
				Content:     "倍速視聴によってより多くの作品に触れることができ、結果的にクリエイターへの還元やファンダムの拡大に繋がるからだ。",
			},
			// [11] 第3階層：懸念
			{
				ParentIndex: new(10),
				CommentType: "懸念",
				Content:     "倍速で「こなす」だけの視聴態度が定着すると、作品を深く味わう文化が衰退し、ファストコンテンツばかりが優遇される土壌にならないか。",
			},
			// [12] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(11),
				CommentType: "応答",
				Content:     "文化の変容は避けられないが、本当に優れた作品であれば倍速で見た後でも「もう一度等倍でじっくり見たい」と思わせる力があるはずだ。",
			},

			// ----------------------------------------------------
			// ツリー3：「一概には言えない」という立場
			// ----------------------------------------------------
			// [13] 第1階層：主張 (ルート)
			{
				ParentIndex: nil,
				CommentType: "主張",
				Content:     "一概に悪習とは言えず、目的や作品の性質によって許容されるべきだ。",
			},
			// [14] 第2階層：根拠
			{
				ParentIndex: new(13),
				CommentType: "根拠",
				Content:     "教養やストーリーの把握を目的とした「インプット」と、純粋なエンターテインメントとしての「鑑賞」は分けて考えるのが合理的だからだ。",
			},
			// [15] 第3階層：懸念
			{
				ParentIndex: new(14),
				CommentType: "懸念",
				Content:     "視聴前に作品の性質を完璧に判断することは不可能であり、倍速にすることで名作の「真の面白さ」を見落とすリスクがあるのではないか。",
			},
			//[16] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(15),
				CommentType: "応答",
				Content:     "そのリスクは許容しつつ、SNSの評判やあらすじ等の事前情報をもとに、視聴者が自己責任で視聴スタイルを選択すればよい。",
			},
			// [17] 第2階層：根拠（別の理由）
			{
				ParentIndex: new(13),
				CommentType: "根拠",
				Content:     "現代の長編アニメや連続ドラマの中には、展開が引き伸ばされているものもあり、倍速化が視聴体験を最適化するケースもあるからだ。",
			},
			// [18] 第3階層：懸念
			{
				ParentIndex: new(17),
				CommentType: "懸念",
				Content:     "視聴者が最初から倍速を前提としてしまうと、製作者側も「倍速で消費される前提」の詰め込み型の単調な作品しか作らなくなるのではないか。",
			},
			// [19] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(18),
				CommentType: "応答",
				Content:     "制作者と視聴者のイタチごっこになる側面はあるが、多様な速度に対応できる分かりやすさも、現代のエンタメにおける一つの進化の形だと言える。",
			},
		},
	},
	{
		Theme:   "ゾンビパンデミックが起きた時の「最初の3日間」の最適行動",
		Premise: "もし明日ゾンビが街に溢れたら...。生存率の最も高い行動を議論する。",
		Comments: []CommentItem{
			{
				ParentIndex: nil,
				CommentType: "方針",
				Content:     "最初の3日間は自宅に籠城するべきだ。",
			},
			{
				ParentIndex: new(0),
				CommentType: "利点",
				Content:     "移動中の遭遇を避けられる。",
			},
			{
				ParentIndex: new(1),
				CommentType: "懸念",
				Content:     "食料が少ない家は3日も持たない。",
			},
			{
				ParentIndex: new(2),
				CommentType: "対処",
				Content:     "3日分ない家だけ短時間の近隣調達を検討する。",
			},
			{
				ParentIndex: new(0),
				CommentType: "利点",
				Content:     "自宅は地形と物資の場所を把握している。",
			},
			{
				ParentIndex: new(4),
				CommentType: "懸念",
				Content:     "集合住宅は侵入経路が多い。",
			},

			{
				ParentIndex: nil,
				CommentType: "方針",
				Content:     "初日のうちに郊外へ移動するべきだ。",
			},
			{
				ParentIndex: new(7),
				CommentType: "利点",
				Content:     "人口密度が低い地域は接触数が減る。",
			},
			{
				ParentIndex: new(8),
				CommentType: "懸念",
				Content:     "主要道路は渋滞で止まりやすい。",
			},
			{
				ParentIndex: new(9),
				CommentType: "対処",
				Content:     "車より自転車と徒歩の経路を優先する。",
			},
			{
				ParentIndex: new(7),
				CommentType: "利点",
				Content:     "農地や井戸に近づきやすい。",
			},
			{
				ParentIndex: new(11),
				CommentType: "懸念",
				Content:     "不案内な土地では補給地点を見失う。",
			},
			{
				ParentIndex: new(12),
				CommentType: "対処",
				Content:     "行き先を知る人とだけ同行する。",
			},

			{
				ParentIndex: nil,
				CommentType: "方針",
				Content:     "72時間は小規模な信頼集団で行動するべきだ。",
			},
			{
				ParentIndex: new(14),
				CommentType: "利点",
				Content:     "見張りを交代できる。",
			},
			{
				ParentIndex: new(15),
				CommentType: "懸念",
				Content:     "人数が増えるほど意思決定が遅くなる。",
			},
			{
				ParentIndex: new(16),
				CommentType: "対処",
				Content:     "初日に指揮役を1人だけ決める。",
			},
			{
				ParentIndex: new(14),
				CommentType: "利点",
				Content:     "けが人を補助できる。",
			},
			{
				ParentIndex: new(18),
				CommentType: "懸念",
				Content:     "未確認者の受け入れは感染を持ち込む。",
			},
			{
				ParentIndex: new(19),
				CommentType: "対処",
				Content:     "合流前に隔離確認を行う。",
			},
		},
	},
	{
		Theme:   "地球外の知的生命体（宇宙人）からコンタクトがあった場合、人類が最初にとるべき態度は「徹底的な友好的アピール」か「適度な警戒と軍事力の誇示」か？",
		Premise: "相手の意図（侵略目的か、純粋な友好的交流か）は全く不明であり、相手の科学レベルも未知数である。",
		Comments: []CommentItem{
			{
				ParentIndex: nil,
				CommentType: "態度",
				Content:     "人類は最初に徹底的な友好的アピールを示すべきだ。",
			},
			{
				ParentIndex: new(0),
				CommentType: "狙い",
				Content:     "誤解による先制攻撃の連鎖を避けやすい。",
			},
			{
				ParentIndex: new(1),
				CommentType: "危険",
				Content:     "弱さの表明として解釈される可能性がある。",
			},
			{
				ParentIndex: new(2),
				CommentType: "備え",
				Content:     "友好表明と同時に退避計画だけは水面下で整える。",
			},
			{
				ParentIndex: new(0),
				CommentType: "狙い",
				Content:     "交渉の窓口を早く作れる。",
			},
			{
				ParentIndex: new(4),
				CommentType: "危険",
				Content:     "窓口担当者が地球側の情報を与えすぎるおそれがある。",
			},
			{
				ParentIndex: new(5),
				CommentType: "備え",
				Content:     "最初に開示する情報を言語サンプルと儀礼的表現だけに限定する。",
			},

			{
				ParentIndex: nil,
				CommentType: "態度",
				Content:     "人類は最初に適度な警戒と軍事力の誇示を示すべきだ。",
			},
			{
				ParentIndex: new(7),
				CommentType: "狙い",
				Content:     "無防備ではないと明確に伝えられる。",
			},
			{
				ParentIndex: new(8),
				CommentType: "危険",
				Content:     "威嚇そのものが敵意として受け取られる可能性がある。",
			},
			{
				ParentIndex: new(9),
				CommentType: "備え",
				Content:     "兵器の照準ではなく防衛配備だけを可視化する。",
			},
			{
				ParentIndex: new(7),
				CommentType: "狙い",
				Content:     "各国が国内の治安維持を優先しやすい。",
			},
			{
				ParentIndex: new(11),
				CommentType: "危険",
				Content:     "国内向けの強硬演出が外交判断を硬直させる。",
			},
			{
				ParentIndex: new(12),
				CommentType: "備え",
				Content:     "軍の発信を文民政府の単一声明に統一する。",
			},

			{
				ParentIndex: nil,
				CommentType: "態度",
				Content:     "人類は最初の態度を固定せず観測と防御準備を優先するべきだ。",
			},
			{
				ParentIndex: new(14),
				CommentType: "狙い",
				Content:     "相手の通信様式と行動規則を測る時間を確保できる。",
			},
			{
				ParentIndex: new(15),
				CommentType: "危険",
				Content:     "曖昧な沈黙が拒絶として受け取られるかもしれない。",
			},
			{
				ParentIndex: new(16),
				CommentType: "備え",
				Content:     "観測期間の長さだけは先に簡潔に通告する。",
			},
			{
				ParentIndex: new(14),
				CommentType: "狙い",
				Content:     "拙速に地球代表を自称する失敗を避けられる。",
			},
			{
				ParentIndex: new(18),
				CommentType: "危険",
				Content:     "判断保留の間に現場が独断で接触する可能性がある。",
			},
			{
				ParentIndex: new(19),
				CommentType: "備え",
				Content:     "接触権限を国際機関の暫定指揮所に集約する。",
			},
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

		commentItems := make([]usecase.ReplaceCommentItem, len(seed.Comments))
		for j, c := range seed.Comments {
			commentItems[j] = usecase.ReplaceCommentItem(c)
		}
		comments, err := containers.Learning.ReplaceComments.Execute(ctx, usecase.ReplaceCommentsInput{
			DiscussionID: discussion.ID(),
			WorkspaceID:  seedWorkspaceID,
			UserID:       seedUserID,
			Comments:     commentItems,
		})
		if err != nil {
			log.Fatalf("failed to replace comments for discussion %s: %v", discussion.ID(), err)
		}

		fmt.Printf("seeded discussion %d: %s (comments=%d)\n", i+1, discussion.ID(), len(comments))
	}

	fmt.Printf("seed completed successfully (workspace=%s, project=%s)\n", seedWorkspaceID, project.ID())
}

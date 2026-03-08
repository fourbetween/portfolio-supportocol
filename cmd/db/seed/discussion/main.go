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
		Theme:   "映画やアニメをn倍速で視聴する行為は、作品に対するリスペクトに欠ける悪習か？",
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
		Theme:   "マンガやアニメの実写化において、原作のストーリーや設定を改変することは許容されるべきか？",
		Premise: "多くの作品が実写化される中で、原作に忠実な作品がある一方で、実写向けに大きく展開が変更される作品もあり、度々ファンの間で議論を呼んでいる。",
		Comments: []CommentItem{
			{
				ParentIndex: nil,
				CommentType: "主張",
				Content:     "原作のストーリーや設定の改変は、一切許容されるべきではない。",
			},
			// [1] 第2階層：根拠
			{
				ParentIndex: new(0),
				CommentType: "根拠",
				Content:     "実写化の本来の目的は原作の魅力を映像で再現することであり、不要な改変は作品を愛するファンへの裏切りになるからだ。",
			},
			// [2] 第3階層：懸念
			{
				ParentIndex: new(1),
				CommentType: "懸念",
				Content:     "マンガと実写ではメディアが異なり表現や尺に限界がある。数十巻の長編を2時間の映画に収めるための省略や統合も許されないのか？",
			},
			// [3] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(2),
				CommentType: "応答",
				Content:     "尺に合わせた省略は仕方ないとしても、テーマやキャラクターの性格といった「芯」を変えるのは別作品を作るのと同じであり、オリジナルタイトルでやるべきだ。",
			},
			// [4] 第2階層：根拠（別の理由）
			{
				ParentIndex: new(0),
				CommentType: "根拠",
				Content:     "過去に無理な改変によって既存ファンが離れ、原作のブランド価値そのものを大きく傷つけた「失敗作」が数多く存在するからだ。",
			},
			// [5] 第3階層：懸念
			{
				ParentIndex: new(4),
				CommentType: "懸念",
				Content:     "失敗例がある一方で、実写向けの大胆な改変によって新規層を取り込み、結果的に原作コミックの売上に大きく貢献した成功例もあるのではないか？",
			},
			// [6] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(5),
				CommentType: "応答",
				Content:     "一時的な話題性や売上の恩恵があったとしても、既存ファンを蔑ろにしてSNS等で炎上すれば、長期的な作品への信頼は失われてしまうリスクの方が高い。",
			},

			// ----------------------------------------------------
			// ツリー2：「許容されるべきである」という立場
			// ----------------------------------------------------
			// [7] 第1階層：主張 (ルート)
			{
				ParentIndex: nil,
				CommentType: "主張",
				Content:     "実写化における改変は、許容されるべきである。",
			},
			// [8] 第2階層：根拠
			{
				ParentIndex: new(7),
				CommentType: "根拠",
				Content:     "権利を持つ原作者や出版社がビジネスとして許可を出している以上、別メディアにおける制作陣の自由な表現として受け入れるのが筋だからだ。",
			},
			// [9] 第3階層：懸念
			{
				ParentIndex: new(8),
				CommentType: "懸念",
				Content:     "原作者が必ずしも心から納得しているとは限らず、座組の力関係やスケジュールの都合で、不本意な改変を飲まされているケースもあるのではないか？",
			},
			// [10] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(9),
				CommentType: "応答",
				Content:     "契約上の不透明さや原作者の保護は業界が解決すべきビジネス課題であり、公式ライセンス作品である以上、視聴者が一律に「改変悪」と非難する正当な理由にはならない。",
			},
			// [11] 第2階層：根拠（別の理由）
			{
				ParentIndex: new(7),
				CommentType: "根拠",
				Content:     "実写ならではの解釈やリアルな表現を付加し、原作を知らない一般層向けにローカライズすることが、わざわざ実写化する最大の意義だからだ。",
			},
			// [12] 第3階層：懸念
			{
				ParentIndex: new(11),
				CommentType: "懸念",
				Content:     "ローカライズの名目で改変しすぎると、本来の原作ファンが離れてしまい、結局「誰に向けて作られたのか分からない中途半端な作品」にならないか？",
			},
			// [13] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(12),
				CommentType: "応答",
				Content:     "ターゲットを「原作ファン」から「新規の一般層」へ明確にシフトさせているのであれば、一部のコアファンが離れたとしても、映画やドラマとしては十分に成立する。",
			},

			// ----------------------------------------------------
			// ツリー3：「条件付きで許容される」という立場
			// ----------------------------------------------------
			//[14] 第1階層：主張 (ルート)
			{
				ParentIndex: nil,
				CommentType: "主張",
				Content:     "「原作のコア（本質）」を守っているかどうかが条件であり、表面的な設定変更の有無だけでは判断できない。",
			},
			// [15] 第2階層：根拠
			{
				ParentIndex: new(14),
				CommentType: "根拠",
				Content:     "設定や展開が多少変わっていても、作品の伝えたいメッセージやキャラクターの感情線が一致していれば、映像作品として良作になることが多いからだ。",
			},
			// [16] 第3階層：懸念
			{
				ParentIndex: new(15),
				CommentType: "懸念",
				Content:     "「原作のコア」の解釈は読者一人ひとりで異なるため基準が非常に曖昧であり、結局は個人の好みの問題に帰結してしまうのではないか？",
			},
			// [17] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(16),
				CommentType: "応答",
				Content:     "全員が納得する基準はないが、だからこそ原作者を脚本監修として巻き込むなどして「公式なコア」を定義し、それを軸に制作するアプローチが有効になる。",
			},
			// [18] 第2階層：根拠（別の理由）
			{
				ParentIndex: new(14),
				CommentType: "根拠",
				Content:     "逆に、ビジュアルや設定だけを完璧にトレースしていても、映像としての演出が伴わず「ただのコスプレ大会」のような失敗作になることもあるからだ。",
			},
			// [19] 第3階層：懸念
			{
				ParentIndex: new(18),
				CommentType: "懸念",
				Content:     "見た目の再現度を無視して大胆な改変を行うと、公開前のプロモーション時点でファンからの猛反発に遭い、正当な評価すらされないリスクがあるのでは？",
			},
			//[20] 第4階層：応答（ここで打ち止め）
			{
				ParentIndex: new(19),
				CommentType: "応答",
				Content:     "初動の難しさはあるが、映像作品としての完成度が高ければ、公開後に口コミ等で評価が反転し、最終的に支持を得ることは過去の事例からも十分に可能だ。",
			},
		},
	},
	{
		Theme:   "ゾンビパンデミックが起きた時の「最初の3日間」の最適行",
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
				ParentIndex: new(5),
				CommentType: "対処",
				Content:     "出入口が少ない区画だけ防衛地点にする。",
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

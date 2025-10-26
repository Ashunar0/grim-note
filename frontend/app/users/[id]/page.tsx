import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";

const DUMMY_USER = {
  userId: "1",
  userName: "読書太郎",
  bio: "本が好きで毎日読書をしています。特に日本文学と海外ミステリーが好きです。",
  avatar: "",
  isOwnProfile: true,
  isFollowing: false,
  followerCount: 45,
  followingCount: 32,
  postCount: 28,
};

const USER_POSTS = [
  {
    id: "1",
    bookTitle: "人間失格",
    author: "太宰治",
    content:
      "太宰治の代表作。主人公の葉蔵の人生を通して、人間の本質や社会との関わり方について深く考えさせられました。読み終えた後も、この作品が持つ重みが心に残り続けています。",
    rating: 4.5,
    tags: ["日本文学", "純文学", "太宰治"],
    userName: DUMMY_USER.userName,
    userId: DUMMY_USER.userId,
    likes: 12,
    isLiked: false,
  },
  {
    id: "4",
    bookTitle: "こころ",
    author: "夏目漱石",
    content:
      "夏目漱石の代表作の一つ。人間の心の複雑さ、友情と裏切り、そして罪の意識について描かれています。「先生」と「私」の関係性が非常に興味深かったです。",
    rating: 4.0,
    tags: ["日本文学", "明治", "夏目漱石"],
    userName: DUMMY_USER.userName,
    userId: DUMMY_USER.userId,
    likes: 8,
    isLiked: false,
  },
];

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-6">
        <ProfileHeader {...DUMMY_USER} />

        <div className="space-y-4">
          <h2 className="text-xl font-bold">投稿一覧</h2>
          {USER_POSTS.length > 0 ? (
            USER_POSTS.map((post) => <PostCard key={post.id} {...post} />)
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              まだ投稿がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

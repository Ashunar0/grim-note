require "set"

class UserProfileSerializer
  def initialize(user:, viewer:)
    @user = user
    @viewer = viewer
  end

  def as_json
    {
      id: user.id,
      name: user.name,
      bio: user.bio,
      icon_url: user.icon_url,
      follower_count: follower_count,
      following_count: following_count,
      post_count: post_count,
      is_self: is_self?,
      is_following: is_following?,
      posts: serialized_posts
    }
  end

  private

  attr_reader :user, :viewer

  def serialized_posts
    posts.map do |post|
      PostSerializer.new(
        post: post,
        current_user: viewer,
        liked_post_ids: liked_post_ids
      ).as_json
    end
  end

  def posts
    @posts ||= user.posts.with_like_stats.order(created_at: :desc)
  end

  def liked_post_ids
    return @liked_post_ids if defined?(@liked_post_ids)

    @liked_post_ids =
      if viewer
        viewer.likes.where(post_id: posts.map(&:id)).pluck(:post_id).to_set
      else
        Set.new
      end
  end

  def follower_count
    @follower_count ||= user.received_follows.count
  end

  def following_count
    @following_count ||= user.given_follows.count
  end

  def post_count
    @post_count ||= user.posts.count
  end

  def is_self?
    viewer&.id == user.id
  end

  def is_following?
    return false unless viewer
    return false if viewer.id == user.id

    viewer.following_users.exists?(id: user.id)
  end
end

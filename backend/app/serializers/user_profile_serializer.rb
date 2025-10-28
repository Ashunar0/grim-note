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
      {
        id: post.id,
        body: post.body,
        rating: post.rating,
        read_at: post.read_at,
        created_at: post.created_at,
        likes_count: post.likes_count,
        book: serialize_book(post.book),
        tags: post.tags.map { |tag| { id: tag.id, name: tag.name } }
      }
    end
  end

  def serialize_book(book)
    return unless book

    {
      id: book.id,
      title: book.title,
      authors: book.authors,
      published_year: book.published_year
    }
  end

  def posts
    @posts ||= user.posts
                   .includes(:book, :tags)
                   .left_outer_joins(:likes)
                   .select("posts.*, COUNT(DISTINCT likes.id) AS likes_count")
                   .group("posts.id")
                   .order(created_at: :desc)
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

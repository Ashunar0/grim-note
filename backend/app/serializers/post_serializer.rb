class PostSerializer
  def initialize(post:, current_user:, liked_post_ids: nil)
    @post = post
    @current_user = current_user
    @liked_post_ids = liked_post_ids
  end

  def as_json
    {
      id: post.id,
      body: post.body,
      rating: post.rating,
      read_at: post.read_at,
      created_at: post.created_at,
      likes_count: post.likes_count,
      is_liked: liked_by_current_user?,
      user: {
        id: post.user.id,
        name: post.user.name
      },
      book: serialize_book,
      tags: post.tags.map { |tag| { id: tag.id, name: tag.name } }
    }
  end

  private

  attr_reader :post, :current_user, :liked_post_ids

  def serialize_book
    return unless post.book

    {
      id: post.book.id,
      title: post.book.title,
      authors: post.book.authors,
      published_year: post.book.published_year
    }
  end

  def liked_by_current_user?
    return false unless current_user

    if liked_post_ids
      liked_post_ids.include?(post.id)
    else
      current_user.likes.where(post_id: post.id).exists?
    end
  end
end

require "test_helper"

class PostTest < ActiveSupport::TestCase
  test "is invalid without body" do
    post = posts(:alice_post).dup
    post.body = ""

    assert_not post.valid?
    assert_includes post.errors[:body], "can't be blank"
  end

  test "is invalid when rating is outside the allowed range" do
    post = posts(:alice_post).dup
    post.rating = 6

    assert_not post.valid?
    assert_includes post.errors[:rating], "is not included in the list"
  end

  test ".with_like_stats preloads likes_count" do
    post = Post.with_like_stats.find(posts(:alice_post).id)

    assert_equal 1, post.likes_count
    assert_equal 1, post.read_attribute(:likes_count).to_i
  end
end

class Follow < ApplicationRecord
  self.primary_key = nil

  belongs_to :follower, class_name: "User"
  belongs_to :followee, class_name: "User"

  validates :followee_id, uniqueness: { scope: :follower_id }
  validate :prevent_self_follow

  private

  def prevent_self_follow
    return unless follower_id.present? && follower_id == followee_id

    errors.add(:followee_id, "cannot be the same as follower")
  end
end

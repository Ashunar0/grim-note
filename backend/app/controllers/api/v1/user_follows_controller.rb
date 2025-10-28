module Api
  module V1
    class UserFollowsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_target_user

      def create
        if current_user == @target_user
          return render_error(code: "INVALID_OPERATION", message: "自分はフォローできません", status: :unprocessable_entity)
        end

        follow = current_user.given_follows.find_or_initialize_by(followee: @target_user)
        status = follow.persisted? ? :ok : :created
        follow.save! unless follow.persisted?

        render_success(data: follow_payload, status: status)
      end

      def destroy
        current_user.given_follows.where(followee: @target_user).delete_all

        render_success(data: follow_payload)
      end

      private

      def set_target_user
        @target_user = User.find_by(id: params[:user_id])
        return if @target_user

        render_error(code: "NOT_FOUND", message: "ユーザーが見つかりません", status: :not_found)
      end

      def follow_payload
        {
          user_id: @target_user.id,
          follower_count: @target_user.received_follows.count,
          following_count: current_user.given_follows.count,
          is_following: current_user.following_users.exists?(id: @target_user.id)
        }
      end
    end
  end
end

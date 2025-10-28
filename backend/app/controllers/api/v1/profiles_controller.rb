module Api
  module V1
    class ProfilesController < ApplicationController
      before_action :authenticate_user!

      def update
        if updating_other_user?
          render_error(
            code: "FORBIDDEN",
            message: "自分のプロフィールのみ編集できます",
            status: :forbidden
          )
          return
        end

        current_user.update!(profile_params)
        render_success(data: serialize_profile(current_user))
      end

      private

      def profile_params
        params.permit(:name, :bio, :icon_url)
      end

      def updating_other_user?
        target_id = params[:id] || params.dig(:profile, :id)
        target_id.present? && target_id.to_i != current_user.id
      end

      def serialize_profile(user)
        UserProfileSerializer.new(user: user, viewer: current_user).as_json
      end
    end
  end
end

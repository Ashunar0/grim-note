module Api
  module V1
    class UsersController < ApplicationController
      def create
        attributes = user_params.to_h
        user = User.new(attributes.slice("name", "email"))
        user.password = attributes["password"]

        if user.save
          session[:user_id] = user.id
          render_success(
            data: {
              id: user.id,
              name: user.name,
              email: user.email
            },
            status: :created
          )
        else
          render_error(
            code: "VALIDATION_ERROR",
            message: user.errors.full_messages.first || "登録に失敗しました",
            status: :unprocessable_entity,
            errors: user.errors.full_messages
          )
        end
      end

      private

      def user_params
        params.permit(:name, :email, :password)
      end
    end
  end
end

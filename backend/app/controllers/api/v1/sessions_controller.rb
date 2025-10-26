module Api
  module V1
    class SessionsController < ApplicationController
      def create
        credentials = login_params
        user = User.find_by(email: credentials[:email]&.downcase)

        if user&.authenticate(credentials[:password])
          session[:user_id] = user.id
          render_success(
            data: {
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            }
          )
        else
          render_error(
            code: "UNAUTHORIZED",
            message: "メールアドレスまたはパスワードが正しくありません",
            status: :unauthorized
          )
        end
      end

      def destroy
        reset_session
        render_success(data: { message: "ログアウトしました" })
      end

      private

      def login_params
        params.permit(:email, :password)
      end
    end
  end
end

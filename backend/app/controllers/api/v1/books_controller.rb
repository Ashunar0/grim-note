module Api
  module V1
    class BooksController < ApplicationController
      before_action :authenticate_user!

      def search
        query = params[:q].to_s.strip

        if query.blank?
          render_error(code: "VALIDATION_ERROR", message: "検索キーワードは必須です", status: :bad_request)
          return
        end

        results = GoogleBooks::SearchService.call(query)
        render_success(data: results)
      rescue GoogleBooks::SearchService::Error => e
        Rails.logger.error { "[GoogleBooks] search failed: #{e.full_message(highlight: false)}" }
        render_error(code: "SERVER_ERROR", message: "外部サービスでエラーが発生しました", status: :internal_server_error)
      end
    end
  end
end

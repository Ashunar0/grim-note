module Api
  module V1
    class ReportsController < ApplicationController
      def create
        form = ReportForm.new(report_params)

        unless form.valid?
          return render_error(
            code: "VALIDATION_ERROR",
            message: form.errors.full_messages.first,
            status: :unprocessable_entity,
            errors: form.errors.full_messages
          )
        end

        Reports::Dispatcher.new(form.attributes).deliver!

        render_success(data: { message: "報告を受け付けました" })
      rescue Reports::Dispatcher::Error => e
        Rails.logger.error("[Reports] dispatch failed: #{e.message}")
        render_error(
          code: "SERVER_ERROR",
          message: "送信に失敗しました。時間を置いて再度お試しください。",
          status: :internal_server_error
        )
      end

      private

      def report_params
        params.permit(:post_id, :category, :message, :email)
      end
    end
  end
end

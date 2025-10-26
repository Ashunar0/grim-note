class ApplicationController < ActionController::API
  include ActionController::Cookies

  rescue_from ActiveRecord::RecordInvalid, with: :render_record_invalid

  private

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = session[:user_id] && User.find_by(id: session[:user_id])
  end

  def authenticate_user!
    return if current_user

    render_error(code: "UNAUTHORIZED", message: "ログインが必要です", status: :unauthorized)
  end

  def render_success(data:, status: :ok)
    render json: { status: "success", data: data }, status: status
  end

  def render_error(code:, message:, status: :bad_request, errors: nil)
    payload = { status: "error", error: { code: code, message: message } }
    payload[:error][:details] = errors if errors.present?
    render json: payload, status: status
  end

  def render_record_invalid(exception)
    render_error(
      code: "VALIDATION_ERROR",
      message: exception.record.errors.full_messages.first,
      status: :unprocessable_entity,
      errors: exception.record.errors.full_messages
    )
  end
end

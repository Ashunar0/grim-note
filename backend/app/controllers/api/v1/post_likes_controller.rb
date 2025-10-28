module Api
  module V1
    class PostLikesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_post

      def create
        like = current_user.likes.find_or_initialize_by(post: @post)
        status = like.persisted? ? :ok : :created
        like.save! unless like.persisted?

        render_success(data: serialize_post(@post), status: status)
      end

      def destroy
        like = current_user.likes.find_by(post: @post)
        like&.destroy!

        render_success(data: serialize_post(@post))
      end

      private

      def set_post
        @post = Post.with_like_stats.find_by(id: params[:post_id])
        return if @post

        render_error(code: "NOT_FOUND", message: "投稿が見つかりません", status: :not_found)
      end

      def serialize_post(post)
        reloaded_post = Post.with_like_stats.find(post.id)
        PostSerializer.new(
          post: reloaded_post,
          current_user: current_user
        ).as_json
      end
    end
  end
end

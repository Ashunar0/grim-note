module Api
  module V1
    class PostsController < ApplicationController
      PER_PAGE = 10
      before_action :authenticate_user!, only: [:create]

      def index
        posts = timeline_scope
                 .order(created_at: :desc)
                 .limit(per_page)
                 .offset(offset_for_page)

        render_success(data: posts.map { |post| serialize_post(post) })
      end

      def show
        post = timeline_scope.find_by(id: params[:id])

        if post
          render_success(data: serialize_post(post))
        else
          render_error(code: "NOT_FOUND", message: "投稿が見つかりません", status: :not_found)
        end
      end

      def create
        service = Posts::CreateService.new(user: current_user, params: create_params)
        post = service.call
        render_success(data: serialize_created_post(post), status: :created)
      rescue ActiveRecord::RecordNotFound
        render_error(code: "VALIDATION_ERROR", message: "指定した書籍が見つかりません", status: :unprocessable_entity)
      rescue Posts::CreateService::Error => e
        render_error(code: "VALIDATION_ERROR", message: e.message, status: :unprocessable_entity)
      end

      private

      def per_page
        PER_PAGE
      end

      def page_number
        num = params[:page].to_i
        num = 1 if num < 1
        num
      end

      def offset_for_page
        (page_number - 1) * per_page
      end

      def timeline_scope
        Post
          .includes(:user, :book, :tags)
          .left_outer_joins(:likes)
          .select('posts.*, COUNT(DISTINCT likes.id) AS likes_count')
          .group('posts.id')
      end

      def serialize_post(post)
        {
          id: post.id,
          body: post.body,
          rating: post.rating,
          read_at: post.read_at,
          created_at: post.created_at,
          likes_count: post.likes_count,
          user: {
            id: post.user.id,
            name: post.user.name
          },
          book: post.book && {
            id: post.book.id,
            title: post.book.title,
            authors: post.book.authors,
            published_year: post.book.published_year
          },
          tags: post.tags.map { |tag| { id: tag.id, name: tag.name } }
        }
      end

      def serialize_created_post(post)
        {
          id: post.id,
          book_id: post.book_id,
          body: post.body,
          rating: post.rating,
          read_at: post.read_at,
          tags: post.tags.map(&:name)
        }
      end

      def create_params
        permitted = params.permit(
          :book_id,
          :body,
          :rating,
          :read_at,
          tags: [],
          book: [:google_books_id, :title, :authors, :isbn13, :published_year]
        )
        permitted.to_h
      end
    end
  end
end

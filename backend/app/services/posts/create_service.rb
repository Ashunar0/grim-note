module Posts
  class CreateService
    class Error < StandardError; end

    def initialize(user:, params:)
      @user = user
      @params = params.with_indifferent_access
    end

    def call
      raise Error, "User is required" unless @user

      Post.transaction do
        post = @user.posts.build(post_attributes)
        post.book = resolve_book if book_provided?
        post.save!
        post.tags = find_or_create_tags
        post.reload
      end
    end

    private

    def post_attributes
      @params.slice(:body, :rating, :read_at)
    end

    def book_provided?
      @params[:book_id].present? || book_params.present?
    end

    def resolve_book
      if @params[:book_id].present?
        Book.find(@params[:book_id])
      else
        find_or_create_book_from_params(book_params)
      end
    end

    def find_or_create_book_from_params(attrs)
      attrs = attrs.dup
      google_books_id = attrs[:google_books_id].presence
      isbn13 = attrs[:isbn13].presence

      book =
        if google_books_id
          Book.find_or_initialize_by(google_books_id: google_books_id)
        elsif isbn13
          Book.find_or_initialize_by(isbn13: isbn13)
        else
          Book.new
        end

      assign_if_present(book, :google_books_id, google_books_id)
      assign_if_present(book, :title, attrs[:title])
      assign_if_present(book, :authors, attrs[:authors])
      assign_if_present(book, :isbn13, isbn13)
      assign_if_present(book, :published_year, parse_integer(attrs[:published_year]))

      book.save!
      book
    end

    def assign_if_present(record, attribute, value)
      return if value.blank?

      record.public_send("#{attribute}=", value)
    end

    def parse_integer(value)
      return if value.blank?

      Integer(value)
    rescue ArgumentError
      raise Error, "published_year must be a number"
    end

    def find_or_create_tags
      names = normalized_tag_names
      return [] if names.empty?

      existing = Tag.where(name: names).index_by(&:name)

      names.map do |name|
        existing[name] || Tag.create!(name: name)
      end
    end

    def normalized_tag_names
      return [] unless @params[:tags].is_a?(Array)

      @params[:tags]
        .map { |tag| tag.to_s.strip.downcase }
        .reject(&:blank?)
        .uniq
    end

    def book_params
      raw = @params[:book]
      return {} unless raw.is_a?(Hash)

      raw.with_indifferent_access.slice(:google_books_id, :title, :authors, :isbn13, :published_year)
    end
  end
end

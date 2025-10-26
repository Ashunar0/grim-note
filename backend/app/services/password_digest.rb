require "securerandom"
require "digest"
require "active_support/security_utils"
require "active_support/core_ext/object/blank"

module PasswordDigest
  SEPARATOR = "$$".freeze

  module_function

  def generate(password)
    raise ArgumentError, "password must be present" if password.blank?

    salt = SecureRandom.hex(16)
    digest = Digest::SHA256.hexdigest("#{salt}#{password}")
    PasswordToken.new(salt, digest)
  end

  def valid?(stored_digest, password)
    return false if stored_digest.blank? || password.blank?

    parts = stored_digest.split(SEPARATOR, 2)
    return false unless parts.length == 2

    salt, digest = parts
    return false if salt.blank? || digest.blank?

    candidate = Digest::SHA256.hexdigest("#{salt}#{password}")
    return false unless digest.bytesize == candidate.bytesize

    ActiveSupport::SecurityUtils.secure_compare(candidate, digest)
  rescue ArgumentError
    false
  end

  class PasswordToken
    attr_reader :salt, :digest

    def initialize(salt, digest)
      @salt = salt
      @digest = digest
    end

    def to_s
      "#{salt}#{SEPARATOR}#{digest}"
    end
  end
end

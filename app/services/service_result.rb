# typed: strict

class ServiceResult
  extend T::Sig

  sig { returns(T::Boolean) }
  attr_reader :success

  sig { returns(T.nilable(ApplicationRecord)) }
  attr_reader :record

  sig { returns(T::Array[String]) }
  attr_reader :errors

  alias_method :success?, :success

  sig { params(success: T::Boolean, record: T.nilable(ApplicationRecord), errors: T::Array[String]).void }
  def initialize(success:, record: nil, errors: [])
    @success = success
    @record = record
    @errors = errors
  end

  sig { params(record: T.nilable(ApplicationRecord)).returns(ServiceResult) }
  def self.ok(record: nil)
    new(success: true, record: record)
  end

  sig { params(errors: T::Array[String]).returns(ServiceResult) }
  def self.fail(errors:)
    new(success: false, errors: errors)
  end
end

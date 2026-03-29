# typed: strict

class ServiceResult
  extend T::Sig

  sig { returns(T::Boolean) }
  attr_reader :success

  sig { returns(T.untyped) }
  attr_reader :record

  sig { returns(T::Array[String]) }
  attr_reader :errors

  alias_method :success?, :success

  sig { params(success: T::Boolean, record: T.untyped, errors: T::Array[String]).void }
  def initialize(success:, record: nil, errors: [])
    @success = success
    @record = record
    @errors = errors
  end

  sig { params(record: T.untyped).returns(ServiceResult) }
  def self.ok(record: nil)
    new(success: true, record: record)
  end

  sig { params(errors: T::Array[String]).returns(ServiceResult) }
  def self.fail(errors:)
    new(success: false, errors: errors)
  end
end

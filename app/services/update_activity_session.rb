# typed: strict

class UpdateActivitySession
  extend T::Sig

  sig {
    params(
      session: ActivitySession,
      scheduled_date: Date,
      start_time: T.nilable(String),
      end_time: T.nilable(String),
    ).returns(ServiceResult)
  }
  def self.call(session:, scheduled_date:, start_time: nil, end_time: nil)
    new(session: session, scheduled_date: scheduled_date, start_time: start_time, end_time: end_time).call
  end

  sig {
    params(
      session: ActivitySession,
      scheduled_date: Date,
      start_time: T.nilable(String),
      end_time: T.nilable(String),
    ).void
  }
  def initialize(session:, scheduled_date:, start_time: nil, end_time: nil)
    @session = session
    @scheduled_date = scheduled_date
    @start_time = start_time
    @end_time = end_time
  end

  sig { returns(ServiceResult) }
  def call
    if @session.update(scheduled_date: @scheduled_date, start_time: @start_time, end_time: @end_time)
      ServiceResult.ok(record: @session)
    else
      ServiceResult.fail(errors: @session.errors.full_messages)
    end
  end
end

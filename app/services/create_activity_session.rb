# typed: strict

class CreateActivitySession
  extend T::Sig

  sig {
    params(
      activity: Activity,
      scheduled_date: Date,
      status: String,
      start_time: T.nilable(String),
      end_time: T.nilable(String),
      notes: T.nilable(String),
    ).returns(ServiceResult)
  }
  def self.call(activity:, scheduled_date:, status: "confirmed", start_time: nil, end_time: nil, notes: nil)
    new(activity: activity, scheduled_date: scheduled_date, status: status, start_time: start_time, end_time: end_time, notes: notes).call
  end

  sig {
    params(
      activity: Activity,
      scheduled_date: Date,
      status: String,
      start_time: T.nilable(String),
      end_time: T.nilable(String),
      notes: T.nilable(String),
    ).void
  }
  def initialize(activity:, scheduled_date:, status: "confirmed", start_time: nil, end_time: nil, notes: nil)
    @activity = activity
    @scheduled_date = scheduled_date
    @status = status
    @start_time = start_time
    @end_time = end_time
    @notes = notes
  end

  sig { returns(ServiceResult) }
  def call
    session = @activity.activity_sessions.build(
      scheduled_date: @scheduled_date,
      status: @status,
      start_time: @start_time,
      end_time: @end_time,
      notes: @notes,
    )

    if session.save
      ServiceResult.ok(record: session)
    else
      ServiceResult.fail(errors: session.errors.full_messages)
    end
  end
end

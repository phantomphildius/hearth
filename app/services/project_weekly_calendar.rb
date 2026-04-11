# typed: strict

class ProjectWeeklyCalendar
  extend T::Sig

  CalendarEntryShape = T.type_alias {
    {
      kind: String,
      activity_id: Integer,
      session_id: T.nilable(Integer),
      scheduled_date: String,
      start_time: String,
      end_time: String,
      name: String,
      notes: T.nilable(String),
      children: T::Array[{ id: Integer, first_name: String, age: Integer }],
    }
  }

  sig { params(household: Household, week_start: Date).returns(T::Array[CalendarEntryShape]) }
  def self.call(household:, week_start:)
    new(household: household, week_start: week_start).call
  end

  sig { params(household: Household, week_start: Date).void }
  def initialize(household:, week_start:)
    @household = household
    @week_start = week_start
    @week_end = week_start + 6
  end

  sig { returns(T::Array[CalendarEntryShape]) }
  def call
    activities = @household.activities.active.includes(:children, :activity_sessions)
    activity_map = activities.index_by(&:id)

    # Load sessions from ALL household activities (including archived) to preserve history
    all_activity_ids = @household.activities.pluck(:id)
    sessions = ActivitySession
      .where(activity_id: all_activity_ids)
      .where(scheduled_date: @week_start..@week_end)
      .includes(:activity)

    session_keys = sessions.map { |s| [s.activity_id, s.scheduled_date] }.to_set

    entries = T.let([], T::Array[CalendarEntryShape])

    sessions.each do |session|
      activity = activity_map[session.activity_id] || session.activity
      entries << serialize_session(session, activity)
    end

    activities.each do |activity|
      activity.occurrences_between(@week_start, @week_end).each do |date|
        next if session_keys.include?([activity.id, date])

        entries << serialize_projection(activity, date)
      end
    end

    entries.sort_by { |e| [e[:scheduled_date], e[:start_time]] }
  end

  private

  sig { params(session: ActivitySession, activity: Activity).returns(CalendarEntryShape) }
  def serialize_session(session, activity)
    {
      kind: session.status,
      activity_id: T.must(activity.id),
      session_id: session.id,
      scheduled_date: session.scheduled_date.iso8601,
      start_time: T.must(session.resolved_start_time).strftime("%H:%M"),
      end_time: T.must(session.resolved_end_time).strftime("%H:%M"),
      name: activity.name,
      notes: session.notes,
      children: activity.children.map { |c| { id: c.id, first_name: c.first_name, age: c.age } },
    }
  end

  sig { params(activity: Activity, date: Date).returns(CalendarEntryShape) }
  def serialize_projection(activity, date)
    {
      kind: "projected",
      activity_id: T.must(activity.id),
      session_id: nil,
      scheduled_date: date.iso8601,
      start_time: T.must(activity.start_time).strftime("%H:%M"),
      end_time: T.must(activity.end_time).strftime("%H:%M"),
      name: activity.name,
      notes: nil,
      children: activity.children.map { |c| { id: c.id, first_name: c.first_name, age: c.age } },
    }
  end
end

# typed: strict

class ActivitiesController < ApplicationController
  extend T::Sig
  include HouseholdProps

  ActivityChildPropShape = T.type_alias { { id: Integer, first_name: String, age: Integer } }
  ActivityPropShape = T.type_alias {
    {
      id: Integer, name: String, day_of_week: T.nilable(Integer),
      day_of_week_name: T.nilable(String), start_time: T.nilable(String), end_time: T.nilable(String),
      duration_minutes: T.nilable(Integer), recurrence: String, starts_on: T.nilable(String),
      biweekly_anchor_date: T.nilable(String),
      notes: T.nilable(String), children: T::Array[ActivityChildPropShape],
      created_at: T.nilable(ActiveSupport::TimeWithZone), updated_at: T.nilable(ActiveSupport::TimeWithZone)
    }
  }

  before_action :set_household
  before_action :set_activity, only: [:show, :edit, :update, :destroy]

  sig { void }
  def index
    authorize Activity
    week_start = parse_week_start(params[:week_start])
    entries = ProjectWeeklyCalendar.call(household: @household, week_start: week_start)

    render(inertia: "Activities/Index", props: {
      household: household_props(@household),
      calendar_entries: entries,
      week_start: week_start.iso8601,
      activities: @household.activities.active.includes(:children).order(:name).map { |a| activity_props(a) },
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def show
    authorize @activity
    render(inertia: "Activities/Show", props: {
      household: household_props(@household),
      activity: activity_props(@activity),
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def new
    authorize Activity
    render(inertia: "Activities/New", props: {
      household: household_props(@household),
      children: @household.children.map { |c| child_props(c) },
      activity: Activity.defaults,
      errors: {},
    })
  end

  sig { void }
  def edit
    authorize @activity
    render(inertia: "Activities/Edit", props: {
      household: household_props(@household),
      children: @household.children.map { |c| child_props(c) },
      activity: activity_props(@activity).merge(child_ids: @activity.children.pluck(:id)),
      errors: {},
    })
  end

  def create
    @activity = @household.activities.build(activity_params)
    authorize @activity

    if @activity.save
      child_ids = Array(params.dig(:activity, :child_ids)).map(&:to_i)
      SyncActivityChildren.call(activity: @activity, child_ids: child_ids, household: @household)
      redirect_to(household_activities_path(@household), notice: "Activity created.")
    else
      render(inertia: "Activities/New", props: {
        household: household_props(@household),
        children: @household.children.map { |c| child_props(c) },
        activity: Activity.defaults,
        errors: @activity.errors.as_json,
      })
    end
  end

  sig { void }
  def update
    authorize @activity
    if @activity.update(activity_params)
      child_ids = Array(params.dig(:activity, :child_ids)).map(&:to_i)
      SyncActivityChildren.call(activity: @activity, child_ids: child_ids, household: @household)
      redirect_to(household_activities_path(@household), notice: "Activity updated.")
    else
      render(inertia: "Activities/Edit", props: {
        household: household_props(@household),
        children: @household.children.map { |c| child_props(c) },
        activity: activity_props(@activity).merge(child_ids: @activity.children.pluck(:id)),
        errors: @activity.errors.as_json,
      })
    end
  end

  sig { void }
  def destroy
    authorize @activity
    @activity.update!(archived_at: Time.current)
    redirect_to(household_activities_path(@household), notice: "Activity removed.")
  end

  private

  sig { params(param: T.untyped).returns(Date) }
  def parse_week_start(param)
    date = Date.parse(param.to_s)
    # Snap to Monday of the given date's week
    date - ((date.wday - 1) % 7)
  rescue ArgumentError, TypeError
    today = Date.today
    today - ((today.wday - 1) % 7)
  end

  sig { void }
  def set_household
    @household = current_user.households.find(params[:household_id])
  end

  sig { void }
  def set_activity
    @activity = @household.activities.find(params[:id])
  end

  sig { returns(ActionController::Parameters) }
  def activity_params
    params.expect(
      activity: [
        :name,
        :day_of_week,
        :start_time,
        :end_time,
        :duration_minutes,
        :recurrence,
        :starts_on,
        :biweekly_anchor_date,
        :notes,
      ],
    )
  end

  sig { params(activity: Activity).returns(ActivityPropShape) }
  def activity_props(activity)
    {
      id: activity.id,
      name: activity.name,
      day_of_week: activity.day_of_week,
      day_of_week_name: activity.day_of_week_name,
      start_time: activity.start_time&.strftime("%H:%M"),
      end_time: activity.end_time&.strftime("%H:%M"),
      duration_minutes: activity.duration_minutes,
      recurrence: activity.recurrence,
      starts_on: activity.starts_on&.iso8601,
      biweekly_anchor_date: activity.biweekly_anchor_date&.iso8601,
      notes: activity.notes,
      children: activity.children.map { |c| { id: c.id, first_name: c.first_name, age: c.age } },
      created_at: activity.created_at,
      updated_at: activity.updated_at,
    }
  end
end
